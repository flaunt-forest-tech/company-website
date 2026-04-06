import 'server-only';

import crypto from 'node:crypto';
import dns from 'node:dns/promises';
import { promises as fs } from 'node:fs';
import path from 'node:path';

import {
  formatRedisError,
  getSharedRedisClient,
  resetSharedRedisClient,
  type SharedRedisClient,
} from '@/lib/redis';
import { formatClientIpLabel } from '@/lib/request-ip';

export type AnalyticsPageStat = {
  path: string;
  views: number;
};

export type AnalyticsLabelStat = {
  label: string;
  value: number;
};

export type AnalyticsDayStat = {
  date: string;
  totalViews: number;
  uniqueVisitors: number;
  pages: AnalyticsPageStat[];
  sources: AnalyticsLabelStat[];
  locations: AnalyticsLabelStat[];
  companies: AnalyticsLabelStat[];
  utmSources: AnalyticsLabelStat[];
  campaigns: AnalyticsLabelStat[];
  ctaClicks: AnalyticsLabelStat[];
  leadPages: AnalyticsLabelStat[];
  devices: AnalyticsLabelStat[];
  contactSubmissions: number;
  inquiryTypes: AnalyticsLabelStat[];
};

export type AnalyticsVisitorRecord = {
  id: string;
  ipAddress: string | null;
  firstSeenAt: string;
  lastSeenAt: string;
  source: string;
  location: string | null;
  company: string | null;
  hostname: string | null;
  isp: string | null;
  networkAsn: string | null;
  networkType: string | null;
  networkService: string | null;
  device: string;
  utmSource: string | null;
  utmCampaign: string | null;
  lastInquiryType: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  viewCount: number;
  conversionCount: number;
  pages: AnalyticsPageStat[];
  recentPages: string[];
};

export type AnalyticsSnapshot = {
  generatedAt: string;
  source: 'redis' | 'file';
  today: AnalyticsDayStat;
  recentDays: AnalyticsDayStat[];
  topPagesToday: AnalyticsPageStat[];
  topPagesLast14Days: AnalyticsPageStat[];
  topSourcesLast14Days: AnalyticsLabelStat[];
  locationBreakdownLast14Days: AnalyticsLabelStat[];
  companyBreakdownLast14Days: AnalyticsLabelStat[];
  utmSourceBreakdownLast14Days: AnalyticsLabelStat[];
  campaignBreakdownLast14Days: AnalyticsLabelStat[];
  topCtaClicksLast14Days: AnalyticsLabelStat[];
  topLeadPagesLast14Days: AnalyticsLabelStat[];
  deviceBreakdownLast14Days: AnalyticsLabelStat[];
  inquiryBreakdownLast14Days: AnalyticsLabelStat[];
  contactSubmissionsLast14Days: number;
  conversionRateLast14Days: number;
  recentVisitors: AnalyticsVisitorRecord[];
};

type FileAnalyticsVisitorRecord = {
  id: string;
  ipAddress?: string | null;
  firstSeenAt: string;
  lastSeenAt: string;
  source?: string;
  location?: string | null;
  company?: string | null;
  hostname?: string | null;
  isp?: string | null;
  networkAsn?: string | null;
  networkType?: string | null;
  networkService?: string | null;
  device?: string;
  utmSource?: string | null;
  utmCampaign?: string | null;
  lastInquiryType?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  viewCount: number;
  conversionCount: number;
  pages: Record<string, number>;
  recentPages: string[];
};

type CachedIpIntelligence = {
  ipAddress: string;
  hostname?: string | null;
  isp?: string | null;
  networkAsn?: string | null;
  company?: string | null;
  networkType?: string | null;
  networkService?: string | null;
  fetchedAt: string;
  source: 'headers' | 'ipwho.is';
};

type FileAnalyticsStore = {
  daily: Record<
    string,
    {
      totalViews: number;
      uniqueVisitors: string[];
      pages: Record<string, number>;
      sources?: Record<string, number>;
      locations?: Record<string, number>;
      companies?: Record<string, number>;
      utmSources?: Record<string, number>;
      campaigns?: Record<string, number>;
      ctaClicks?: Record<string, number>;
      leadPages?: Record<string, number>;
      devices?: Record<string, number>;
      conversions?: Record<string, number>;
      inquiryTypes?: Record<string, number>;
    }
  >;
  visitors?: Record<string, FileAnalyticsVisitorRecord>;
  ipIntel?: Record<string, CachedIpIntelligence>;
};

const ANALYTICS_STORE_PATH = path.join(process.cwd(), 'data', 'analytics-store.json');
const ANALYTICS_TTL_SECONDS = 60 * 60 * 24 * 120;
const RECENT_VISITOR_FETCH_LIMIT = 80;
const HOSTNAME_LOOKUP_TIMEOUT_MS = 1200;
const ANALYTICS_TIME_ZONE = 'America/Chicago';
const hostnameCache = new Map<string, string | null>();
const analyticsDateKeyFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: ANALYTICS_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

function normalizePath(pathname: string): string | null {
  const cleanPath = pathname.split('?')[0]?.trim() || '/';

  if (
    !cleanPath ||
    cleanPath.startsWith('/api') ||
    cleanPath.startsWith('/admin') ||
    cleanPath.startsWith('/_next') ||
    cleanPath === '/favicon.ico' ||
    /\.[a-z0-9]+$/i.test(cleanPath)
  ) {
    return null;
  }

  if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
    return cleanPath.slice(0, -1);
  }

  return cleanPath;
}

function getDateKey(date: Date): string {
  const parts = analyticsDateKeyFormatter.formatToParts(date);
  const year = parts.find((part) => part.type === 'year')?.value ?? '0000';
  const month = parts.find((part) => part.type === 'month')?.value ?? '01';
  const day = parts.find((part) => part.type === 'day')?.value ?? '01';

  return `${year}-${month}-${day}`;
}

function sortPages(pageMap: Record<string, number>): AnalyticsPageStat[] {
  return Object.entries(pageMap)
    .map(([pagePath, views]) => ({ path: pagePath, views }))
    .sort((left, right) => right.views - left.views)
    .slice(0, 10);
}

function sortLabelStats(labelMap: Record<string, number>, limit = 10): AnalyticsLabelStat[] {
  return Object.entries(labelMap)
    .map(([label, value]) => ({ label, value }))
    .sort((left, right) => right.value - left.value)
    .slice(0, limit);
}

function toNumberMap(rawMap: Record<string, string>): Record<string, number> {
  return Object.fromEntries(Object.entries(rawMap).map(([label, value]) => [label, Number(value)]));
}

function mergeNumberMaps(target: Record<string, number>, source: Record<string, number>): void {
  for (const [label, value] of Object.entries(source)) {
    target[label] = (target[label] ?? 0) + value;
  }
}

function getInternalHosts(): Set<string> {
  const internalHosts = new Set([
    'flauntforest.com',
    'www.flauntforest.com',
    'localhost',
    '127.0.0.1',
  ]);
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    try {
      const parsed = candidate.startsWith('http')
        ? new URL(candidate)
        : new URL(`https://${candidate}`);
      internalHosts.add(parsed.hostname.toLowerCase());
      internalHosts.add(parsed.hostname.toLowerCase().replace(/^www\./, ''));
    } catch {
      // Ignore malformed env values.
    }
  }

  return internalHosts;
}

function normalizeSource(referrer?: string | null): string {
  if (!referrer?.trim()) {
    return 'Direct';
  }

  try {
    const hostname = new URL(referrer).hostname.toLowerCase().replace(/^www\./, '');

    if (getInternalHosts().has(hostname)) {
      return 'Direct';
    }

    if (hostname.includes('google.')) return 'Google';
    if (hostname.includes('bing.')) return 'Bing';
    if (hostname.includes('linkedin.')) return 'LinkedIn';
    if (hostname.includes('facebook.')) return 'Facebook';
    if (hostname.includes('instagram.')) return 'Instagram';
    if (hostname.includes('x.com') || hostname.includes('twitter.')) return 'X / Twitter';

    return hostname;
  } catch {
    return 'Direct';
  }
}

function detectDeviceType(userAgent?: string | null): string {
  const agent = userAgent?.toLowerCase() ?? '';

  if (!agent) {
    return 'Unknown';
  }

  if (/bot|spider|crawl|slurp|bingpreview/.test(agent)) {
    return 'Bot';
  }

  if (/ipad|tablet|kindle|playbook|silk/.test(agent)) {
    return 'Tablet';
  }

  if (/mobi|iphone|android/.test(agent)) {
    return 'Mobile';
  }

  return 'Desktop';
}

function normalizeInquiryType(value?: string | null): string {
  const normalized = value?.trim();
  return normalized ? normalized.slice(0, 80) : 'General inquiry';
}

function normalizeLocationLabel(value?: string | null): string | null {
  const normalized = value?.trim();
  return normalized ? normalized.slice(0, 120) : null;
}

function normalizeCompanyLabel(value?: string | null): string | null {
  const normalized = value?.trim();

  if (!normalized) {
    return null;
  }

  const cleaned = normalized.replace(/^AS\d+\s*/i, '').trim();

  if (!cleaned || /unknown|private|reserved|localhost/i.test(cleaned)) {
    return null;
  }

  return cleaned.slice(0, 100);
}

function normalizeIspLabel(value?: string | null): string | null {
  const cleaned = value
    ?.replace(/\s+/g, ' ')
    .replace(/^AS\d+\s*/i, '')
    .trim();

  if (!cleaned || /unknown|private|reserved|localhost|public email provider/i.test(cleaned)) {
    return null;
  }

  if (/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(cleaned) && !cleaned.includes(' ')) {
    return null;
  }

  return cleaned.slice(0, 120);
}

function normalizeHostnameLabel(value?: string | null): string | null {
  const cleaned = value?.trim().replace(/\.$/, '').toLowerCase();

  if (!cleaned || /unknown|localhost/i.test(cleaned)) {
    return null;
  }

  if (/^(\d{1,3}\.){3}\d{1,3}$/i.test(cleaned) || /^[0-9a-f:]+$/i.test(cleaned)) {
    return null;
  }

  return cleaned.slice(0, 140);
}

function isPublicLookupIpAddress(value?: string | null): boolean {
  const normalized = value?.trim().toLowerCase();

  if (!normalized || normalized.includes('localhost') || normalized.includes('(dev)')) {
    return false;
  }

  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(normalized)) {
    const [a, b] = normalized.split('.').map(Number);

    if (
      a === 10 ||
      a === 127 ||
      a === 0 ||
      (a === 169 && b === 254) ||
      (a === 192 && b === 168) ||
      (a === 172 && b >= 16 && b <= 31)
    ) {
      return false;
    }

    return true;
  }

  if (normalized.includes(':')) {
    return !(
      normalized === '::1' ||
      normalized.startsWith('fe80:') ||
      normalized.startsWith('fc') ||
      normalized.startsWith('fd')
    );
  }

  return false;
}

async function resolveHostnameFromIp(value?: string | null): Promise<string | null> {
  const ipAddress = value?.trim();

  if (!ipAddress || !isPublicLookupIpAddress(ipAddress)) {
    return null;
  }

  if (hostnameCache.has(ipAddress)) {
    return hostnameCache.get(ipAddress) ?? null;
  }

  try {
    const result = await Promise.race([
      dns.reverse(ipAddress),
      new Promise<null>((resolve) => {
        setTimeout(() => resolve(null), HOSTNAME_LOOKUP_TIMEOUT_MS);
      }),
    ]);
    const hostname = normalizeHostnameLabel(Array.isArray(result) ? result[0] : null);
    hostnameCache.set(ipAddress, hostname);
    return hostname;
  } catch {
    hostnameCache.set(ipAddress, null);
    return null;
  }
}

function getIpIntelCacheKey(ipAddress: string): string {
  return `analytics:ip-intel:${ipAddress}`;
}

function parseCachedIpIntelligence(rawValue: string | null): CachedIpIntelligence | null {
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<CachedIpIntelligence>;

    if (!parsed || typeof parsed !== 'object' || typeof parsed.ipAddress !== 'string') {
      return null;
    }

    return {
      ipAddress: parsed.ipAddress,
      hostname: normalizeHostnameLabel(parsed.hostname),
      isp: normalizeIspLabel(parsed.isp),
      networkAsn: normalizeAsnLabel(parsed.networkAsn),
      company: normalizeCompanyLabel(parsed.company),
      networkType: parsed.networkType?.trim() || null,
      networkService: parsed.networkService?.trim() || null,
      fetchedAt: parsed.fetchedAt || new Date(0).toISOString(),
      source: parsed.source === 'ipwho.is' ? 'ipwho.is' : 'headers',
    };
  } catch {
    return null;
  }
}

async function loadCachedIpIntelligence(
  ipAddress: string,
  redis?: SharedRedisClient | null,
  store?: FileAnalyticsStore | null
): Promise<CachedIpIntelligence | null> {
  if (redis) {
    try {
      const rawValue = await redis.get(getIpIntelCacheKey(ipAddress));
      const parsed = parseCachedIpIntelligence(rawValue);

      if (parsed) {
        return parsed;
      }
    } catch {
      // Ignore cache read issues and continue.
    }
  }

  const cached = store?.ipIntel?.[ipAddress];

  return cached
    ? {
        ...cached,
        hostname: normalizeHostnameLabel(cached.hostname),
        isp: normalizeIspLabel(cached.isp),
        networkAsn: normalizeAsnLabel(cached.networkAsn),
        company: normalizeCompanyLabel(cached.company),
        networkType: cached.networkType?.trim() || null,
        networkService: cached.networkService?.trim() || null,
      }
    : null;
}

async function saveCachedIpIntelligence(
  intel: CachedIpIntelligence,
  redis?: SharedRedisClient | null,
  store?: FileAnalyticsStore | null
): Promise<boolean> {
  let updatedStore = false;

  if (redis) {
    try {
      await redis.setEx(
        getIpIntelCacheKey(intel.ipAddress),
        ANALYTICS_TTL_SECONDS,
        JSON.stringify(intel)
      );
    } catch {
      // Ignore cache write issues and continue.
    }
  }

  if (store) {
    store.ipIntel ??= {};
    const existing = store.ipIntel[intel.ipAddress];
    const hasChanged =
      !existing ||
      existing.hostname !== intel.hostname ||
      existing.isp !== intel.isp ||
      existing.networkAsn !== intel.networkAsn ||
      existing.company !== intel.company ||
      existing.networkType !== intel.networkType ||
      existing.networkService !== intel.networkService ||
      existing.source !== intel.source;

    if (hasChanged) {
      store.ipIntel[intel.ipAddress] = intel;
      updatedStore = true;
    }
  }

  return updatedStore;
}

type EnrichedNetworkMetadata = {
  hostnameLabel: string | null;
  ispLabel: string | null;
  networkAsn: string | null;
  companyLabel: string | null;
  networkType: string | null;
  networkService: string | null;
  cacheUpdated: boolean;
};

async function fetchJsonWithTimeout(url: string): Promise<unknown | null> {
  try {
    const response = await Promise.race([
      fetch(url, {
        headers: { accept: 'application/json' },
        cache: 'no-store',
      }),
      new Promise<Response | null>((resolve) => {
        setTimeout(() => resolve(null), HOSTNAME_LOOKUP_TIMEOUT_MS + 1300);
      }),
    ]);

    if (!response || !response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}

async function fetchIpIntelligenceFromProvider(
  ipAddress: string,
  userAgent?: string | null
): Promise<CachedIpIntelligence | null> {
  const ipWhoisPayload = (await fetchJsonWithTimeout(
    `https://ipwho.is/${encodeURIComponent(ipAddress)}`
  )) as {
    success?: boolean;
    connection?: {
      isp?: string | null;
      org?: string | null;
      asn?: string | number | null;
      domain?: string | null;
      type?: string | null;
    };
    hostname?: string | null;
  } | null;

  if (ipWhoisPayload && ipWhoisPayload.success !== false) {
    const hostname =
      normalizeHostnameLabel(ipWhoisPayload.connection?.domain ?? ipWhoisPayload.hostname) ??
      (await resolveHostnameFromIp(ipAddress));
    const isp = normalizeIspLabel(ipWhoisPayload.connection?.isp ?? ipWhoisPayload.connection?.org);
    const networkAsn = normalizeAsnLabel(
      typeof ipWhoisPayload.connection?.asn === 'number'
        ? String(ipWhoisPayload.connection.asn)
        : ipWhoisPayload.connection?.asn
    );
    const providerSummary = [
      ipWhoisPayload.connection?.type,
      ipWhoisPayload.connection?.isp,
      ipWhoisPayload.connection?.org,
      hostname,
    ]
      .filter(Boolean)
      .join(' ');
    const derived = deriveNetworkProfile(
      providerSummary || isp || ipWhoisPayload.connection?.org,
      userAgent
    );

    return {
      ipAddress,
      hostname,
      isp,
      networkAsn,
      company: normalizeCompanyLabel(ipWhoisPayload.connection?.org) ?? derived.companyLabel,
      networkType: derived.networkType,
      networkService: derived.networkService,
      fetchedAt: new Date().toISOString(),
      source: 'ipwho.is',
    };
  }

  const ipInfoPayload = (await fetchJsonWithTimeout(
    `https://ipinfo.io/${encodeURIComponent(ipAddress)}/json`
  )) as {
    org?: string | null;
    hostname?: string | null;
  } | null;

  if (ipInfoPayload) {
    const orgText = ipInfoPayload.org?.trim() ?? null;
    const asnToken = orgText?.split(/\s+/)[0] ?? null;
    const providerText = orgText?.replace(/^AS\d+\s+/i, '') ?? null;
    const hostname =
      normalizeHostnameLabel(ipInfoPayload.hostname) ?? (await resolveHostnameFromIp(ipAddress));
    const isp = normalizeIspLabel(providerText);
    const networkAsn = normalizeAsnLabel(asnToken);
    const derived = deriveNetworkProfile(
      [providerText, hostname].filter(Boolean).join(' '),
      userAgent
    );

    return {
      ipAddress,
      hostname,
      isp,
      networkAsn,
      company: normalizeCompanyLabel(providerText) ?? derived.companyLabel,
      networkType: derived.networkType,
      networkService: derived.networkService,
      fetchedAt: new Date().toISOString(),
      source: 'ipwho.is',
    };
  }

  const hostname = await resolveHostnameFromIp(ipAddress);

  if (!hostname) {
    return null;
  }

  const derived = deriveNetworkProfile(hostname, userAgent);

  return {
    ipAddress,
    hostname,
    isp: null,
    networkAsn: null,
    company: derived.companyLabel,
    networkType: derived.networkType,
    networkService: derived.networkService,
    fetchedAt: new Date().toISOString(),
    source: 'ipwho.is',
  };
}

async function enrichNetworkMetadata(input: {
  ipAddress?: string | null;
  hostname?: string | null;
  isp?: string | null;
  networkAsn?: string | null;
  company?: string | null;
  userAgent?: string | null;
  redis?: SharedRedisClient | null;
  store?: FileAnalyticsStore | null;
}): Promise<EnrichedNetworkMetadata> {
  const normalizedIp = normalizeIpAddress(input.ipAddress);
  const cached = normalizedIp
    ? await loadCachedIpIntelligence(normalizedIp, input.redis, input.store)
    : null;

  let hostnameLabel =
    normalizeHostnameLabel(input.hostname) ??
    normalizeHostnameLabel(cached?.hostname) ??
    (normalizedIp ? await resolveHostnameFromIp(normalizedIp) : null);
  let ispLabel = normalizeIspLabel(input.isp ?? cached?.isp ?? input.company ?? cached?.company);
  let asnLabel = normalizeAsnLabel(input.networkAsn ?? cached?.networkAsn);
  let companyLabel = normalizeCompanyLabel(input.company) ?? normalizeCompanyLabel(cached?.company);
  let networkType = cached?.networkType?.trim() || null;
  let networkService = cached?.networkService?.trim() || null;
  let cacheUpdated = false;

  if (normalizedIp && (!cached || !hostnameLabel || !ispLabel || !asnLabel || !networkService)) {
    const fetched = await fetchIpIntelligenceFromProvider(normalizedIp, input.userAgent);

    if (fetched) {
      hostnameLabel = hostnameLabel ?? fetched.hostname ?? null;
      ispLabel = ispLabel ?? fetched.isp ?? null;
      asnLabel = asnLabel ?? fetched.networkAsn ?? null;
      companyLabel = companyLabel ?? fetched.company ?? null;
      networkType = networkType ?? fetched.networkType ?? null;
      networkService = networkService ?? fetched.networkService ?? null;
      cacheUpdated =
        (await saveCachedIpIntelligence(fetched, input.redis, input.store)) || cacheUpdated;
    }
  }

  const derived = deriveNetworkProfile(
    [ispLabel, companyLabel, hostnameLabel, networkService, networkType].filter(Boolean).join(' '),
    input.userAgent
  );

  companyLabel = companyLabel ?? derived.companyLabel;
  networkType = networkType ?? derived.networkType;
  networkService = networkService ?? derived.networkService;

  if (
    normalizedIp &&
    (hostnameLabel || ispLabel || asnLabel || companyLabel || networkType || networkService)
  ) {
    cacheUpdated =
      (await saveCachedIpIntelligence(
        {
          ipAddress: normalizedIp,
          hostname: hostnameLabel,
          isp: ispLabel,
          networkAsn: asnLabel,
          company: companyLabel,
          networkType,
          networkService,
          fetchedAt: cached?.fetchedAt ?? new Date().toISOString(),
          source: cached?.source ?? 'headers',
        },
        input.redis,
        input.store
      )) || cacheUpdated;
  }

  return {
    hostnameLabel,
    ispLabel,
    networkAsn: asnLabel,
    companyLabel,
    networkType,
    networkService,
    cacheUpdated,
  };
}

function normalizeAsnLabel(value?: string | null): string | null {
  const normalized = value?.trim();

  if (!normalized) {
    return null;
  }

  const digits = normalized.replace(/^AS/i, '');
  return /^\d{1,10}$/.test(digits) ? `AS${digits}` : null;
}

type DerivedNetworkProfile = {
  companyLabel: string | null;
  networkType: string | null;
  networkService: string | null;
};

function deriveNetworkProfile(
  provider?: string | null,
  userAgent?: string | null
): DerivedNetworkProfile {
  const ispLabel = normalizeIspLabel(provider);
  const agent = userAgent?.toLowerCase() ?? '';

  if (!ispLabel) {
    return {
      companyLabel: null,
      networkType: null,
      networkService: null,
    };
  }

  if (/bot|spider|crawl|slurp|bingpreview|facebookexternalhit|linkedinbot/i.test(agent)) {
    return {
      companyLabel: null,
      networkType: 'Bot / automation',
      networkService: 'Crawler or automation network',
    };
  }

  if (
    /amazon|aws|google cloud|google llc|microsoft|azure|digitalocean|linode|cloudflare|fastly|akamai|vercel|netlify|render|fly\.io|oracle|alibaba|tencent|ovh|hetzner|vultr|scaleway/i.test(
      ispLabel
    )
  ) {
    return {
      companyLabel: null,
      networkType: 'Cloud / hosting',
      networkService: 'Cloud platform or CDN',
    };
  }

  if (
    /university|college|school|district|isd|education|government|gov\b|county|city of|state of|hospital|health|medical|library|k12|\.edu\b/i.test(
      ispLabel
    )
  ) {
    return {
      companyLabel: ispLabel,
      networkType: 'Organization / institution',
      networkService: 'Institutional network',
    };
  }

  if (
    /comcast|xfinity|spectrum|charter|cox|frontier|centurylink|lumen|shaw|rogers|bell canada|optimum|suddenlink|broadband|cable|fiber|dsl/i.test(
      ispLabel
    )
  ) {
    return {
      companyLabel: null,
      networkType: 'Personal / residential',
      networkService: 'Residential ISP',
    };
  }

  if (
    /wireless|mobile|cellular|lte|5g|4g|carrier|telecom|communications|telefonica|vodafone|orange|t-mobile|tmobile|verizon|sprint|airtel|jio/i.test(
      ispLabel
    )
  ) {
    return {
      companyLabel: null,
      networkType: 'Carrier / shared network',
      networkService: 'Mobile carrier or telecom',
    };
  }

  if (
    /\b(inc|llc|ltd|corp|corporation|company|group|systems|solutions|partners|consulting|holdings|ventures|technology|technologies|tech|studio|labs|bank|insurance|financial|manufacturing|logistics|construction|energy|healthcare)\b/i.test(
      ispLabel
    )
  ) {
    return {
      companyLabel: ispLabel,
      networkType: 'Company / business',
      networkService: 'Business network',
    };
  }

  return {
    companyLabel: null,
    networkType: 'Other / shared network',
    networkService: 'Mixed or unknown service',
  };
}

function inferCompanyFromEmail(email?: string | null): string | null {
  const domain = email?.split('@')[1]?.trim().toLowerCase();

  if (!domain) {
    return null;
  }

  const publicDomains = new Set([
    'gmail.com',
    'outlook.com',
    'hotmail.com',
    'live.com',
    'yahoo.com',
    'icloud.com',
    'me.com',
    'aol.com',
    'proton.me',
    'protonmail.com',
    'qq.com',
    '163.com',
  ]);

  return publicDomains.has(domain) ? 'Public email provider' : domain;
}

function normalizeUtmValue(value?: string | null): string | null {
  const normalized = value?.trim();
  return normalized ? normalized.slice(0, 100) : null;
}

function normalizeLeadPage(value?: string | null): string | null {
  if (!value?.trim()) {
    return null;
  }

  try {
    const parsed = value.startsWith('http') ? new URL(value) : new URL(value, 'https://local.test');
    return normalizePath(parsed.pathname);
  } catch {
    return normalizePath(value);
  }
}

function normalizeClickLabel(value?: string | null, target?: string | null): string | null {
  const label = value?.replace(/\s+/g, ' ').trim();

  if (!label) {
    return null;
  }

  const cleanLabel = label.slice(0, 70);
  const targetPath = normalizeLeadPage(target);
  return targetPath ? `${cleanLabel} → ${targetPath}` : cleanLabel;
}

function buildCampaignLabel(input: {
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
}): string | null {
  const campaign = normalizeUtmValue(input.utmCampaign);
  const source = normalizeUtmValue(input.utmSource);
  const medium = normalizeUtmValue(input.utmMedium);

  if (campaign) {
    return source || medium
      ? `${campaign} (${source ?? 'unknown'} / ${medium ?? 'unknown'})`
      : campaign;
  }

  if (source || medium) {
    return `${source ?? 'unknown'} / ${medium ?? 'direct'}`;
  }

  return null;
}

function buildVisitorId(ipAddress?: string | null, userAgent?: string | null): string {
  return crypto
    .createHash('sha256')
    .update(`${ipAddress || 'unknown'}|${userAgent || 'unknown'}`)
    .digest('hex');
}

function normalizeVisitorToken(value?: string | null): string | null {
  const normalized = value?.trim();

  if (!normalized) {
    return null;
  }

  return /^[a-zA-Z0-9_-]{8,120}$/.test(normalized) ? normalized : null;
}

function normalizeIpAddress(value?: string | null): string | null {
  return formatClientIpLabel(value);
}

function normalizeContactName(value?: string | null): string | null {
  const normalized = value?.replace(/\s+/g, ' ').trim();
  return normalized ? normalized.slice(0, 100) : null;
}

function normalizeContactEmail(value?: string | null): string | null {
  const normalized = value?.trim().toLowerCase();
  return normalized && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)
    ? normalized.slice(0, 120)
    : null;
}

function normalizeContactPhone(value?: string | null): string | null {
  const normalized = value?.replace(/\s+/g, ' ').trim();
  return normalized ? normalized.slice(0, 40) : null;
}

type VisitorUpdateInput = {
  visitorId: string;
  nowIso: string;
  pathname?: string | null;
  ipAddress?: string | null;
  sourceLabel?: string | null;
  locationLabel?: string | null;
  companyLabel?: string | null;
  hostnameLabel?: string | null;
  ispLabel?: string | null;
  networkAsn?: string | null;
  networkType?: string | null;
  networkService?: string | null;
  deviceLabel?: string | null;
  utmSourceLabel?: string | null;
  campaignLabel?: string | null;
  inquiryType?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  incrementView?: boolean;
  markConversion?: boolean;
};

function updateFileVisitorRecord(store: FileAnalyticsStore, input: VisitorUpdateInput): void {
  store.visitors ??= {};

  const normalizedPath = input.pathname ? normalizePath(input.pathname) : null;
  const record =
    store.visitors[input.visitorId] ??
    ({
      id: input.visitorId,
      ipAddress: input.ipAddress ?? null,
      firstSeenAt: input.nowIso,
      lastSeenAt: input.nowIso,
      source: input.sourceLabel ?? 'Direct',
      location: input.locationLabel ?? null,
      company: input.companyLabel ?? null,
      hostname: input.hostnameLabel ?? null,
      isp: input.ispLabel ?? null,
      networkAsn: input.networkAsn ?? null,
      networkType: input.networkType ?? null,
      networkService: input.networkService ?? null,
      device: input.deviceLabel ?? 'Unknown',
      utmSource: input.utmSourceLabel ?? null,
      utmCampaign: input.campaignLabel ?? null,
      lastInquiryType: input.inquiryType ?? null,
      contactName: input.contactName ?? null,
      contactEmail: input.contactEmail ?? null,
      contactPhone: input.contactPhone ?? null,
      viewCount: 0,
      conversionCount: 0,
      pages: {},
      recentPages: [],
    } satisfies FileAnalyticsVisitorRecord);

  record.lastSeenAt = input.nowIso;
  record.ipAddress = input.ipAddress ?? record.ipAddress ?? null;
  record.source = input.sourceLabel ?? record.source ?? 'Direct';
  record.location = input.locationLabel ?? record.location ?? null;
  record.company = input.companyLabel ?? record.company ?? null;
  record.hostname = input.hostnameLabel ?? record.hostname ?? null;
  record.isp = input.ispLabel ?? record.isp ?? null;
  record.networkAsn = input.networkAsn ?? record.networkAsn ?? null;
  record.networkType = input.networkType ?? record.networkType ?? null;
  record.networkService = input.networkService ?? record.networkService ?? null;
  record.device = input.deviceLabel ?? record.device ?? 'Unknown';
  record.utmSource = input.utmSourceLabel ?? record.utmSource ?? null;
  record.utmCampaign = input.campaignLabel ?? record.utmCampaign ?? null;
  record.lastInquiryType = input.inquiryType ?? record.lastInquiryType ?? null;
  record.contactName = input.contactName ?? record.contactName ?? null;
  record.contactEmail = input.contactEmail ?? record.contactEmail ?? null;
  record.contactPhone = input.contactPhone ?? record.contactPhone ?? null;

  if (normalizedPath) {
    record.recentPages = Array.from(new Set([normalizedPath, ...(record.recentPages ?? [])])).slice(
      0,
      6
    );

    if (input.incrementView !== false) {
      record.viewCount += 1;
      record.pages[normalizedPath] = (record.pages[normalizedPath] ?? 0) + 1;
    }
  }

  if (input.markConversion) {
    record.conversionCount = (record.conversionCount ?? 0) + 1;
  }

  store.visitors[input.visitorId] = record;
}

async function getRecentVisitorsFromRedis(
  redis: SharedRedisClient,
  limit = RECENT_VISITOR_FETCH_LIMIT
): Promise<AnalyticsVisitorRecord[]> {
  const visitorIds = await redis.zRange('analytics:recent-visitors', 0, limit - 1, { REV: true });

  const visitors = await Promise.all(
    visitorIds.map(async (visitorId) => {
      const [recordRaw, pageMapRaw, recentPathsRaw] = await Promise.all([
        redis.hGetAll(`analytics:visitor:${visitorId}`),
        redis.hGetAll(`analytics:visitor-pages:${visitorId}`),
        redis.lRange(`analytics:visitor-recent-paths:${visitorId}`, 0, 5),
      ]);

      if (Object.keys(recordRaw).length === 0) {
        return null;
      }

      const pageMap = toNumberMap(pageMapRaw);
      const recentPages = Array.from(new Set(recentPathsRaw.filter(Boolean))).slice(0, 6);
      const networkInfo = await enrichNetworkMetadata({
        ipAddress: recordRaw.ipAddress || null,
        hostname: recordRaw.hostname || null,
        isp: recordRaw.isp || null,
        networkAsn: recordRaw.networkAsn || null,
        company: recordRaw.company || null,
        redis,
      });

      return {
        id: recordRaw.id || visitorId,
        ipAddress: recordRaw.ipAddress || null,
        firstSeenAt: recordRaw.firstSeenAt || recordRaw.lastSeenAt || new Date().toISOString(),
        lastSeenAt: recordRaw.lastSeenAt || new Date().toISOString(),
        source: recordRaw.source || 'Direct',
        location: recordRaw.location || null,
        company: networkInfo.companyLabel,
        hostname: networkInfo.hostnameLabel,
        isp: networkInfo.ispLabel,
        networkAsn: networkInfo.networkAsn,
        networkType: networkInfo.networkType,
        networkService: networkInfo.networkService,
        device: recordRaw.device || 'Unknown',
        utmSource: recordRaw.utmSource || null,
        utmCampaign: recordRaw.utmCampaign || null,
        lastInquiryType: recordRaw.lastInquiryType || null,
        contactName: recordRaw.contactName || null,
        contactEmail: recordRaw.contactEmail || null,
        contactPhone: recordRaw.contactPhone || null,
        viewCount: Number(
          recordRaw.viewCount ?? Object.values(pageMap).reduce((sum, value) => sum + value, 0)
        ),
        conversionCount: Number(recordRaw.conversionCount ?? 0),
        pages: sortPages(pageMap),
        recentPages,
      } satisfies AnalyticsVisitorRecord;
    })
  );

  return visitors.filter((visitor): visitor is AnalyticsVisitorRecord => Boolean(visitor));
}

async function getRecentVisitorsFromFile(
  store: FileAnalyticsStore,
  days: number,
  limit = RECENT_VISITOR_FETCH_LIMIT
): Promise<AnalyticsVisitorRecord[]> {
  const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;
  let storeNeedsWrite = false;

  const visitors = await Promise.all(
    Object.values(store.visitors ?? {})
      .filter((visitor) => new Date(visitor.lastSeenAt).getTime() >= cutoffTime)
      .sort(
        (left, right) => new Date(right.lastSeenAt).getTime() - new Date(left.lastSeenAt).getTime()
      )
      .slice(0, limit)
      .map(async (visitor) => {
        const networkInfo = await enrichNetworkMetadata({
          ipAddress: visitor.ipAddress ?? null,
          hostname: visitor.hostname ?? null,
          isp: visitor.isp ?? null,
          networkAsn: visitor.networkAsn ?? null,
          company: visitor.company ?? null,
          store,
        });
        storeNeedsWrite = storeNeedsWrite || networkInfo.cacheUpdated;

        return {
          id: visitor.id,
          ipAddress: visitor.ipAddress ?? null,
          firstSeenAt: visitor.firstSeenAt,
          lastSeenAt: visitor.lastSeenAt,
          source: visitor.source ?? 'Direct',
          location: visitor.location ?? null,
          company: networkInfo.companyLabel,
          hostname: networkInfo.hostnameLabel,
          isp: networkInfo.ispLabel,
          networkAsn: networkInfo.networkAsn,
          networkType: networkInfo.networkType,
          networkService: networkInfo.networkService,
          device: visitor.device ?? 'Unknown',
          utmSource: visitor.utmSource ?? null,
          utmCampaign: visitor.utmCampaign ?? null,
          lastInquiryType: visitor.lastInquiryType ?? null,
          contactName: visitor.contactName ?? null,
          contactEmail: visitor.contactEmail ?? null,
          contactPhone: visitor.contactPhone ?? null,
          viewCount: visitor.viewCount ?? 0,
          conversionCount: visitor.conversionCount ?? 0,
          pages: sortPages(visitor.pages ?? {}),
          recentPages: (visitor.recentPages ?? []).slice(0, 6),
        } satisfies AnalyticsVisitorRecord;
      })
  );

  if (storeNeedsWrite) {
    await writeFileStore(store);
  }

  return visitors;
}

function createEmptyDay(date: string): AnalyticsDayStat {
  return {
    date,
    totalViews: 0,
    uniqueVisitors: 0,
    pages: [],
    sources: [],
    locations: [],
    companies: [],
    utmSources: [],
    campaigns: [],
    ctaClicks: [],
    leadPages: [],
    devices: [],
    contactSubmissions: 0,
    inquiryTypes: [],
  };
}

async function readFileStore(): Promise<FileAnalyticsStore> {
  try {
    const fileContent = await fs.readFile(ANALYTICS_STORE_PATH, 'utf8');
    return JSON.parse(fileContent) as FileAnalyticsStore;
  } catch {
    return { daily: {} };
  }
}

async function writeFileStore(store: FileAnalyticsStore): Promise<void> {
  await fs.mkdir(path.dirname(ANALYTICS_STORE_PATH), { recursive: true });
  await fs.writeFile(ANALYTICS_STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
}

function getRecentDateKeys(days: number): string[] {
  const dates: string[] = [];

  for (let index = 0; index < days; index += 1) {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - index);
    dates.push(getDateKey(date));
  }

  return dates;
}

export async function trackPageView(input: {
  pathname: string;
  visitorId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  referrer?: string | null;
  location?: string | null;
  company?: string | null;
  hostname?: string | null;
  networkProvider?: string | null;
  networkAsn?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
}): Promise<void> {
  const normalizedPath = normalizePath(input.pathname);

  if (!normalizedPath) {
    return;
  }

  // Drop bot/crawler traffic before doing any further work
  const deviceLabel = detectDeviceType(input.userAgent);
  if (deviceLabel === 'Bot') {
    return;
  }

  const now = new Date();
  const nowIso = now.toISOString();
  const dateKey = getDateKey(now);
  const normalizedIp = normalizeIpAddress(input.ipAddress);
  const visitorId =
    normalizeVisitorToken(input.visitorId) ?? buildVisitorId(normalizedIp, input.userAgent);
  const sourceLabel = normalizeSource(input.referrer);
  const locationLabel = normalizeLocationLabel(input.location);
  const utmSourceLabel = normalizeUtmValue(input.utmSource);
  const campaignLabel = buildCampaignLabel(input);
  const redis = await getSharedRedisClient();
  const networkInfo = await enrichNetworkMetadata({
    ipAddress: normalizedIp,
    hostname: input.hostname,
    isp: input.networkProvider,
    networkAsn: input.networkAsn,
    company: input.company,
    userAgent: input.userAgent,
    redis,
  });
  const hostnameLabel = networkInfo.hostnameLabel;
  const ispLabel = networkInfo.ispLabel;
  const networkAsn = networkInfo.networkAsn;
  const companyLabel = networkInfo.companyLabel;
  const networkType = networkInfo.networkType;
  const networkService = networkInfo.networkService;

  if (redis) {
    const totalsKey = `analytics:totals:${dateKey}`;
    const visitorsKey = `analytics:visitors:${dateKey}`;
    const pagesKey = `analytics:pages:${dateKey}`;
    const allTimePagesKey = 'analytics:pages:all-time';
    const sourcesKey = `analytics:sources:${dateKey}`;
    const locationsKey = `analytics:locations:${dateKey}`;
    const companiesKey = `analytics:companies:${dateKey}`;
    const utmSourcesKey = `analytics:utm-sources:${dateKey}`;
    const campaignsKey = `analytics:campaigns:${dateKey}`;
    const devicesKey = `analytics:devices:${dateKey}`;
    const visitorKey = `analytics:visitor:${visitorId}`;
    const visitorPagesKey = `analytics:visitor-pages:${visitorId}`;
    const visitorRecentPathsKey = `analytics:visitor-recent-paths:${visitorId}`;

    try {
      const visitorMetadata: Record<string, string> = {
        id: visitorId,
        lastSeenAt: nowIso,
        source: sourceLabel,
        device: deviceLabel,
      };

      if (normalizedIp) {
        visitorMetadata.ipAddress = normalizedIp;
      }

      if (locationLabel) {
        visitorMetadata.location = locationLabel;
      }

      if (companyLabel) {
        visitorMetadata.company = companyLabel;
      }

      if (hostnameLabel) {
        visitorMetadata.hostname = hostnameLabel;
      }

      if (ispLabel) {
        visitorMetadata.isp = ispLabel;
      }

      if (networkAsn) {
        visitorMetadata.networkAsn = networkAsn;
      }

      if (networkType) {
        visitorMetadata.networkType = networkType;
      }

      if (networkService) {
        visitorMetadata.networkService = networkService;
      }

      if (utmSourceLabel) {
        visitorMetadata.utmSource = utmSourceLabel;
      }

      if (campaignLabel) {
        visitorMetadata.utmCampaign = campaignLabel;
      }

      const transaction = redis
        .multi()
        .incr(totalsKey)
        .sAdd(visitorsKey, visitorId)
        .hIncrBy(pagesKey, normalizedPath, 1)
        .hIncrBy(allTimePagesKey, normalizedPath, 1)
        .hIncrBy(sourcesKey, sourceLabel, 1)
        .hIncrBy(devicesKey, deviceLabel, 1)
        .hSet(visitorKey, visitorMetadata)
        .hSetNX(visitorKey, 'firstSeenAt', nowIso)
        .hIncrBy(visitorKey, 'viewCount', 1)
        .hIncrBy(visitorPagesKey, normalizedPath, 1)
        .lPush(visitorRecentPathsKey, normalizedPath)
        .lTrim(visitorRecentPathsKey, 0, 5)
        .zAdd('analytics:recent-visitors', [{ score: now.getTime(), value: visitorId }])
        .expire(totalsKey, ANALYTICS_TTL_SECONDS)
        .expire(visitorsKey, ANALYTICS_TTL_SECONDS)
        .expire(pagesKey, ANALYTICS_TTL_SECONDS)
        .expire(sourcesKey, ANALYTICS_TTL_SECONDS)
        .expire(devicesKey, ANALYTICS_TTL_SECONDS)
        .expire(visitorKey, ANALYTICS_TTL_SECONDS)
        .expire(visitorPagesKey, ANALYTICS_TTL_SECONDS)
        .expire(visitorRecentPathsKey, ANALYTICS_TTL_SECONDS)
        .expire('analytics:recent-visitors', ANALYTICS_TTL_SECONDS);

      if (locationLabel) {
        transaction
          .hIncrBy(locationsKey, locationLabel, 1)
          .expire(locationsKey, ANALYTICS_TTL_SECONDS);
      }

      if (companyLabel) {
        transaction
          .hIncrBy(companiesKey, companyLabel, 1)
          .expire(companiesKey, ANALYTICS_TTL_SECONDS);
      }

      if (utmSourceLabel) {
        transaction
          .hIncrBy(utmSourcesKey, utmSourceLabel, 1)
          .expire(utmSourcesKey, ANALYTICS_TTL_SECONDS);
      }

      if (campaignLabel) {
        transaction
          .hIncrBy(campaignsKey, campaignLabel, 1)
          .expire(campaignsKey, ANALYTICS_TTL_SECONDS);
      }

      await transaction.exec();

      return;
    } catch (error) {
      console.error(
        'Analytics Redis write failed, using file storage instead',
        formatRedisError(error)
      );
      await resetSharedRedisClient(redis);
    }
  }

  const store = await readFileStore();
  const existingDay = store.daily[dateKey] ?? {
    totalViews: 0,
    uniqueVisitors: [],
    pages: {},
    sources: {},
    locations: {},
    companies: {},
    utmSources: {},
    campaigns: {},
    ctaClicks: {},
    leadPages: {},
    devices: {},
    conversions: {},
    inquiryTypes: {},
  };

  existingDay.totalViews += 1;
  existingDay.pages[normalizedPath] = (existingDay.pages[normalizedPath] ?? 0) + 1;
  existingDay.sources = existingDay.sources ?? {};
  existingDay.locations = existingDay.locations ?? {};
  existingDay.companies = existingDay.companies ?? {};
  existingDay.utmSources = existingDay.utmSources ?? {};
  existingDay.campaigns = existingDay.campaigns ?? {};
  existingDay.devices = existingDay.devices ?? {};
  existingDay.sources[sourceLabel] = (existingDay.sources[sourceLabel] ?? 0) + 1;

  if (locationLabel) {
    existingDay.locations[locationLabel] = (existingDay.locations[locationLabel] ?? 0) + 1;
  }

  if (companyLabel) {
    existingDay.companies[companyLabel] = (existingDay.companies[companyLabel] ?? 0) + 1;
  }

  if (utmSourceLabel) {
    existingDay.utmSources[utmSourceLabel] = (existingDay.utmSources[utmSourceLabel] ?? 0) + 1;
  }

  if (campaignLabel) {
    existingDay.campaigns[campaignLabel] = (existingDay.campaigns[campaignLabel] ?? 0) + 1;
  }

  existingDay.devices[deviceLabel] = (existingDay.devices[deviceLabel] ?? 0) + 1;

  if (!existingDay.uniqueVisitors.includes(visitorId)) {
    existingDay.uniqueVisitors.push(visitorId);
  }

  updateFileVisitorRecord(store, {
    visitorId,
    nowIso,
    pathname: normalizedPath,
    ipAddress: normalizedIp,
    sourceLabel,
    locationLabel,
    companyLabel,
    hostnameLabel,
    ispLabel,
    networkAsn,
    networkType,
    networkService,
    deviceLabel,
    utmSourceLabel,
    campaignLabel,
    incrementView: true,
  });

  store.daily[dateKey] = existingDay;
  await writeFileStore(store);
}

export async function trackConversion(
  input: {
    type?: 'contact-form';
    inquiryType?: string | null;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    company?: string | null;
    sourcePage?: string | null;
    utmSource?: string | null;
    utmMedium?: string | null;
    utmCampaign?: string | null;
    visitorId?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
  } = {}
): Promise<void> {
  const now = new Date();
  const nowIso = now.toISOString();
  const dateKey = getDateKey(now);
  const conversionKey = input.type ?? 'contact-form';
  const inquiryType = normalizeInquiryType(input.inquiryType);
  const contactName = normalizeContactName(input.name);
  const contactEmail = normalizeContactEmail(input.email);
  const contactPhone = normalizeContactPhone(input.phone);
  const companyLabel = normalizeCompanyLabel(input.company) ?? inferCompanyFromEmail(contactEmail);
  const sourcePageLabel = normalizeLeadPage(input.sourcePage);
  const utmSourceLabel = normalizeUtmValue(input.utmSource);
  const campaignLabel = buildCampaignLabel(input);
  const normalizedIp = normalizeIpAddress(input.ipAddress);
  const deviceLabel = detectDeviceType(input.userAgent);
  const visitorId =
    normalizeVisitorToken(input.visitorId) ?? buildVisitorId(normalizedIp, input.userAgent);
  const redis = await getSharedRedisClient();

  if (redis) {
    const conversionsKey = `analytics:conversions:${dateKey}`;
    const inquiryTypesKey = `analytics:inquiry-types:${dateKey}`;
    const companiesKey = `analytics:companies:${dateKey}`;
    const utmSourcesKey = `analytics:utm-sources:${dateKey}`;
    const campaignsKey = `analytics:campaigns:${dateKey}`;
    const leadPagesKey = `analytics:lead-pages:${dateKey}`;
    const visitorKey = `analytics:visitor:${visitorId}`;
    const visitorRecentPathsKey = `analytics:visitor-recent-paths:${visitorId}`;

    try {
      const transaction = redis
        .multi()
        .hIncrBy(conversionsKey, conversionKey, 1)
        .hIncrBy(inquiryTypesKey, inquiryType, 1)
        .hSet(visitorKey, {
          id: visitorId,
          lastSeenAt: nowIso,
          device: deviceLabel,
          lastInquiryType: inquiryType,
          ...(normalizedIp ? { ipAddress: normalizedIp } : {}),
          ...(companyLabel ? { company: companyLabel } : {}),
          ...(utmSourceLabel ? { utmSource: utmSourceLabel } : {}),
          ...(campaignLabel ? { utmCampaign: campaignLabel } : {}),
          ...(contactName ? { contactName } : {}),
          ...(contactEmail ? { contactEmail } : {}),
          ...(contactPhone ? { contactPhone } : {}),
        })
        .hSetNX(visitorKey, 'firstSeenAt', nowIso)
        .hIncrBy(visitorKey, 'conversionCount', 1)
        .expire(conversionsKey, ANALYTICS_TTL_SECONDS)
        .expire(inquiryTypesKey, ANALYTICS_TTL_SECONDS)
        .expire(visitorKey, ANALYTICS_TTL_SECONDS);

      if (companyLabel) {
        transaction
          .hIncrBy(companiesKey, companyLabel, 1)
          .expire(companiesKey, ANALYTICS_TTL_SECONDS);
      }

      if (utmSourceLabel) {
        transaction
          .hIncrBy(utmSourcesKey, utmSourceLabel, 1)
          .expire(utmSourcesKey, ANALYTICS_TTL_SECONDS);
      }

      if (campaignLabel) {
        transaction
          .hIncrBy(campaignsKey, campaignLabel, 1)
          .expire(campaignsKey, ANALYTICS_TTL_SECONDS);
      }

      if (sourcePageLabel) {
        transaction
          .hIncrBy(leadPagesKey, sourcePageLabel, 1)
          .lPush(visitorRecentPathsKey, sourcePageLabel)
          .lTrim(visitorRecentPathsKey, 0, 5)
          .expire(leadPagesKey, ANALYTICS_TTL_SECONDS)
          .expire(visitorRecentPathsKey, ANALYTICS_TTL_SECONDS);
      }

      await transaction.exec();

      return;
    } catch (error) {
      console.error(
        'Analytics conversion write failed, using file storage instead',
        formatRedisError(error)
      );
      await resetSharedRedisClient(redis);
    }
  }

  const store = await readFileStore();
  const existingDay = store.daily[dateKey] ?? {
    totalViews: 0,
    uniqueVisitors: [],
    pages: {},
    sources: {},
    locations: {},
    companies: {},
    utmSources: {},
    campaigns: {},
    ctaClicks: {},
    leadPages: {},
    devices: {},
    conversions: {},
    inquiryTypes: {},
  };

  existingDay.conversions = existingDay.conversions ?? {};
  existingDay.inquiryTypes = existingDay.inquiryTypes ?? {};
  existingDay.companies = existingDay.companies ?? {};
  existingDay.utmSources = existingDay.utmSources ?? {};
  existingDay.campaigns = existingDay.campaigns ?? {};
  existingDay.leadPages = existingDay.leadPages ?? {};
  existingDay.conversions[conversionKey] = (existingDay.conversions[conversionKey] ?? 0) + 1;
  existingDay.inquiryTypes[inquiryType] = (existingDay.inquiryTypes[inquiryType] ?? 0) + 1;

  if (companyLabel) {
    existingDay.companies[companyLabel] = (existingDay.companies[companyLabel] ?? 0) + 1;
  }

  if (utmSourceLabel) {
    existingDay.utmSources[utmSourceLabel] = (existingDay.utmSources[utmSourceLabel] ?? 0) + 1;
  }

  if (campaignLabel) {
    existingDay.campaigns[campaignLabel] = (existingDay.campaigns[campaignLabel] ?? 0) + 1;
  }

  if (sourcePageLabel) {
    existingDay.leadPages[sourcePageLabel] = (existingDay.leadPages[sourcePageLabel] ?? 0) + 1;
  }

  updateFileVisitorRecord(store, {
    visitorId,
    nowIso,
    pathname: sourcePageLabel,
    ipAddress: normalizedIp,
    companyLabel,
    deviceLabel,
    utmSourceLabel,
    campaignLabel,
    inquiryType,
    contactName,
    contactEmail,
    contactPhone,
    incrementView: false,
    markConversion: true,
  });

  store.daily[dateKey] = existingDay;
  await writeFileStore(store);
}

export async function trackClickEvent(input: {
  label?: string | null;
  pathname?: string | null;
  target?: string | null;
}): Promise<void> {
  const eventLabel = normalizeClickLabel(input.label, input.target);

  if (!eventLabel) {
    return;
  }

  const now = new Date();
  const dateKey = getDateKey(now);
  const redis = await getSharedRedisClient();

  if (redis) {
    const ctaClicksKey = `analytics:cta-clicks:${dateKey}`;

    try {
      await redis
        .multi()
        .hIncrBy(ctaClicksKey, eventLabel, 1)
        .expire(ctaClicksKey, ANALYTICS_TTL_SECONDS)
        .exec();
      return;
    } catch (error) {
      console.error(
        'Analytics click tracking failed, using file storage instead',
        formatRedisError(error)
      );
      await resetSharedRedisClient(redis);
    }
  }

  const store = await readFileStore();
  const existingDay = store.daily[dateKey] ?? {
    totalViews: 0,
    uniqueVisitors: [],
    pages: {},
    sources: {},
    locations: {},
    companies: {},
    utmSources: {},
    campaigns: {},
    ctaClicks: {},
    leadPages: {},
    devices: {},
    conversions: {},
    inquiryTypes: {},
  };

  existingDay.ctaClicks = existingDay.ctaClicks ?? {};
  existingDay.ctaClicks[eventLabel] = (existingDay.ctaClicks[eventLabel] ?? 0) + 1;
  store.daily[dateKey] = existingDay;
  await writeFileStore(store);
}

export async function getAnalyticsSnapshot(days = 14): Promise<AnalyticsSnapshot> {
  const dateKeys = getRecentDateKeys(days);
  const redis = await getSharedRedisClient();

  if (redis) {
    try {
      const dayStats = await Promise.all(
        dateKeys.map(async (dateKey) => {
          const [
            totalViewsRaw,
            uniqueVisitors,
            pageMapRaw,
            sourceMapRaw,
            locationMapRaw,
            companyMapRaw,
            utmSourceMapRaw,
            campaignMapRaw,
            ctaClickMapRaw,
            leadPageMapRaw,
            deviceMapRaw,
            conversionMapRaw,
            inquiryMapRaw,
          ] = await Promise.all([
            redis.get(`analytics:totals:${dateKey}`),
            redis.sCard(`analytics:visitors:${dateKey}`),
            redis.hGetAll(`analytics:pages:${dateKey}`),
            redis.hGetAll(`analytics:sources:${dateKey}`),
            redis.hGetAll(`analytics:locations:${dateKey}`),
            redis.hGetAll(`analytics:companies:${dateKey}`),
            redis.hGetAll(`analytics:utm-sources:${dateKey}`),
            redis.hGetAll(`analytics:campaigns:${dateKey}`),
            redis.hGetAll(`analytics:cta-clicks:${dateKey}`),
            redis.hGetAll(`analytics:lead-pages:${dateKey}`),
            redis.hGetAll(`analytics:devices:${dateKey}`),
            redis.hGetAll(`analytics:conversions:${dateKey}`),
            redis.hGetAll(`analytics:inquiry-types:${dateKey}`),
          ]);

          const pageMap = toNumberMap(pageMapRaw);
          const sourceMap = toNumberMap(sourceMapRaw);
          const locationMap = toNumberMap(locationMapRaw);
          const companyMap = toNumberMap(companyMapRaw);
          const utmSourceMap = toNumberMap(utmSourceMapRaw);
          const campaignMap = toNumberMap(campaignMapRaw);
          const ctaClickMap = toNumberMap(ctaClickMapRaw);
          const leadPageMap = toNumberMap(leadPageMapRaw);
          const deviceMap = toNumberMap(deviceMapRaw);
          const conversionMap = toNumberMap(conversionMapRaw);
          const inquiryMap = toNumberMap(inquiryMapRaw);

          return {
            date: dateKey,
            totalViews: Number(totalViewsRaw ?? 0),
            uniqueVisitors,
            pages: sortPages(pageMap),
            sources: sortLabelStats(sourceMap, 6),
            locations: sortLabelStats(locationMap, 6),
            companies: sortLabelStats(companyMap, 6),
            utmSources: sortLabelStats(utmSourceMap, 6),
            campaigns: sortLabelStats(campaignMap, 6),
            ctaClicks: sortLabelStats(ctaClickMap, 6),
            leadPages: sortLabelStats(leadPageMap, 6),
            devices: sortLabelStats(deviceMap, 4),
            contactSubmissions: conversionMap['contact-form'] ?? 0,
            inquiryTypes: sortLabelStats(inquiryMap, 5),
          } satisfies AnalyticsDayStat;
        })
      );

      const aggregatedPages: Record<string, number> = {};
      const aggregatedSources: Record<string, number> = {};
      const aggregatedLocations: Record<string, number> = {};
      const aggregatedCompanies: Record<string, number> = {};
      const aggregatedUtmSources: Record<string, number> = {};
      const aggregatedCampaigns: Record<string, number> = {};
      const aggregatedCtaClicks: Record<string, number> = {};
      const aggregatedLeadPages: Record<string, number> = {};
      const aggregatedDevices: Record<string, number> = {};
      const aggregatedInquiryTypes: Record<string, number> = {};

      for (const day of dayStats) {
        mergeNumberMaps(
          aggregatedPages,
          Object.fromEntries(day.pages.map((page) => [page.path, page.views]))
        );
        mergeNumberMaps(
          aggregatedSources,
          Object.fromEntries(day.sources.map((source) => [source.label, source.value]))
        );
        mergeNumberMaps(
          aggregatedLocations,
          Object.fromEntries(day.locations.map((location) => [location.label, location.value]))
        );
        mergeNumberMaps(
          aggregatedCompanies,
          Object.fromEntries(day.companies.map((company) => [company.label, company.value]))
        );
        mergeNumberMaps(
          aggregatedUtmSources,
          Object.fromEntries(day.utmSources.map((item) => [item.label, item.value]))
        );
        mergeNumberMaps(
          aggregatedCampaigns,
          Object.fromEntries(day.campaigns.map((item) => [item.label, item.value]))
        );
        mergeNumberMaps(
          aggregatedCtaClicks,
          Object.fromEntries(day.ctaClicks.map((item) => [item.label, item.value]))
        );
        mergeNumberMaps(
          aggregatedLeadPages,
          Object.fromEntries(day.leadPages.map((item) => [item.label, item.value]))
        );
        mergeNumberMaps(
          aggregatedDevices,
          Object.fromEntries(day.devices.map((device) => [device.label, device.value]))
        );
        mergeNumberMaps(
          aggregatedInquiryTypes,
          Object.fromEntries(day.inquiryTypes.map((item) => [item.label, item.value]))
        );
      }

      const contactSubmissionsLast14Days = dayStats.reduce(
        (sum, day) => sum + day.contactSubmissions,
        0
      );
      const totalViewsLast14Days = dayStats.reduce((sum, day) => sum + day.totalViews, 0);
      const recentVisitors = await getRecentVisitorsFromRedis(redis);

      return {
        generatedAt: new Date().toISOString(),
        source: 'redis',
        today: dayStats[0] ?? createEmptyDay(dateKeys[0] ?? getDateKey(new Date())),
        recentDays: [...dayStats].reverse(),
        topPagesToday: dayStats[0]?.pages ?? [],
        topPagesLast14Days: sortPages(aggregatedPages),
        topSourcesLast14Days: sortLabelStats(aggregatedSources, 6),
        locationBreakdownLast14Days: sortLabelStats(aggregatedLocations, 6),
        companyBreakdownLast14Days: sortLabelStats(aggregatedCompanies, 6),
        utmSourceBreakdownLast14Days: sortLabelStats(aggregatedUtmSources, 6),
        campaignBreakdownLast14Days: sortLabelStats(aggregatedCampaigns, 6),
        topCtaClicksLast14Days: sortLabelStats(aggregatedCtaClicks, 6),
        topLeadPagesLast14Days: sortLabelStats(aggregatedLeadPages, 6),
        deviceBreakdownLast14Days: sortLabelStats(aggregatedDevices, 4),
        inquiryBreakdownLast14Days: sortLabelStats(aggregatedInquiryTypes, 5),
        contactSubmissionsLast14Days,
        conversionRateLast14Days:
          totalViewsLast14Days > 0
            ? (contactSubmissionsLast14Days / totalViewsLast14Days) * 100
            : 0,
        recentVisitors,
      };
    } catch (error) {
      console.error(
        'Analytics Redis read failed, using file storage instead',
        formatRedisError(error)
      );
      await resetSharedRedisClient(redis);
    }
  }

  const store = await readFileStore();
  const dayStats = dateKeys.map((dateKey) => {
    const savedDay = store.daily[dateKey];

    if (!savedDay) {
      return createEmptyDay(dateKey);
    }

    const sources = savedDay.sources ?? {};
    const locations = savedDay.locations ?? {};
    const companies = savedDay.companies ?? {};
    const utmSources = savedDay.utmSources ?? {};
    const campaigns = savedDay.campaigns ?? {};
    const ctaClicks = savedDay.ctaClicks ?? {};
    const leadPages = savedDay.leadPages ?? {};
    const devices = savedDay.devices ?? {};
    const conversions = savedDay.conversions ?? {};
    const inquiryTypes = savedDay.inquiryTypes ?? {};

    return {
      date: dateKey,
      totalViews: savedDay.totalViews,
      uniqueVisitors: savedDay.uniqueVisitors.length,
      pages: sortPages(savedDay.pages),
      sources: sortLabelStats(sources, 6),
      locations: sortLabelStats(locations, 6),
      companies: sortLabelStats(companies, 6),
      utmSources: sortLabelStats(utmSources, 6),
      campaigns: sortLabelStats(campaigns, 6),
      ctaClicks: sortLabelStats(ctaClicks, 6),
      leadPages: sortLabelStats(leadPages, 6),
      devices: sortLabelStats(devices, 4),
      contactSubmissions: conversions['contact-form'] ?? 0,
      inquiryTypes: sortLabelStats(inquiryTypes, 5),
    } satisfies AnalyticsDayStat;
  });

  const aggregatedPages: Record<string, number> = {};
  const aggregatedSources: Record<string, number> = {};
  const aggregatedLocations: Record<string, number> = {};
  const aggregatedCompanies: Record<string, number> = {};
  const aggregatedUtmSources: Record<string, number> = {};
  const aggregatedCampaigns: Record<string, number> = {};
  const aggregatedCtaClicks: Record<string, number> = {};
  const aggregatedLeadPages: Record<string, number> = {};
  const aggregatedDevices: Record<string, number> = {};
  const aggregatedInquiryTypes: Record<string, number> = {};

  for (const day of dayStats) {
    mergeNumberMaps(
      aggregatedPages,
      Object.fromEntries(day.pages.map((page) => [page.path, page.views]))
    );
    mergeNumberMaps(
      aggregatedSources,
      Object.fromEntries(day.sources.map((source) => [source.label, source.value]))
    );
    mergeNumberMaps(
      aggregatedLocations,
      Object.fromEntries(day.locations.map((location) => [location.label, location.value]))
    );
    mergeNumberMaps(
      aggregatedCompanies,
      Object.fromEntries(day.companies.map((company) => [company.label, company.value]))
    );
    mergeNumberMaps(
      aggregatedUtmSources,
      Object.fromEntries(day.utmSources.map((item) => [item.label, item.value]))
    );
    mergeNumberMaps(
      aggregatedCampaigns,
      Object.fromEntries(day.campaigns.map((item) => [item.label, item.value]))
    );
    mergeNumberMaps(
      aggregatedCtaClicks,
      Object.fromEntries(day.ctaClicks.map((item) => [item.label, item.value]))
    );
    mergeNumberMaps(
      aggregatedLeadPages,
      Object.fromEntries(day.leadPages.map((item) => [item.label, item.value]))
    );
    mergeNumberMaps(
      aggregatedDevices,
      Object.fromEntries(day.devices.map((device) => [device.label, device.value]))
    );
    mergeNumberMaps(
      aggregatedInquiryTypes,
      Object.fromEntries(day.inquiryTypes.map((item) => [item.label, item.value]))
    );
  }

  const contactSubmissionsLast14Days = dayStats.reduce(
    (sum, day) => sum + day.contactSubmissions,
    0
  );
  const totalViewsLast14Days = dayStats.reduce((sum, day) => sum + day.totalViews, 0);
  const recentVisitors = await getRecentVisitorsFromFile(store, days);

  return {
    generatedAt: new Date().toISOString(),
    source: 'file',
    today: dayStats[0] ?? createEmptyDay(dateKeys[0] ?? getDateKey(new Date())),
    recentDays: [...dayStats].reverse(),
    topPagesToday: dayStats[0]?.pages ?? [],
    topPagesLast14Days: sortPages(aggregatedPages),
    topSourcesLast14Days: sortLabelStats(aggregatedSources, 6),
    locationBreakdownLast14Days: sortLabelStats(aggregatedLocations, 6),
    companyBreakdownLast14Days: sortLabelStats(aggregatedCompanies, 6),
    utmSourceBreakdownLast14Days: sortLabelStats(aggregatedUtmSources, 6),
    campaignBreakdownLast14Days: sortLabelStats(aggregatedCampaigns, 6),
    topCtaClicksLast14Days: sortLabelStats(aggregatedCtaClicks, 6),
    topLeadPagesLast14Days: sortLabelStats(aggregatedLeadPages, 6),
    deviceBreakdownLast14Days: sortLabelStats(aggregatedDevices, 4),
    inquiryBreakdownLast14Days: sortLabelStats(aggregatedInquiryTypes, 5),
    contactSubmissionsLast14Days,
    conversionRateLast14Days:
      totalViewsLast14Days > 0 ? (contactSubmissionsLast14Days / totalViewsLast14Days) * 100 : 0,
    recentVisitors,
  };
}

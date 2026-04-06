import type { AnalyticsVisitorRecord } from '@/types/analytics';
import type { CrmRecord } from '@/types/crm';

const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'outlook.com',
  'hotmail.com',
  'yahoo.com',
  'icloud.com',
  'aol.com',
  'qq.com',
  '163.com',
  'proton.me',
  'protonmail.com',
]);

function normalizeDomain(value?: string | null): string | null {
  const trimmed = value?.trim().toLowerCase();

  if (!trimmed) {
    return null;
  }

  const cleaned = trimmed
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .split('/')[0]
    .split(':')[0]
    ?.trim();

  if (!cleaned || !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(cleaned)) {
    return null;
  }

  if (
    /localhost|vercel\.app|amazonaws\.com|cloudfront\.net|azurewebsites\.net|workers\.dev/i.test(
      cleaned
    )
  ) {
    return null;
  }

  const parts = cleaned.split('.');

  if (parts.length >= 2) {
    return parts.slice(-2).join('.');
  }

  return cleaned;
}

function getEmailDomain(email?: string | null): string | null {
  const raw = email?.split('@')[1] ?? null;
  const normalized = normalizeDomain(raw);

  if (!normalized || FREE_EMAIL_DOMAINS.has(normalized)) {
    return null;
  }

  return normalized;
}

const INFRA_HOST_PATTERN =
  /localhost|amazonaws\.com|cloudfront\.net|digitalocean|linode|vercel\.app|workers\.dev|azurewebsites\.net|render\.com|fly\.dev/i;
const INFRA_PROVIDER_PATTERN =
  /amazon|aws|digitalocean|linode|cloudflare|fastly|akamai|vercel|netlify|render|fly\.io|microsoft|azure|google cloud|oracle|ovh|hetzner|vultr|alibaba|tencent/i;

function hasMeaningfulCrmActivity(crm?: Partial<CrmRecord> | null): boolean {
  if (!crm) {
    return false;
  }

  return Boolean(
    (crm.status && crm.status !== 'new') ||
      crm.notes?.trim() ||
      crm.followUpAt ||
      crm.resolvedCompany ||
      crm.resolvedDomain ||
      crm.contacts?.length
  );
}

export function isLikelyInfrastructureTraffic(visitor: AnalyticsVisitorRecord): boolean {
  const combined = [
    visitor.ipAddress,
    visitor.hostname,
    visitor.isp,
    visitor.company,
    visitor.networkService,
    visitor.networkType,
  ]
    .filter(Boolean)
    .join(' ');

  if (!combined && visitor.device !== 'Bot') {
    return false;
  }

  return (
    visitor.device === 'Bot' ||
    visitor.networkType === 'Cloud / hosting' ||
    visitor.networkType === 'Bot / automation' ||
    INFRA_HOST_PATTERN.test(combined) ||
    INFRA_PROVIDER_PATTERN.test(combined)
  );
}

export function shouldIncludeInProspects(
  visitor: AnalyticsVisitorRecord,
  crm?: Partial<CrmRecord> | null
): boolean {
  if (hasMeaningfulCrmActivity(crm)) {
    return true;
  }

  if (visitor.conversionCount > 0 || visitor.contactEmail || visitor.contactPhone) {
    return true;
  }

  if (isLikelyInfrastructureTraffic(visitor)) {
    return false;
  }

  if (
    visitor.networkType === 'Personal / residential' ||
    visitor.networkType === 'Carrier / shared network'
  ) {
    return Boolean(
      visitor.viewCount >= 4 ||
        visitor.pages.length >= 3 ||
        visitor.recentPages.includes('/contact') ||
        visitor.lastInquiryType
    );
  }

  return Boolean(
    visitor.company ||
      visitor.networkType === 'Company / business' ||
      visitor.networkType === 'Organization / institution' ||
      visitor.viewCount >= 2 ||
      visitor.pages.length >= 2 ||
      visitor.recentPages.includes('/contact') ||
      visitor.lastInquiryType
  );
}

export function getSuggestedResearchDomain(
  visitor: AnalyticsVisitorRecord,
  crm?: Partial<CrmRecord> | null
): string | null {
  return (
    normalizeDomain(crm?.resolvedDomain) ??
    getEmailDomain(visitor.contactEmail) ??
    normalizeDomain(visitor.hostname) ??
    null
  );
}

export function getSuggestedResearchCompany(
  visitor: AnalyticsVisitorRecord,
  crm?: Partial<CrmRecord> | null
): string | null {
  const direct = crm?.resolvedCompany?.trim() || visitor.company?.trim();

  if (direct) {
    return direct.slice(0, 120);
  }

  const emailDomain = getEmailDomain(visitor.contactEmail);

  if (!emailDomain) {
    return null;
  }

  return (
    emailDomain
      .replace(/\.[a-z]{2,}$/i, '')
      .replace(/[-_.]+/g, ' ')
      .trim() || null
  );
}

export function getProspectSignals(visitor: AnalyticsVisitorRecord): string[] {
  const signals: string[] = [];

  if (visitor.conversionCount > 0) {
    signals.push('Submitted a form');
  }

  if (visitor.contactEmail || visitor.contactPhone) {
    signals.push('Left contact details');
  }

  if (visitor.viewCount >= 2 || visitor.pages.length >= 2) {
    signals.push('Returning browser (cookie-based)');
  }

  if (visitor.recentPages.includes('/contact')) {
    signals.push('Visited contact page');
  }

  if (visitor.company) {
    signals.push('Company signal detected');
  }

  if (visitor.lastInquiryType) {
    signals.push(`Interest: ${visitor.lastInquiryType}`);
  }

  return signals.slice(0, 5);
}

export function buildResearchLinks(
  visitor: AnalyticsVisitorRecord,
  crm?: Partial<CrmRecord> | null
): Array<{ label: string; href: string }> {
  const company = getSuggestedResearchCompany(visitor, crm);
  const domain = getSuggestedResearchDomain(visitor, crm);
  const links: Array<{ label: string; href: string }> = [];

  if (domain) {
    links.push({ label: 'Open website', href: `https://${domain}` });
    links.push({
      label: 'Google domain',
      href: `https://www.google.com/search?q=${encodeURIComponent(domain)}`,
    });
  }

  if (company) {
    links.push({
      label: 'Google company',
      href: `https://www.google.com/search?q=${encodeURIComponent(company)}`,
    });
    links.push({
      label: 'LinkedIn people',
      href: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/in \"${company}\" founder OR owner OR manager`)}`,
    });
  }

  if (company || domain) {
    const combined = [company, domain].filter(Boolean).join(' ');
    links.push({
      label: 'Find decision maker',
      href: `https://www.google.com/search?q=${encodeURIComponent(`${combined} founder OR owner OR operations manager`)}`,
    });
  }

  return links.slice(0, 4);
}

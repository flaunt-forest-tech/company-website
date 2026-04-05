import type { CSSProperties } from 'react';

import Link from 'next/link';

import AdminIdleGuard from '@/components/admin/admin-idle-guard';
import { getAdminUsername, requireAdminAccess } from '@/lib/admin-auth';
import {
  getAnalyticsSnapshot,
  type AnalyticsDayStat,
  type AnalyticsLabelStat,
  type AnalyticsPageStat,
  type AnalyticsVisitorRecord,
} from '@/lib/analytics';
import { buildProspectScout } from '@/lib/prospect-scout';

export const dynamic = 'force-dynamic';

const pageStyle: CSSProperties = {
  minHeight: '100vh',
  background:
    'radial-gradient(circle at top left, rgba(96,165,250,0.16), transparent 0 28%), linear-gradient(135deg, #0b1730 0%, #102042 52%, #0a1730 100%)',
  color: '#f4f8ff',
  padding: '32px 18px 40px',
};

const shellStyle: CSSProperties = {
  maxWidth: '1240px',
  margin: '0 auto',
};

const cardStyle: CSSProperties = {
  background: 'linear-gradient(180deg, rgba(18, 31, 56, 0.96), rgba(16, 27, 49, 0.92))',
  border: '1px solid rgba(148, 163, 184, 0.22)',
  borderRadius: '20px',
  padding: '18px',
  boxShadow: '0 20px 45px rgba(2, 6, 23, 0.28)',
  backdropFilter: 'blur(10px)',
};

const metricCardStyle: CSSProperties = {
  ...cardStyle,
  minHeight: '152px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
};

const statusChipStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '6px 10px',
  borderRadius: '999px',
  border: '1px solid rgba(148, 163, 184, 0.18)',
  background: 'rgba(15, 23, 42, 0.72)',
  color: '#eef4ff',
  fontSize: '12px',
  fontWeight: 700,
};

const scrollAreaStyle: CSSProperties = {
  overflowY: 'auto',
  overflowX: 'hidden',
  paddingRight: '6px',
  scrollbarWidth: 'thin',
  scrollbarColor: 'rgba(96,165,250,0.45) rgba(15,23,42,0.35)',
};

const chartColors = ['#60a5fa', '#34d399', '#f59e0b', '#f472b6', '#a78bfa'];

type ChartPoint = {
  x: number;
  y: number;
  date: string;
  label: string;
  value: number;
};

type PieSlice = {
  color: string;
  label: string;
  percentage: number;
  value: number;
};

type SearchParamsRecord = Record<string, string | string[] | undefined>;

function getSearchParamValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${date}T00:00:00Z`));
}

function formatDateTime(dateTime: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(dateTime));
}

function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

function getObservedSpan(firstSeenAt: string, lastSeenAt: string): string {
  const first = new Date(firstSeenAt).getTime();
  const last = new Date(lastSeenAt).getTime();

  if (!Number.isFinite(first) || !Number.isFinite(last) || last <= first) {
    return '<1 min';
  }

  const minutes = Math.max(1, Math.round((last - first) / 60000));

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

function isReturningVisitor(visitor: AnalyticsVisitorRecord): boolean {
  const first = new Date(visitor.firstSeenAt).getTime();
  const last = new Date(visitor.lastSeenAt).getTime();
  const spanMinutes = Number.isFinite(first) && Number.isFinite(last) ? (last - first) / 60000 : 0;

  return visitor.viewCount >= 4 || spanMinutes >= 30 || visitor.pages.length >= 3;
}

function getVisitorIntentScore(visitor: AnalyticsVisitorRecord): number {
  const first = new Date(visitor.firstSeenAt).getTime();
  const last = new Date(visitor.lastSeenAt).getTime();
  const spanMinutes =
    Number.isFinite(first) && Number.isFinite(last) ? Math.max(0, (last - first) / 60000) : 0;

  return Math.min(
    100,
    visitor.conversionCount * 45 +
      Math.min(visitor.viewCount * 6, 30) +
      Math.min(visitor.pages.length * 5, 15) +
      (visitor.recentPages.includes('/contact') ? 15 : 0) +
      (visitor.company ? 10 : 0) +
      (visitor.lastInquiryType ? 8 : 0) +
      (spanMinutes >= 10 ? 8 : 0)
  );
}

function getVisitorIntentSummary(score: number): {
  label: string;
  tone: 'green' | 'blue' | 'amber' | 'slate';
} {
  if (score >= 75) {
    return { label: 'High intent', tone: 'green' };
  }

  if (score >= 55) {
    return { label: 'Warm', tone: 'amber' };
  }

  if (score >= 35) {
    return { label: 'Active', tone: 'blue' };
  }

  return { label: 'New', tone: 'slate' };
}

function getVisitorDisplayName(visitor: AnalyticsVisitorRecord): string {
  if (visitor.company) {
    return visitor.company;
  }

  if (visitor.ipAddress) {
    return `IP ${visitor.ipAddress}`;
  }

  return `Visitor ${visitor.id.slice(0, 8)}`;
}

function getVisitorCampaignLabel(visitor: AnalyticsVisitorRecord): string {
  return visitor.utmCampaign ?? visitor.utmSource ?? 'Unattributed';
}

function getVisitorQuickFacts(visitor: AnalyticsVisitorRecord): string {
  return [visitor.source, visitor.device, visitor.location ?? 'Location pending'].join(' · ');
}

function getDateKeyFromDateTime(value: string): string {
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed.toISOString().slice(0, 10) : '';
}

function wasVisitorActiveOnDay(visitor: AnalyticsVisitorRecord, dateKey: string): boolean {
  if (!dateKey) {
    return true;
  }

  const firstKey = getDateKeyFromDateTime(visitor.firstSeenAt);
  const lastKey = getDateKeyFromDateTime(visitor.lastSeenAt);

  return (
    firstKey === dateKey ||
    lastKey === dateKey ||
    Boolean(firstKey && lastKey && firstKey <= dateKey && lastKey >= dateKey)
  );
}

function getVisitorPriorityRank(visitor: AnalyticsVisitorRecord): number {
  const intentScore = getVisitorIntentScore(visitor);

  if (visitor.conversionCount > 0) {
    return 0;
  }

  if (intentScore >= 75) {
    return 1;
  }

  if (isReturningVisitor(visitor)) {
    return 2;
  }

  return 3;
}

function matchesVisitorQuery(visitor: AnalyticsVisitorRecord, query: string): boolean {
  if (!query) {
    return true;
  }

  const searchTarget = [
    visitor.id,
    visitor.ipAddress ?? '',
    visitor.company ?? '',
    visitor.source,
    visitor.location ?? '',
    visitor.device,
    visitor.utmSource ?? '',
    visitor.utmCampaign ?? '',
    visitor.lastInquiryType ?? '',
    ...visitor.recentPages,
    ...visitor.pages.map((page) => page.path),
  ]
    .join(' ')
    .toLowerCase();

  return searchTarget.includes(query);
}

function buildAdminVisitorHref(params: {
  visitorQuery?: string;
  source?: string;
  visitor?: string;
  day?: string;
}): string {
  const nextParams = new URLSearchParams();

  if (params.visitorQuery?.trim()) {
    nextParams.set('visitorQuery', params.visitorQuery.trim());
  }

  if (params.source && params.source !== 'all') {
    nextParams.set('source', params.source);
  }

  if (params.visitor?.trim()) {
    nextParams.set('visitor', params.visitor.trim());
  }

  if (params.day?.trim()) {
    nextParams.set('day', params.day.trim());
  }

  const queryString = nextParams.toString();
  return queryString ? `/admin?${queryString}#visitor-journeys` : '/admin#visitor-journeys';
}

function getChangeLabel(current: number, previous: number): string {
  if (previous === 0) {
    return current > 0 ? '+100%' : 'No change';
  }

  const delta = ((current - previous) / previous) * 100;
  const sign = delta >= 0 ? '+' : '';
  return `${sign}${delta.toFixed(0)}% vs yesterday`;
}

function getChartPoints(days: AnalyticsDayStat[]): ChartPoint[] {
  const width = 640;
  const height = 220;
  const maxValue = Math.max(...days.map((day) => day.totalViews), 1);

  return days.map((day, index) => ({
    x: days.length === 1 ? width / 2 : (index / (days.length - 1)) * width,
    y: height - (day.totalViews / maxValue) * 160 - 18,
    date: day.date,
    label: formatDate(day.date),
    value: day.totalViews,
  }));
}

function buildLinePath(points: ChartPoint[]): string {
  if (points.length === 0) {
    return '';
  }

  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
}

function buildAreaPath(points: ChartPoint[]): string {
  if (points.length === 0) {
    return '';
  }

  const first = points[0];
  const last = points[points.length - 1];
  return `M ${first.x} 220 ${points
    .map((point) => `L ${point.x} ${point.y}`)
    .join(' ')} L ${last.x} 220 Z`;
}

function getPieSlices(items: AnalyticsLabelStat[]): PieSlice[] {
  const topItems = items.slice(0, 5);
  const totalValue = topItems.reduce((sum, item) => sum + item.value, 0);

  if (totalValue === 0) {
    return [];
  }

  return topItems.map((item, index) => ({
    color: chartColors[index % chartColors.length],
    label: item.label,
    percentage: item.value / totalValue,
    value: item.value,
  }));
}

function buildPieBackground(slices: PieSlice[]): string {
  if (slices.length === 0) {
    return 'conic-gradient(#1e293b 0deg 360deg)';
  }

  let currentDegree = 0;
  const stops = slices.map((slice) => {
    const start = currentDegree;
    currentDegree += slice.percentage * 360;
    return `${slice.color} ${start}deg ${currentDegree}deg`;
  });

  if (currentDegree < 360) {
    stops.push(`#1e293b ${currentDegree}deg 360deg`);
  }

  return `conic-gradient(${stops.join(', ')})`;
}

function renderTopPageBars(pages: AnalyticsPageStat[], emptyMessage: string) {
  if (pages.length === 0) {
    return <p style={{ margin: 0, color: '#9fb0cd' }}>{emptyMessage}</p>;
  }

  const maxViews = Math.max(...pages.map((page) => page.views), 1);

  return (
    <div style={{ display: 'grid', gap: '12px' }}>
      {pages.slice(0, 6).map((page, index) => (
        <div key={page.path}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '12px',
              alignItems: 'center',
              marginBottom: '6px',
            }}
          >
            <span style={{ color: '#dbe7fb', fontWeight: 600, wordBreak: 'break-all' }}>
              {index + 1}. {page.path}
            </span>
            <span style={{ color: '#8fb6ff', fontWeight: 700 }}>{page.views}</span>
          </div>
          <div
            style={{
              height: '10px',
              borderRadius: '999px',
              background: 'rgba(30, 41, 59, 0.9)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${Math.max((page.views / maxViews) * 100, 10)}%`,
                height: '100%',
                borderRadius: '999px',
                background: `linear-gradient(90deg, ${chartColors[index % chartColors.length]}, #93c5fd)`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function renderLabelBars(items: AnalyticsLabelStat[], emptyMessage: string) {
  if (items.length === 0) {
    return <p style={{ margin: 0, color: '#9fb0cd' }}>{emptyMessage}</p>;
  }

  const maxValue = Math.max(...items.map((item) => item.value), 1);

  return (
    <div style={{ display: 'grid', gap: '12px' }}>
      {items.slice(0, 5).map((item, index) => (
        <div key={item.label}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '12px',
              alignItems: 'center',
              marginBottom: '6px',
            }}
          >
            <span style={{ color: '#dbe7fb', fontWeight: 600, wordBreak: 'break-word' }}>
              {item.label}
            </span>
            <span style={{ color: '#8fb6ff', fontWeight: 700 }}>{item.value}</span>
          </div>
          <div
            style={{
              height: '10px',
              borderRadius: '999px',
              background: 'rgba(30, 41, 59, 0.9)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${Math.max((item.value / maxValue) * 100, 12)}%`,
                height: '100%',
                borderRadius: '999px',
                background: `linear-gradient(90deg, ${chartColors[index % chartColors.length]}, rgba(125,211,252,0.95))`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function renderInfoTip(text: string) {
  return (
    <span
      title={text}
      aria-label={text}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        border: '1px solid rgba(96, 165, 250, 0.2)',
        background: 'rgba(59, 130, 246, 0.16)',
        color: '#8fb6ff',
        fontSize: '12px',
        lineHeight: 1,
        fontWeight: 800,
        cursor: 'help',
        flexShrink: 0,
        transform: 'translateY(-1px)',
      }}
    >
      ?
    </span>
  );
}

function sumLabelValues(items: AnalyticsLabelStat[]): number {
  return items.reduce((sum, item) => sum + item.value, 0);
}

function getPillStyle(tone: 'green' | 'blue' | 'amber' | 'slate' = 'blue'): CSSProperties {
  const toneMap = {
    green: {
      background: 'rgba(52,211,153,0.12)',
      color: '#86efac',
    },
    blue: {
      background: 'rgba(96,165,250,0.12)',
      color: '#93c5fd',
    },
    amber: {
      background: 'rgba(245,158,11,0.12)',
      color: '#fcd34d',
    },
    slate: {
      background: 'rgba(148,163,184,0.12)',
      color: '#cbd5e1',
    },
  } as const;

  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px 8px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 700,
    whiteSpace: 'nowrap',
    ...toneMap[tone],
  };
}

function renderPill(label: string, tone: 'green' | 'blue' | 'amber' | 'slate' = 'blue') {
  return <span style={getPillStyle(tone)}>{label}</span>;
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams?: SearchParamsRecord | Promise<SearchParamsRecord>;
}) {
  await requireAdminAccess();

  const resolvedSearchParams = (searchParams ? await searchParams : {}) ?? {};
  const activeVisitorQuery = getSearchParamValue(resolvedSearchParams.visitorQuery).trim();
  const normalizedVisitorQuery = activeVisitorQuery.toLowerCase();
  const activeSourceFilter = getSearchParamValue(resolvedSearchParams.source).trim() || 'all';
  const activeVisitorId = getSearchParamValue(resolvedSearchParams.visitor).trim();
  const activeDayParam = getSearchParamValue(resolvedSearchParams.day).trim();

  const snapshot = await getAnalyticsSnapshot();
  const today = snapshot.today;
  const yesterday = snapshot.recentDays.at(-2);
  const avgPagesPerVisitor =
    today.uniqueVisitors > 0 ? (today.totalViews / today.uniqueVisitors).toFixed(1) : '0.0';
  const total14DayViews = snapshot.recentDays.reduce((sum, day) => sum + day.totalViews, 0);
  const averageDailyViews =
    snapshot.recentDays.length > 0 ? Math.round(total14DayViews / snapshot.recentDays.length) : 0;
  const topSource = snapshot.topSourcesLast14Days[0]?.label ?? 'Direct';
  const topLocation = snapshot.locationBreakdownLast14Days[0]?.label ?? 'Location pending';
  const topCompanySignal = snapshot.companyBreakdownLast14Days[0]?.label ?? 'No company signal yet';
  const topTaggedSource = snapshot.utmSourceBreakdownLast14Days[0]?.label ?? 'No UTM source yet';
  const topCampaign = snapshot.campaignBreakdownLast14Days[0]?.label ?? 'No tagged campaign yet';
  const topLeadPage = snapshot.topLeadPagesLast14Days[0]?.label ?? 'Awaiting attributed leads';
  const strongestCta = snapshot.topCtaClicksLast14Days[0]?.label ?? 'Awaiting CTA clicks';
  const pipelineReadinessScore = Math.min(
    100,
    30 +
      Math.min(snapshot.contactSubmissionsLast14Days * 8, 24) +
      (snapshot.utmSourceBreakdownLast14Days.length > 0 ? 12 : 0) +
      (snapshot.topCtaClicksLast14Days.length > 0 ? 10 : 0) +
      (snapshot.companyBreakdownLast14Days.length > 0 ? 12 : 0) +
      (snapshot.topLeadPagesLast14Days.length > 0 ? 12 : 0)
  );
  const pipelineReadinessLabel =
    pipelineReadinessScore >= 80
      ? 'Hot pipeline'
      : pipelineReadinessScore >= 60
        ? 'Growing'
        : 'Setup phase';
  const alertInbox =
    process.env.LEAD_ALERT_TO_EMAIL || process.env.CONTACT_TO_EMAIL || 'flauntforesttech@gmail.com';
  const alertChannelStatus = process.env.LEAD_ALERT_WEBHOOK_URL ? 'Email + webhook' : alertInbox;
  const todayConversionRate =
    today.totalViews > 0 ? ((today.contactSubmissions / today.totalViews) * 100).toFixed(1) : '0.0';
  const chartPoints = getChartPoints(snapshot.recentDays);
  const pieSlices = getPieSlices(snapshot.topSourcesLast14Days);
  const totalCtaClicks = sumLabelValues(snapshot.topCtaClicksLast14Days);
  const contactPageViews =
    snapshot.topPagesLast14Days.find((page) => page.path === '/contact')?.views ?? 0;
  const likelyAccounts = snapshot.companyBreakdownLast14Days.slice(0, 5).map((company, index) => {
    const score = Math.min(
      96,
      48 +
        company.value * 10 +
        (index === 0 ? 10 : 0) +
        (snapshot.contactSubmissionsLast14Days > 0 ? 8 : 0)
    );
    const status = score >= 80 ? 'Hot' : score >= 65 ? 'Warm' : 'New';

    return {
      name: company.label,
      signalCount: company.value,
      status,
      score,
      region: snapshot.locationBreakdownLast14Days[index]?.label ?? topLocation,
      page:
        snapshot.topLeadPagesLast14Days[index]?.label ??
        snapshot.topPagesLast14Days[index]?.path ??
        '/',
    };
  });
  const availableDayKeys = snapshot.recentDays.map((day) => day.date);
  const activeDay = availableDayKeys.includes(activeDayParam) ? activeDayParam : today.date;
  const selectedDay = snapshot.recentDays.find((day) => day.date === activeDay) ?? today;
  const recentSelectableDays = snapshot.recentDays.slice(-7).reverse();
  const visitorSourceOptions = Array.from(
    new Set(
      snapshot.recentVisitors
        .filter((visitor) => wasVisitorActiveOnDay(visitor, activeDay))
        .map((visitor) => visitor.source.trim())
        .filter((source) => source.length > 0)
    )
  ).sort((left, right) => left.localeCompare(right));
  const filteredVisitors = [...snapshot.recentVisitors]
    .filter((visitor) => wasVisitorActiveOnDay(visitor, activeDay))
    .filter((visitor) => matchesVisitorQuery(visitor, normalizedVisitorQuery))
    .filter((visitor) => activeSourceFilter === 'all' || visitor.source === activeSourceFilter)
    .sort((left, right) => {
      const rankDifference = getVisitorPriorityRank(left) - getVisitorPriorityRank(right);

      if (rankDifference !== 0) {
        return rankDifference;
      }

      const intentDifference = getVisitorIntentScore(right) - getVisitorIntentScore(left);

      if (intentDifference !== 0) {
        return intentDifference;
      }

      return new Date(right.lastSeenAt).getTime() - new Date(left.lastSeenAt).getTime();
    });
  const priorityVisitorCount = filteredVisitors.filter(
    (visitor) => visitor.conversionCount > 0 || getVisitorIntentScore(visitor) >= 75
  ).length;
  const selectedVisitor =
    filteredVisitors.find((visitor) => visitor.id === activeVisitorId) ??
    filteredVisitors[0] ??
    null;

  const aiScout = buildProspectScout(filteredVisitors);

  const sourceComparison = snapshot.topSourcesLast14Days.slice(0, 5).map((source) => {
    const trafficShare = total14DayViews > 0 ? (source.value / total14DayViews) * 100 : 0;
    const estimatedLeads = (source.value * snapshot.conversionRateLast14Days) / 100;
    const priority =
      estimatedLeads >= 3 || trafficShare >= 20 ? 'Scale' : estimatedLeads >= 1 ? 'Watch' : 'Test';

    return {
      ...source,
      trafficShare,
      estimatedLeads,
      priority,
    };
  });
  const funnelSteps = [
    {
      label: 'All visits',
      value: total14DayViews,
      helper: 'People who reached the site',
    },
    {
      label: 'CTA clicks',
      value: totalCtaClicks,
      helper: 'Visitors who clicked a tracked action',
    },
    {
      label: 'Contact page',
      value: contactPageViews,
      helper: 'Visits to the contact page',
    },
    {
      label: 'Leads captured',
      value: snapshot.contactSubmissionsLast14Days,
      helper: 'Successful contact submissions',
    },
  ];
  const highIntentSignals = [
    {
      label: 'Best company signal',
      value: topCompanySignal,
      note: 'Good target for follow-up',
    },
    {
      label: 'Best converting page',
      value: topLeadPage,
      note: 'Where form intent is strongest',
    },
    {
      label: 'Campaign to push',
      value: topCampaign,
      note: 'Most promising tagged traffic',
    },
    {
      label: 'Fastest next step',
      value: `Email ${alertInbox}`,
      note: 'Check the inbox for new leads',
    },
  ];

  return (
    <div style={pageStyle}>
      <AdminIdleGuard />
      <div style={shellStyle}>
        <section
          style={{
            ...cardStyle,
            padding: '24px',
            marginBottom: '18px',
            background:
              'linear-gradient(135deg, rgba(15,23,42,0.96), rgba(10,20,40,0.92)), radial-gradient(circle at top right, rgba(96,165,250,0.22), transparent 0 32%)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '18px',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 10px',
                  borderRadius: '999px',
                  background: 'rgba(37, 99, 235, 0.18)',
                  color: '#8fb6ff',
                  fontWeight: 700,
                  fontSize: '13px',
                  marginBottom: '10px',
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: snapshot.source === 'redis' ? '#34d399' : '#f59e0b',
                  }}
                />
                Internal analytics dashboard
              </div>
              <h1
                style={{
                  margin: '0 0 8px',
                  fontSize: '38px',
                  lineHeight: 1.1,
                  color: '#f8fbff',
                  textShadow: '0 1px 2px rgba(2, 6, 23, 0.35)',
                }}
              >
                Company traffic cockpit
              </h1>
              <p style={{ margin: 0, color: '#d9e6fb', lineHeight: 1.7 }}>
                Signed in as <strong>{getAdminUsername()}</strong> · Updated{' '}
                {formatDateTime(snapshot.generatedAt)}
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                <span style={statusChipStyle}>Pipeline {pipelineReadinessScore}/100</span>
                <span style={statusChipStyle}>Top source: {topSource}</span>
                <span style={statusChipStyle}>Lead inbox: {alertInbox}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background:
                    snapshot.source === 'redis' ? 'rgba(16,185,129,0.14)' : 'rgba(245,158,11,0.14)',
                  color: snapshot.source === 'redis' ? '#86efac' : '#fcd34d',
                  fontWeight: 700,
                }}
              >
                {snapshot.source === 'redis' ? 'Live Redis storage' : 'File backup mode'}
              </div>
              <form action="/api/admin/logout" method="post">
                <button
                  type="submit"
                  style={{
                    border: '1px solid rgba(148, 163, 184, 0.26)',
                    background: '#13203a',
                    color: '#ffffff',
                    borderRadius: '12px',
                    padding: '11px 16px',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  Log out
                </button>
              </form>
            </div>
          </div>
        </section>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '14px',
            marginBottom: '18px',
            alignItems: 'stretch',
          }}
        >
          {[
            {
              label: "Today's page views",
              value: formatCompactNumber(today.totalViews),
              note: getChangeLabel(today.totalViews, yesterday?.totalViews ?? 0),
              tip: 'Daily tracked page volume across the site.',
            },
            {
              label: 'Unique visitors',
              value: formatCompactNumber(today.uniqueVisitors),
              note: `${avgPagesPerVisitor} pages / visitor`,
              tip: 'Estimated reach after filtering repeat browsing.',
            },
            {
              label: 'Contact submissions',
              value: formatCompactNumber(today.contactSubmissions),
              note: `${todayConversionRate}% CVR today`,
              tip: 'Captured leads from the contact flow.',
            },
            {
              label: 'Top acquisition source',
              value: topSource,
              note: snapshot.topSourcesLast14Days[0]
                ? `Region: ${topLocation}`
                : 'Awaiting source data',
              tip: 'Current strongest traffic channel.',
            },
            {
              label: '14-day average',
              value: formatCompactNumber(averageDailyViews),
              note: `Company signal: ${topCompanySignal}`,
              tip: 'Baseline traffic trend for the past two weeks.',
            },
          ].map((metric) => (
            <section key={metric.label} style={metricCardStyle}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  marginBottom: '10px',
                }}
              >
                <p style={{ margin: 0, color: '#93a8c9' }}>{metric.label}</p>
                {renderInfoTip(metric.tip)}
              </div>
              <h2
                style={{
                  margin: '0 0 8px',
                  fontSize: '30px',
                  lineHeight: 1.2,
                  wordBreak: 'break-word',
                  color: '#f8fbff',
                  textShadow: '0 1px 2px rgba(2, 6, 23, 0.28)',
                }}
              >
                {metric.value}
              </h2>
              <p style={{ margin: 0, color: '#bfe0ff' }}>{metric.note}</p>
            </section>
          ))}
        </div>

        <section style={{ ...cardStyle, marginBottom: '18px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap',
              marginBottom: '14px',
            }}
          >
            <div>
              <p style={{ margin: '0 0 6px', color: '#8fb6ff', fontWeight: 700 }}>Lead board</p>
              <h2 style={{ margin: 0, fontSize: '24px', color: '#f8fbff' }}>Priority follow-up</h2>
            </div>
            <div style={{ color: '#7dd3fc', fontWeight: 700 }}>
              {likelyAccounts.filter((account) => account.status === 'Hot').length} hot account
              signals
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '12px',
              alignItems: 'stretch',
            }}
          >
            {highIntentSignals.map((item) => (
              <div
                key={item.label}
                style={{
                  borderRadius: '14px',
                  padding: '14px',
                  background: 'rgba(12, 22, 40, 0.9)',
                  border: '1px solid rgba(148,163,184,0.08)',
                }}
              >
                <div style={{ color: '#93a8c9', fontSize: '13px', marginBottom: '8px' }}>
                  {item.label}
                </div>
                <strong style={{ fontSize: '18px', wordBreak: 'break-word' }}>{item.value}</strong>
                <div style={{ color: '#cfe5ff', marginTop: '8px' }}>{item.note}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ ...cardStyle, marginBottom: '18px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap',
              marginBottom: '14px',
            }}
          >
            <div>
              <p style={{ margin: '0 0 6px', color: '#8fb6ff', fontWeight: 700 }}>
                AI Prospect Scout
              </p>
              <h2 style={{ margin: 0, fontSize: '24px', color: '#f8fbff' }}>
                Likely customers for {formatDate(selectedDay.date)}
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {renderPill(`${aiScout.hotCount} hot`, aiScout.hotCount > 0 ? 'green' : 'slate')}
              {renderPill(`${aiScout.returningCount} returning`, 'blue')}
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.05fr) minmax(280px, 0.95fr)',
              gap: '14px',
              alignItems: 'stretch',
            }}
          >
            <div
              style={{
                borderRadius: '16px',
                padding: '14px',
                background: 'rgba(8, 15, 30, 0.58)',
                border: '1px solid rgba(148,163,184,0.12)',
              }}
            >
              <div
                style={{ color: '#f8fbff', fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}
              >
                {aiScout.headline}
              </div>
              <p style={{ margin: '0 0 12px', color: '#cfe5ff', lineHeight: 1.7 }}>
                {aiScout.summary}
              </p>
              <div style={{ color: '#93a8c9', fontSize: '13px', marginBottom: '12px' }}>
                Recommended next move:{' '}
                <strong style={{ color: '#dbe7fb' }}>{aiScout.actionLabel}</strong>
              </div>

              {aiScout.items.length === 0 ? (
                <p style={{ margin: 0, color: '#9fb0cd' }}>
                  The scout will rank likely prospects once more visitor behavior comes in.
                </p>
              ) : (
                <div
                  style={{ ...scrollAreaStyle, display: 'grid', gap: '10px', maxHeight: '320px' }}
                >
                  {aiScout.items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        borderRadius: '14px',
                        padding: '12px',
                        background: 'rgba(12, 22, 40, 0.9)',
                        border: '1px solid rgba(148,163,184,0.08)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: '12px',
                          alignItems: 'center',
                          marginBottom: '8px',
                        }}
                      >
                        <strong style={{ color: '#f8fbff', wordBreak: 'break-word' }}>
                          {item.name}
                        </strong>
                        {renderPill(
                          `${item.priority} · ${item.score}/100`,
                          item.priority === 'Hot'
                            ? 'green'
                            : item.priority === 'Warm'
                              ? 'amber'
                              : 'blue'
                        )}
                      </div>
                      <p style={{ margin: '0 0 8px', color: '#cfe5ff', lineHeight: 1.6 }}>
                        {item.summary}
                      </p>
                      <div style={{ color: '#93a8c9', fontSize: '13px' }}>
                        Next step: <strong style={{ color: '#dbe7fb' }}>{item.nextAction}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div
              style={{
                borderRadius: '16px',
                padding: '14px',
                background: 'rgba(8, 15, 30, 0.58)',
                border: '1px solid rgba(148,163,184,0.12)',
              }}
            >
              <div
                style={{
                  color: '#f8fbff',
                  fontSize: '18px',
                  fontWeight: 800,
                  marginBottom: '10px',
                }}
              >
                Why these visitors matter
              </div>
              {aiScout.items.length === 0 ? (
                <p style={{ margin: 0, color: '#9fb0cd' }}>
                  Once visitors start exploring more of the site, the scout will explain the
                  strongest signals here.
                </p>
              ) : (
                <div
                  style={{ ...scrollAreaStyle, display: 'grid', gap: '10px', maxHeight: '320px' }}
                >
                  {aiScout.items.map((item) => (
                    <div
                      key={`${item.id}-reasons`}
                      style={{
                        borderRadius: '14px',
                        padding: '12px',
                        background: 'rgba(12, 22, 40, 0.9)',
                        border: '1px solid rgba(148,163,184,0.08)',
                      }}
                    >
                      <div style={{ color: '#dbe7fb', fontWeight: 700, marginBottom: '8px' }}>
                        {item.name}
                      </div>
                      <div style={{ display: 'grid', gap: '6px' }}>
                        {item.reasons.map((reason) => (
                          <div
                            key={`${item.id}-${reason}`}
                            style={{ color: '#cfe5ff', fontSize: '13px' }}
                          >
                            • {reason}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '16px',
            marginBottom: '18px',
            alignItems: 'stretch',
          }}
        >
          <section style={{ ...cardStyle, overflow: 'hidden' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap',
                marginBottom: '14px',
              }}
            >
              <div>
                <p style={{ margin: '0 0 6px', color: '#8fb6ff', fontWeight: 700 }}>
                  Traffic trend
                </p>
                <h2 style={{ margin: 0, fontSize: '24px', color: '#f8fbff' }}>Last 14 days</h2>
              </div>
              <p style={{ margin: 0, color: '#9fb0cd' }}>Views per day, updated automatically</p>
            </div>

            <div
              style={{
                position: 'relative',
                borderRadius: '16px',
                padding: '12px 10px 8px',
                background: 'linear-gradient(180deg, rgba(10,18,34,0.95), rgba(8,15,28,0.9))',
                border: '1px solid rgba(148,163,184,0.08)',
              }}
            >
              <svg
                viewBox="0 0 640 240"
                width="100%"
                height="240"
                role="img"
                aria-label="Traffic trend chart"
              >
                <defs>
                  <linearGradient id="trafficArea" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="rgba(96,165,250,0.45)" />
                    <stop offset="100%" stopColor="rgba(96,165,250,0.04)" />
                  </linearGradient>
                </defs>

                {[40, 90, 140, 190].map((line) => (
                  <line
                    key={line}
                    x1="0"
                    x2="640"
                    y1={line}
                    y2={line}
                    stroke="rgba(148,163,184,0.12)"
                    strokeDasharray="4 6"
                  />
                ))}

                <path d={buildAreaPath(chartPoints)} fill="url(#trafficArea)" />
                <path
                  d={buildLinePath(chartPoints)}
                  fill="none"
                  stroke="#60a5fa"
                  strokeWidth="4"
                  strokeLinecap="round"
                />

                {chartPoints.map((point) => (
                  <g key={point.date}>
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r="5"
                      fill="#0f172a"
                      stroke="#93c5fd"
                      strokeWidth="3"
                    />
                  </g>
                ))}
              </svg>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${Math.min(chartPoints.length, 7) || 1}, 1fr)`,
                  gap: '8px',
                  color: '#9fb0cd',
                  fontSize: '12px',
                  marginTop: '-6px',
                }}
              >
                {chartPoints
                  .filter((_, index) => index % Math.ceil(chartPoints.length / 7 || 1) === 0)
                  .map((point) => (
                    <div key={point.date}>
                      <div>{point.label}</div>
                      <strong style={{ color: '#dbe7fb' }}>{point.value}</strong>
                    </div>
                  ))}
              </div>
            </div>
          </section>

          <section style={cardStyle}>
            <p style={{ margin: '0 0 6px', color: '#8fb6ff', fontWeight: 700 }}>Traffic sources</p>
            <h2 style={{ marginTop: 0, fontSize: '24px', color: '#f8fbff' }}>
              Where visitors came from
            </h2>

            <div style={{ display: 'grid', justifyItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '190px',
                  height: '190px',
                  borderRadius: '50%',
                  background: buildPieBackground(pieSlices),
                  position: 'relative',
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: '24px',
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    background: '#132544',
                    textAlign: 'center',
                    padding: '10px',
                  }}
                >
                  <div>
                    <div style={{ color: '#8fb6ff', fontSize: '12px', marginBottom: '4px' }}>
                      Top source
                    </div>
                    <div style={{ fontSize: '22px', fontWeight: 800, wordBreak: 'break-word' }}>
                      {topSource}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ width: '100%', display: 'grid', gap: '10px' }}>
                {pieSlices.length === 0 ? (
                  <p style={{ margin: 0, color: '#9fb0cd' }}>
                    Source breakdown will appear after more visits come in.
                  </p>
                ) : (
                  pieSlices.map((slice) => (
                    <div
                      key={slice.label}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '12px',
                        alignItems: 'center',
                      }}
                    >
                      <div
                        style={{ display: 'flex', gap: '10px', alignItems: 'center', minWidth: 0 }}
                      >
                        <span
                          style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: slice.color,
                          }}
                        />
                        <span style={{ color: '#dbe7fb', wordBreak: 'break-all' }}>
                          {slice.label}
                        </span>
                      </div>
                      <strong style={{ color: '#8fb6ff' }}>
                        {Math.round(slice.percentage * 100)}%
                      </strong>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '16px',
            marginBottom: '18px',
            alignItems: 'stretch',
          }}
        >
          <section style={cardStyle}>
            <p style={{ margin: '0 0 6px', color: '#8fb6ff', fontWeight: 700 }}>Page performance</p>
            <h2 style={{ marginTop: 0, fontSize: '24px', color: '#f8fbff' }}>Most visited pages</h2>
            {renderTopPageBars(
              snapshot.topPagesLast14Days,
              'Traffic data will appear here after the first visits.'
            )}
          </section>

          <section style={cardStyle}>
            <p style={{ margin: '0 0 6px', color: '#8fb6ff', fontWeight: 700 }}>
              Visitor intelligence
            </p>
            <h2 style={{ marginTop: 0, fontSize: '24px', color: '#f8fbff' }}>
              Devices, regions & company signals
            </h2>

            <div style={{ ...scrollAreaStyle, display: 'grid', gap: '18px', maxHeight: '560px' }}>
              <div>
                <h3 style={{ margin: '0 0 10px', fontSize: '16px', color: '#dbe7fb' }}>
                  Device mix
                </h3>
                {renderLabelBars(
                  snapshot.deviceBreakdownLast14Days,
                  'Device data will appear after more visits.'
                )}
              </div>

              <div>
                <h3 style={{ margin: '0 0 10px', fontSize: '16px', color: '#dbe7fb' }}>
                  Top regions
                </h3>
                {renderLabelBars(
                  snapshot.locationBreakdownLast14Days,
                  'Region and city data will populate on Vercel traffic.'
                )}
              </div>

              <div>
                <h3 style={{ margin: '0 0 10px', fontSize: '16px', color: '#dbe7fb' }}>
                  Company signals
                </h3>
                {renderLabelBars(
                  snapshot.companyBreakdownLast14Days,
                  'Company-level signals come from lead email domains or network headers when available.'
                )}
              </div>

              <div>
                <h3 style={{ margin: '0 0 10px', fontSize: '16px', color: '#dbe7fb' }}>
                  Lead intent
                </h3>
                {renderLabelBars(
                  snapshot.inquiryBreakdownLast14Days,
                  'Inquiry topics will show after contact form submissions.'
                )}
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: '10px',
                }}
              >
                <div
                  style={{
                    borderRadius: '14px',
                    padding: '12px',
                    background: 'rgba(12, 22, 40, 0.9)',
                    border: '1px solid rgba(148,163,184,0.08)',
                  }}
                >
                  <div style={{ color: '#93a8c9', fontSize: '13px', marginBottom: '6px' }}>
                    14-day leads
                  </div>
                  <strong style={{ fontSize: '24px' }}>
                    {formatCompactNumber(snapshot.contactSubmissionsLast14Days)}
                  </strong>
                </div>
                <div
                  style={{
                    borderRadius: '14px',
                    padding: '12px',
                    background: 'rgba(12, 22, 40, 0.9)',
                    border: '1px solid rgba(148,163,184,0.08)',
                  }}
                >
                  <div style={{ color: '#93a8c9', fontSize: '13px', marginBottom: '6px' }}>
                    14-day conversion
                  </div>
                  <strong style={{ fontSize: '24px' }}>
                    {snapshot.conversionRateLast14Days.toFixed(1)}%
                  </strong>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '16px',
            marginBottom: '18px',
            alignItems: 'stretch',
          }}
        >
          <section style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <p style={{ margin: 0, color: '#8fb6ff', fontWeight: 700 }}>Acquisition funnel</p>
              {renderInfoTip(
                'This turns your traffic into a simple pipeline view: visit → click → contact → lead.'
              )}
            </div>
            <h2 style={{ marginTop: 0, fontSize: '24px', color: '#f8fbff' }}>
              Where the drop-off happens
            </h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              {funnelSteps.map((step, index) => {
                const previousValue = funnelSteps[index - 1]?.value ?? step.value;
                const stepRate = previousValue > 0 ? (step.value / previousValue) * 100 : 100;

                return (
                  <div key={step.label}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '12px',
                        alignItems: 'center',
                        marginBottom: '6px',
                      }}
                    >
                      <div>
                        <div style={{ color: '#dbe7fb', fontWeight: 700 }}>{step.label}</div>
                        <div style={{ color: '#93a8c9', fontSize: '13px' }}>{step.helper}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ color: '#8fb6ff', fontWeight: 800 }}>
                          {formatCompactNumber(step.value)}
                        </div>
                        <div style={{ color: '#93a8c9', fontSize: '12px' }}>
                          {stepRate.toFixed(0)}%
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        height: '10px',
                        borderRadius: '999px',
                        background: 'rgba(30, 41, 59, 0.9)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.max(stepRate, 10)}%`,
                          height: '100%',
                          borderRadius: '999px',
                          background: `linear-gradient(90deg, ${chartColors[index % chartColors.length]}, #93c5fd)`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <p style={{ margin: 0, color: '#8fb6ff', fontWeight: 700 }}>Channel comparison</p>
              {renderInfoTip(
                'Priority is based on traffic share and your current lead conversion rate, so you can decide where to push harder.'
              )}
            </div>
            <h2 style={{ marginTop: 0, fontSize: '24px', color: '#f8fbff' }}>Channel efficiency</h2>
            {sourceComparison.length === 0 ? (
              <p style={{ margin: 0, color: '#9fb0cd' }}>
                Channel performance will appear after more tracked visits.
              </p>
            ) : (
              <div
                style={{
                  overflowX: 'auto',
                  overflowY: 'auto',
                  maxHeight: '320px',
                  paddingRight: '6px',
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', color: '#dbe7fb' }}>
                  <thead>
                    <tr style={{ color: '#93a8c9', textAlign: 'left' }}>
                      <th style={{ padding: '0 0 10px' }}>Channel</th>
                      <th style={{ padding: '0 0 10px' }}>Visits</th>
                      <th style={{ padding: '0 0 10px' }}>Share</th>
                      <th style={{ padding: '0 0 10px' }}>Lead potential</th>
                      <th style={{ padding: '0 0 10px' }}>Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sourceComparison.map((row) => (
                      <tr key={row.label} style={{ borderTop: '1px solid rgba(148,163,184,0.08)' }}>
                        <td style={{ padding: '10px 0', fontWeight: 700 }}>{row.label}</td>
                        <td style={{ padding: '10px 0' }}>{row.value}</td>
                        <td style={{ padding: '10px 0' }}>{row.trafficShare.toFixed(0)}%</td>
                        <td style={{ padding: '10px 0' }}>{row.estimatedLeads.toFixed(1)}</td>
                        <td style={{ padding: '10px 0' }}>
                          {renderPill(
                            row.priority,
                            row.priority === 'Scale'
                              ? 'green'
                              : row.priority === 'Watch'
                                ? 'blue'
                                : 'amber'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
            marginBottom: '18px',
          }}
        >
          <section style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <p style={{ margin: 0, color: '#8fb6ff', fontWeight: 700 }}>Campaign intelligence</p>
              {renderInfoTip(
                'UTM parameters help identify which traffic source, campaign, or channel brought a visitor to the site.'
              )}
            </div>
            <h2 style={{ marginTop: 0, fontSize: '24px', color: '#f8fbff' }}>
              Campaign attribution
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '10px',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  borderRadius: '14px',
                  padding: '12px',
                  background: 'rgba(12, 22, 40, 0.9)',
                  border: '1px solid rgba(148,163,184,0.08)',
                }}
              >
                <div style={{ color: '#93a8c9', fontSize: '13px', marginBottom: '6px' }}>
                  Top tagged source
                </div>
                <strong style={{ fontSize: '18px', wordBreak: 'break-word' }}>
                  {topTaggedSource}
                </strong>
              </div>
              <div
                style={{
                  borderRadius: '14px',
                  padding: '12px',
                  background: 'rgba(12, 22, 40, 0.9)',
                  border: '1px solid rgba(148,163,184,0.08)',
                }}
              >
                <div style={{ color: '#93a8c9', fontSize: '13px', marginBottom: '6px' }}>
                  Top campaign
                </div>
                <strong style={{ fontSize: '18px', wordBreak: 'break-word' }}>{topCampaign}</strong>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <h3 style={{ margin: '0 0 10px', fontSize: '16px', color: '#dbe7fb' }}>
                  UTM sources
                </h3>
                {renderLabelBars(
                  snapshot.utmSourceBreakdownLast14Days,
                  'Start tagging your ads and social links with utm_source to see channel quality here.'
                )}
              </div>
              <div>
                <h3 style={{ margin: '0 0 10px', fontSize: '16px', color: '#dbe7fb' }}>
                  Campaign names
                </h3>
                {renderLabelBars(
                  snapshot.campaignBreakdownLast14Days,
                  'Campaign-level visibility will appear once links include utm_campaign values.'
                )}
              </div>
            </div>
          </section>

          <section style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <p style={{ margin: 0, color: '#8fb6ff', fontWeight: 700 }}>Conversion path</p>
              {renderInfoTip(
                'CTA means Call To Action — buttons or links such as Contact Us, Get Started, or Send Message that prompt the visitor to take the next step.'
              )}
            </div>
            <h2 style={{ marginTop: 0, fontSize: '24px', color: '#f8fbff' }}>Intent drivers</h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '10px',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  borderRadius: '14px',
                  padding: '12px',
                  background: 'rgba(12, 22, 40, 0.9)',
                  border: '1px solid rgba(148,163,184,0.08)',
                }}
              >
                <div style={{ color: '#93a8c9', fontSize: '13px', marginBottom: '6px' }}>
                  Strongest CTA
                </div>
                <strong style={{ fontSize: '18px', wordBreak: 'break-word' }}>
                  {strongestCta}
                </strong>
              </div>
              <div
                style={{
                  borderRadius: '14px',
                  padding: '12px',
                  background: 'rgba(12, 22, 40, 0.9)',
                  border: '1px solid rgba(148,163,184,0.08)',
                }}
              >
                <div style={{ color: '#93a8c9', fontSize: '13px', marginBottom: '6px' }}>
                  Top lead page
                </div>
                <strong style={{ fontSize: '18px', wordBreak: 'break-word' }}>{topLeadPage}</strong>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <h3 style={{ margin: '0 0 10px', fontSize: '16px', color: '#dbe7fb' }}>
                  Most clicked CTAs
                </h3>
                {renderLabelBars(
                  snapshot.topCtaClicksLast14Days,
                  'CTA click insight will appear after visitors start using the site buttons and contact links.'
                )}
              </div>
              <div>
                <h3 style={{ margin: '0 0 10px', fontSize: '16px', color: '#dbe7fb' }}>
                  Pages creating leads
                </h3>
                {renderLabelBars(
                  snapshot.topLeadPagesLast14Days,
                  'Lead source pages will populate after tracked form submissions come through.'
                )}
              </div>
            </div>
          </section>

          <section style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <p style={{ margin: 0, color: '#8fb6ff', fontWeight: 700 }}>Follow-up playbook</p>
              {renderInfoTip(
                'Use this section to decide who to retarget, which region to prioritize, and where to focus outreach next.'
              )}
            </div>
            <h2 style={{ marginTop: 0, fontSize: '24px', color: '#f8fbff' }}>Action plan</h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '10px',
                marginBottom: '14px',
              }}
            >
              <div
                style={{
                  borderRadius: '14px',
                  padding: '12px',
                  background: 'rgba(12, 22, 40, 0.9)',
                  border: '1px solid rgba(148,163,184,0.08)',
                }}
              >
                <div style={{ color: '#93a8c9', fontSize: '13px', marginBottom: '6px' }}>
                  Pipeline score
                </div>
                <strong style={{ fontSize: '24px' }}>{pipelineReadinessScore}/100</strong>
                <div style={{ color: '#cfe5ff', marginTop: '6px' }}>{pipelineReadinessLabel}</div>
              </div>
              <div
                style={{
                  borderRadius: '14px',
                  padding: '12px',
                  background: 'rgba(12, 22, 40, 0.9)',
                  border: '1px solid rgba(148,163,184,0.08)',
                }}
              >
                <div style={{ color: '#93a8c9', fontSize: '13px', marginBottom: '6px' }}>
                  Alert channel
                </div>
                <strong style={{ fontSize: '20px', wordBreak: 'break-word' }}>
                  {alertChannelStatus}
                </strong>
                <div style={{ color: '#cfe5ff', marginTop: '6px' }}>
                  {process.env.LEAD_ALERT_WEBHOOK_URL
                    ? `Primary inbox: ${alertInbox}. Webhook alerts are also active.`
                    : `New lead emails will go directly to ${alertInbox}.`}
                </div>
              </div>
            </div>

            <div
              style={{
                height: '10px',
                borderRadius: '999px',
                background: 'rgba(30, 41, 59, 0.9)',
                overflow: 'hidden',
                marginBottom: '14px',
              }}
            >
              <div
                style={{
                  width: `${Math.max(pipelineReadinessScore, 10)}%`,
                  height: '100%',
                  borderRadius: '999px',
                  background: 'linear-gradient(90deg, #34d399, #60a5fa)',
                }}
              />
            </div>

            <div style={{ ...scrollAreaStyle, display: 'grid', gap: '12px', maxHeight: '280px' }}>
              {[
                `Double down on ${topSource} because it is currently your strongest traffic source.`,
                `Run tighter offers around ${topCampaign} and ${topTaggedSource} so you can attribute real pipeline back to campaigns.`,
                `Prioritize follow-up around ${topCompanySignal} and ${topLeadPage} when you see repeat business signals or lead-form activity.`,
              ].map((item, index) => (
                <div
                  key={item}
                  style={{
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'flex-start',
                    padding: '12px',
                    borderRadius: '14px',
                    background: 'rgba(12, 22, 40, 0.9)',
                    border: '1px solid rgba(148,163,184,0.08)',
                  }}
                >
                  <span
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      display: 'inline-grid',
                      placeItems: 'center',
                      background: 'rgba(59,130,246,0.16)',
                      color: chartColors[index % chartColors.length],
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </span>
                  <span style={{ color: '#dbe7fb', lineHeight: 1.6 }}>{item}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '16px',
            marginBottom: '18px',
            alignItems: 'stretch',
          }}
        >
          <section style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <p style={{ margin: 0, color: '#8fb6ff', fontWeight: 700 }}>Accounts</p>
              {renderInfoTip(
                'These are likely accounts inferred from company signals, business email domains, and repeated interest patterns.'
              )}
            </div>
            <h2 style={{ marginTop: 0, fontSize: '24px', color: '#f8fbff' }}>Account watchlist</h2>
            {likelyAccounts.length === 0 ? (
              <p style={{ margin: 0, color: '#9fb0cd' }}>
                Once business traffic or company-backed leads appear, the watchlist will populate
                here.
              </p>
            ) : (
              <div style={{ ...scrollAreaStyle, display: 'grid', gap: '8px', maxHeight: '330px' }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.5fr 1fr auto auto',
                    gap: '12px',
                    padding: '0 4px',
                    color: '#93a8c9',
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  <span>Account</span>
                  <span>Region</span>
                  <span>Score</span>
                  <span>Status</span>
                </div>
                {likelyAccounts.map((account) => (
                  <div
                    key={account.name}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.5fr 1fr auto auto',
                      gap: '12px',
                      alignItems: 'center',
                      padding: '12px',
                      borderRadius: '14px',
                      background: 'rgba(12, 22, 40, 0.9)',
                      border: '1px solid rgba(148,163,184,0.08)',
                    }}
                  >
                    <div>
                      <div style={{ color: '#dbe7fb', fontWeight: 700, wordBreak: 'break-word' }}>
                        {account.name}
                      </div>
                      <div style={{ color: '#93a8c9', fontSize: '13px', marginTop: '4px' }}>
                        {account.page} · {account.signalCount} signal
                        {account.signalCount === 1 ? '' : 's'}
                      </div>
                    </div>
                    <div style={{ color: '#cbd5e1', fontSize: '13px' }}>{account.region}</div>
                    <div style={{ color: '#8fb6ff', fontWeight: 800 }}>{account.score}/100</div>
                    <div>
                      {renderPill(
                        account.status,
                        account.status === 'Hot'
                          ? 'green'
                          : account.status === 'Warm'
                            ? 'blue'
                            : 'slate'
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <p style={{ margin: 0, color: '#8fb6ff', fontWeight: 700 }}>Lead timeline</p>
              {renderInfoTip(
                'A quick read on the last few days of lead activity, best source signals, and where follow-up attention should go.'
              )}
            </div>
            <h2 style={{ marginTop: 0, fontSize: '24px', color: '#f8fbff' }}>Lead timeline</h2>
            <div style={{ ...scrollAreaStyle, display: 'grid', gap: '10px', maxHeight: '360px' }}>
              {snapshot.recentDays
                .slice(-7)
                .reverse()
                .map((day) => (
                  <div
                    key={day.date}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'auto 1fr auto',
                      gap: '12px',
                      alignItems: 'start',
                      padding: '12px',
                      borderRadius: '14px',
                      background: 'rgba(12, 22, 40, 0.9)',
                      border: '1px solid rgba(148,163,184,0.08)',
                    }}
                  >
                    <span
                      style={{
                        width: '10px',
                        height: '10px',
                        marginTop: '6px',
                        borderRadius: '50%',
                        background: day.contactSubmissions > 0 ? '#34d399' : '#60a5fa',
                      }}
                    />
                    <div>
                      <div style={{ color: '#dbe7fb', fontWeight: 700 }}>
                        {formatDate(day.date)}
                      </div>
                      <div style={{ color: '#93a8c9', fontSize: '13px', lineHeight: 1.6 }}>
                        {day.contactSubmissions > 0
                          ? `${day.contactSubmissions} lead(s) captured from ${day.sources[0]?.label ?? 'Direct'} traffic.`
                          : `${day.totalViews} visits and ${day.ctaClicks[0]?.value ?? 0} CTA signal(s) from ${day.sources[0]?.label ?? 'Direct'}.`}
                      </div>
                      <div style={{ color: '#7dd3fc', fontSize: '13px', marginTop: '4px' }}>
                        {day.companies[0]?.label ??
                          day.inquiryTypes[0]?.label ??
                          'No explicit company signal yet'}
                      </div>
                    </div>
                    <div>
                      {renderPill(
                        day.contactSubmissions > 0 ? 'Follow up' : 'Nurture',
                        day.contactSubmissions > 0 ? 'green' : 'blue'
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </section>
        </div>

        <section style={{ ...cardStyle, marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <p style={{ margin: 0, color: '#8fb6ff', fontWeight: 700 }}>Visitor journeys</p>
            {renderInfoTip(
              'This is best-effort matching: the same browser usually keeps the same visitor ID, while the same person on a different device or network can still appear as a new visitor.'
            )}
          </div>
          <h2 style={{ marginTop: 0, fontSize: '24px', color: '#f8fbff' }}>
            Visitors active on {formatDate(selectedDay.date)}
          </h2>

          {snapshot.recentVisitors.length === 0 ? (
            <p style={{ margin: 0, color: '#9fb0cd' }}>
              Once visits start coming in, this section will show recent anonymous visitor profiles,
              their IP or network hint, and the pages they looked at.
            </p>
          ) : (
            <div style={{ display: 'grid', gap: '14px' }}>
              <div
                style={{
                  padding: '14px',
                  borderRadius: '16px',
                  background: 'rgba(8, 15, 30, 0.58)',
                  border: '1px solid rgba(148,163,184,0.12)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginBottom: '12px',
                  }}
                >
                  {recentSelectableDays.map((day) => {
                    const isActiveDay = day.date === activeDay;

                    return (
                      <Link
                        key={day.date}
                        href={buildAdminVisitorHref({
                          visitorQuery: activeVisitorQuery,
                          source: activeSourceFilter,
                          day: day.date,
                        })}
                        scroll={false}
                        style={{ textDecoration: 'none' }}
                      >
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 10px',
                            borderRadius: '999px',
                            border: isActiveDay
                              ? '1px solid rgba(125,211,252,0.58)'
                              : '1px solid rgba(148,163,184,0.16)',
                            background: isActiveDay
                              ? 'rgba(59,130,246,0.18)'
                              : 'rgba(15, 23, 42, 0.85)',
                            color: isActiveDay ? '#f8fbff' : '#dbe7fb',
                            fontSize: '12px',
                            fontWeight: 700,
                          }}
                        >
                          {formatDate(day.date)} · {day.uniqueVisitors} visitors
                        </span>
                      </Link>
                    );
                  })}
                </div>

                <div style={{ color: '#cfe5ff', fontSize: '13px', marginBottom: '12px' }}>
                  Viewing customer activity for <strong>{formatDate(selectedDay.date)}</strong> ·{' '}
                  {selectedDay.totalViews} views · {selectedDay.contactSubmissions} lead(s)
                </div>

                <form
                  action="/admin#visitor-journeys"
                  method="get"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(220px, 1.2fr) minmax(180px, 0.8fr) auto auto',
                    gap: '10px',
                    alignItems: 'center',
                  }}
                >
                  <input type="hidden" name="day" value={activeDay} />
                  <input
                    type="text"
                    name="visitorQuery"
                    defaultValue={activeVisitorQuery}
                    placeholder="Search IP, company, page, source..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '12px',
                      border: '1px solid rgba(148,163,184,0.16)',
                      background: 'rgba(15, 23, 42, 0.85)',
                      color: '#f8fbff',
                    }}
                  />
                  <select
                    name="source"
                    defaultValue={activeSourceFilter}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '12px',
                      border: '1px solid rgba(148,163,184,0.16)',
                      background: 'rgba(15, 23, 42, 0.85)',
                      color: '#f8fbff',
                    }}
                  >
                    <option value="all">All sources</option>
                    {visitorSourceOptions.map((source) => (
                      <option key={source} value={source}>
                        {source}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    style={{
                      border: 'none',
                      borderRadius: '12px',
                      padding: '10px 14px',
                      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                      color: '#f8fbff',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Filter
                  </button>
                  <Link
                    href={buildAdminVisitorHref({ day: activeDay })}
                    scroll={false}
                    style={{
                      textDecoration: 'none',
                      textAlign: 'center',
                      borderRadius: '12px',
                      padding: '10px 14px',
                      background: 'rgba(15, 23, 42, 0.85)',
                      border: '1px solid rgba(148,163,184,0.16)',
                      color: '#dbe7fb',
                      fontWeight: 700,
                    }}
                  >
                    Reset
                  </Link>
                </form>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    alignItems: 'center',
                    marginTop: '10px',
                  }}
                >
                  {renderPill(`${filteredVisitors.length} shown`, 'blue')}
                  {renderPill(
                    `${priorityVisitorCount} priority`,
                    priorityVisitorCount > 0 ? 'amber' : 'slate'
                  )}
                  {renderPill(
                    activeSourceFilter === 'all' ? 'All channels' : activeSourceFilter,
                    activeSourceFilter === 'all' ? 'slate' : 'blue'
                  )}
                </div>
              </div>

              {filteredVisitors.length === 0 ? (
                <p style={{ margin: 0, color: '#9fb0cd' }}>
                  No visitors matched the current filters for {formatDate(selectedDay.date)}. Try a
                  different day, IP, source, or company keyword.
                </p>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1.08fr) minmax(320px, 0.92fr)',
                    gap: '14px',
                    alignItems: 'stretch',
                  }}
                >
                  <div
                    style={{
                      ...scrollAreaStyle,
                      display: 'grid',
                      gap: '10px',
                      minHeight: '640px',
                      maxHeight: '640px',
                    }}
                  >
                    {filteredVisitors.map((visitor) => {
                      const intentScore = getVisitorIntentScore(visitor);
                      const intent = getVisitorIntentSummary(intentScore);
                      const returning = isReturningVisitor(visitor);
                      const isSelected = selectedVisitor?.id === visitor.id;
                      const isPriority = visitor.conversionCount > 0 || intentScore >= 75;
                      const visitorStatus =
                        visitor.conversionCount > 0 ? 'Lead' : returning ? 'Returning' : 'New';
                      const visitorTone =
                        visitor.conversionCount > 0 ? 'green' : returning ? 'blue' : 'slate';
                      const journeyPreview = visitor.recentPages.slice(0, 4).reverse().join(' → ');

                      return (
                        <Link
                          key={visitor.id}
                          href={buildAdminVisitorHref({
                            visitorQuery: activeVisitorQuery,
                            source: activeSourceFilter,
                            visitor: visitor.id,
                            day: activeDay,
                          })}
                          scroll={false}
                          style={{ textDecoration: 'none' }}
                        >
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'minmax(0, 1fr) auto',
                              gap: '14px',
                              alignItems: 'start',
                              padding: '12px',
                              borderRadius: '14px',
                              background: isSelected
                                ? 'linear-gradient(180deg, rgba(17, 34, 64, 0.98), rgba(11, 23, 43, 0.94))'
                                : 'rgba(12, 22, 40, 0.9)',
                              border: isSelected
                                ? '1px solid rgba(125,211,252,0.58)'
                                : isPriority
                                  ? '1px solid rgba(248,113,113,0.34)'
                                  : returning
                                    ? '1px solid rgba(96,165,250,0.24)'
                                    : '1px solid rgba(148,163,184,0.08)',
                              boxShadow: isSelected ? '0 0 0 1px rgba(125,211,252,0.12)' : 'none',
                            }}
                          >
                            <div>
                              <div
                                style={{
                                  display: 'flex',
                                  flexWrap: 'wrap',
                                  gap: '8px',
                                  alignItems: 'center',
                                }}
                              >
                                <strong style={{ color: '#f8fbff' }}>
                                  {getVisitorDisplayName(visitor)}
                                </strong>
                                {renderPill(visitorStatus, visitorTone)}
                                {renderPill(`${intent.label} · ${intentScore}/100`, intent.tone)}
                                {isPriority ? renderPill('Priority', 'amber') : null}
                              </div>

                              <div style={{ color: '#93a8c9', fontSize: '13px', marginTop: '6px' }}>
                                {getVisitorQuickFacts(visitor)}
                              </div>

                              <div style={{ color: '#cfe5ff', fontSize: '13px', marginTop: '6px' }}>
                                {visitor.company
                                  ? `Company hint: ${visitor.company}`
                                  : visitor.lastInquiryType
                                    ? `Interest: ${visitor.lastInquiryType}`
                                    : 'No company hint yet'}
                                {visitor.ipAddress ? ` · IP ${visitor.ipAddress}` : ''}
                              </div>

                              <div
                                style={{
                                  color: '#dbe7fb',
                                  fontSize: '13px',
                                  marginTop: '8px',
                                  lineHeight: 1.6,
                                }}
                              >
                                <strong style={{ color: '#f8fbff' }}>Recent path:</strong>{' '}
                                {journeyPreview || 'No page history yet'}
                              </div>
                            </div>

                            <div style={{ textAlign: 'right', color: '#cbd5e1', fontSize: '13px' }}>
                              <div>
                                <strong style={{ color: '#f8fbff' }}>{visitor.viewCount}</strong>{' '}
                                views
                              </div>
                              <div>
                                <strong style={{ color: '#f8fbff' }}>
                                  {visitor.conversionCount}
                                </strong>{' '}
                                leads
                              </div>
                              <div>
                                <strong style={{ color: '#f8fbff' }}>{visitor.pages.length}</strong>{' '}
                                pages
                              </div>
                              <div style={{ marginTop: '6px' }}>
                                Last seen {formatDateTime(visitor.lastSeenAt)}
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  <div
                    style={{
                      ...cardStyle,
                      position: 'sticky',
                      top: '16px',
                      padding: '16px',
                      minHeight: '640px',
                      height: '640px',
                      overflow: 'hidden',
                    }}
                  >
                    {selectedVisitor ? (
                      (() => {
                        const intentScore = getVisitorIntentScore(selectedVisitor);
                        const intent = getVisitorIntentSummary(intentScore);
                        const orderedRecentPages = selectedVisitor.recentPages
                          .slice(0, 10)
                          .reverse();
                        const detailCards = [
                          {
                            label: 'IP / network',
                            value: selectedVisitor.ipAddress ?? 'Not available',
                          },
                          { label: 'Source', value: selectedVisitor.source },
                          { label: 'Device', value: selectedVisitor.device },
                          {
                            label: 'Location',
                            value: selectedVisitor.location ?? 'Location pending',
                          },
                          {
                            label: 'Campaign',
                            value: getVisitorCampaignLabel(selectedVisitor),
                          },
                          {
                            label: 'Interest',
                            value: selectedVisitor.lastInquiryType ?? 'Not captured yet',
                          },
                        ];

                        return (
                          <div
                            style={{
                              ...scrollAreaStyle,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '12px',
                              height: '100%',
                              maxHeight: '100%',
                              paddingRight: '10px',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                gap: '12px',
                                alignItems: 'start',
                                marginBottom: '12px',
                              }}
                            >
                              <div>
                                <p style={{ margin: 0, color: '#8fb6ff', fontWeight: 700 }}>
                                  Visitor detail panel · {formatDate(selectedDay.date)}
                                </p>
                                <h3
                                  style={{ margin: '6px 0 0', color: '#f8fbff', fontSize: '22px' }}
                                >
                                  {getVisitorDisplayName(selectedVisitor)}
                                </h3>
                              </div>
                              <div style={{ display: 'grid', gap: '6px', justifyItems: 'end' }}>
                                {renderPill(`${intent.label} · ${intentScore}/100`, intent.tone)}
                                {selectedVisitor.conversionCount > 0
                                  ? renderPill('Lead captured', 'green')
                                  : renderPill('Watching', 'blue')}
                              </div>
                            </div>

                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                                gap: '10px',
                                marginBottom: '12px',
                              }}
                            >
                              {detailCards.map((item) => (
                                <div
                                  key={`${selectedVisitor.id}-${item.label}`}
                                  style={{
                                    padding: '10px 12px',
                                    borderRadius: '12px',
                                    background: 'rgba(15, 23, 42, 0.72)',
                                    border: '1px solid rgba(148,163,184,0.1)',
                                  }}
                                >
                                  <div
                                    style={{
                                      color: '#8fb6ff',
                                      fontSize: '12px',
                                      marginBottom: '4px',
                                    }}
                                  >
                                    {item.label}
                                  </div>
                                  <div
                                    style={{ color: '#f8fbff', fontSize: '13px', lineHeight: 1.5 }}
                                  >
                                    {item.value}
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div
                              style={{
                                marginBottom: '12px',
                                padding: '12px',
                                borderRadius: '12px',
                                background: 'rgba(15, 23, 42, 0.72)',
                                border: '1px solid rgba(148,163,184,0.1)',
                              }}
                            >
                              <div
                                style={{ color: '#f8fbff', fontWeight: 700, marginBottom: '8px' }}
                              >
                                Time-ordered browsing track
                              </div>
                              {orderedRecentPages.length === 0 ? (
                                <p style={{ margin: 0, color: '#9fb0cd', fontSize: '13px' }}>
                                  No browsing timeline recorded yet.
                                </p>
                              ) : (
                                <div style={{ display: 'grid', gap: '8px' }}>
                                  {orderedRecentPages.map((path, index) => (
                                    <div
                                      key={`${selectedVisitor.id}-ordered-${index}-${path}`}
                                      style={{
                                        display: 'grid',
                                        gridTemplateColumns: '24px 1fr',
                                        gap: '8px',
                                        alignItems: 'start',
                                      }}
                                    >
                                      <span
                                        style={{
                                          width: '24px',
                                          height: '24px',
                                          borderRadius: '999px',
                                          background: 'rgba(59,130,246,0.16)',
                                          color: '#93c5fd',
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          fontSize: '12px',
                                          fontWeight: 700,
                                        }}
                                      >
                                        {index + 1}
                                      </span>
                                      <div
                                        style={{
                                          color: '#dbe7fb',
                                          fontSize: '13px',
                                          lineHeight: 1.6,
                                        }}
                                      >
                                        {path}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div
                              style={{
                                marginBottom: '12px',
                                padding: '12px',
                                borderRadius: '12px',
                                background: 'rgba(15, 23, 42, 0.72)',
                                border: '1px solid rgba(148,163,184,0.1)',
                              }}
                            >
                              <div
                                style={{ color: '#f8fbff', fontWeight: 700, marginBottom: '8px' }}
                              >
                                Pages viewed
                              </div>
                              {selectedVisitor.pages.length === 0 ? (
                                <p style={{ margin: 0, color: '#9fb0cd', fontSize: '13px' }}>
                                  No page totals recorded yet.
                                </p>
                              ) : (
                                <div style={{ display: 'grid', gap: '8px' }}>
                                  {selectedVisitor.pages.slice(0, 10).map((page) => (
                                    <div
                                      key={`${selectedVisitor.id}-${page.path}`}
                                      style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        gap: '12px',
                                        color: '#dbe7fb',
                                        fontSize: '13px',
                                      }}
                                    >
                                      <span style={{ wordBreak: 'break-word' }}>{page.path}</span>
                                      <strong style={{ color: '#f8fbff', whiteSpace: 'nowrap' }}>
                                        {page.views} view{page.views === 1 ? '' : 's'}
                                      </strong>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div
                              style={{
                                color: '#9fb0cd',
                                fontSize: '12px',
                                lineHeight: 1.7,
                                marginTop: 'auto',
                                paddingTop: '6px',
                              }}
                            >
                              First seen {formatDateTime(selectedVisitor.firstSeenAt)} · Last seen{' '}
                              {formatDateTime(selectedVisitor.lastSeenAt)} · Visitor ID{' '}
                              {selectedVisitor.id}
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <p style={{ margin: 0, color: '#9fb0cd' }}>
                        Choose a visitor from the left to inspect their browsing details.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        <section style={cardStyle}>
          <p style={{ margin: '0 0 6px', color: '#8fb6ff', fontWeight: 700 }}>Operations</p>
          <h2 style={{ marginTop: 0, fontSize: '24px', color: '#f8fbff' }}>Daily feed</h2>
          <div style={{ ...scrollAreaStyle, display: 'grid', gap: '8px', maxHeight: '360px' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.5fr 0.8fr 0.8fr auto',
                gap: '12px',
                padding: '0 4px',
                color: '#93a8c9',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              <span>Day</span>
              <span>Views</span>
              <span>Leads</span>
              <span>Status</span>
            </div>
            {snapshot.recentDays
              .slice(-7)
              .reverse()
              .map((day) => {
                const isActiveDay = day.date === activeDay;

                return (
                  <Link
                    key={day.date}
                    href={buildAdminVisitorHref({
                      visitorQuery: activeVisitorQuery,
                      source: activeSourceFilter,
                      day: day.date,
                    })}
                    scroll={false}
                    style={{ textDecoration: 'none' }}
                  >
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1.5fr 0.8fr 0.8fr auto',
                        gap: '12px',
                        alignItems: 'center',
                        padding: '10px 12px',
                        borderRadius: '12px',
                        background: isActiveDay
                          ? 'linear-gradient(180deg, rgba(17, 34, 64, 0.98), rgba(11, 23, 43, 0.94))'
                          : 'rgba(15, 23, 42, 0.72)',
                        border: isActiveDay
                          ? '1px solid rgba(125,211,252,0.58)'
                          : '1px solid rgba(148,163,184,0.08)',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700 }}>{formatDate(day.date)}</div>
                        <div style={{ color: '#94a3b8', fontSize: '13px' }}>
                          {day.sources[0]?.label ?? 'Direct'} ·{' '}
                          {day.locations[0]?.label ?? 'Location pending'}
                        </div>
                      </div>
                      <div style={{ color: '#dbe7fb', fontWeight: 700 }}>{day.totalViews}</div>
                      <div style={{ color: '#dbe7fb', fontWeight: 700 }}>
                        {day.contactSubmissions}
                      </div>
                      <div>
                        {renderPill(
                          isActiveDay
                            ? 'Viewing'
                            : day.contactSubmissions > 0
                              ? 'Lead'
                              : day.totalViews > 0
                                ? 'Active'
                                : 'Quiet',
                          isActiveDay
                            ? 'blue'
                            : day.contactSubmissions > 0
                              ? 'green'
                              : day.totalViews > 0
                                ? 'blue'
                                : 'slate'
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
          </div>
        </section>
      </div>
    </div>
  );
}

import type { CSSProperties } from 'react';

import AdminIdleGuard from '@/components/admin/admin-idle-guard';
import { getAdminUsername, requireAdminAccess } from '@/lib/admin-auth';
import {
  getAnalyticsSnapshot,
  type AnalyticsDayStat,
  type AnalyticsLabelStat,
  type AnalyticsPageStat,
} from '@/lib/analytics';

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

export default async function AdminDashboardPage() {
  await requireAdminAccess();

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
              <h1 style={{ margin: '0 0 8px', fontSize: '38px', lineHeight: 1.1 }}>
                Company traffic cockpit
              </h1>
              <p style={{ margin: 0, color: '#a9bbdb', lineHeight: 1.7 }}>
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
                }}
              >
                {metric.value}
              </h2>
              <p style={{ margin: 0, color: '#7dd3fc' }}>{metric.note}</p>
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
              <h2 style={{ margin: 0, fontSize: '24px' }}>Priority follow-up</h2>
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
                <div style={{ color: '#7dd3fc', marginTop: '8px' }}>{item.note}</div>
              </div>
            ))}
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
                <h2 style={{ margin: 0, fontSize: '24px' }}>Last 14 days</h2>
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
            <h2 style={{ marginTop: 0, fontSize: '24px' }}>Where visitors came from</h2>

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
            <h2 style={{ marginTop: 0, fontSize: '24px' }}>Most visited pages</h2>
            {renderTopPageBars(
              snapshot.topPagesLast14Days,
              'Traffic data will appear here after the first visits.'
            )}
          </section>

          <section style={cardStyle}>
            <p style={{ margin: '0 0 6px', color: '#8fb6ff', fontWeight: 700 }}>
              Visitor intelligence
            </p>
            <h2 style={{ marginTop: 0, fontSize: '24px' }}>Devices, regions & company signals</h2>

            <div style={{ display: 'grid', gap: '18px' }}>
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
            <h2 style={{ marginTop: 0, fontSize: '24px' }}>Where the drop-off happens</h2>
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
            <h2 style={{ marginTop: 0, fontSize: '24px' }}>Channel efficiency</h2>
            {sourceComparison.length === 0 ? (
              <p style={{ margin: 0, color: '#9fb0cd' }}>
                Channel performance will appear after more tracked visits.
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
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
            <h2 style={{ marginTop: 0, fontSize: '24px' }}>Campaign attribution</h2>
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
            <h2 style={{ marginTop: 0, fontSize: '24px' }}>Intent drivers</h2>

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
            <h2 style={{ marginTop: 0, fontSize: '24px' }}>Action plan</h2>

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
                <div style={{ color: '#7dd3fc', marginTop: '6px' }}>{pipelineReadinessLabel}</div>
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
                <div style={{ color: '#7dd3fc', marginTop: '6px' }}>
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

            <div style={{ display: 'grid', gap: '12px' }}>
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
            <h2 style={{ marginTop: 0, fontSize: '24px' }}>Account watchlist</h2>
            {likelyAccounts.length === 0 ? (
              <p style={{ margin: 0, color: '#9fb0cd' }}>
                Once business traffic or company-backed leads appear, the watchlist will populate
                here.
              </p>
            ) : (
              <div style={{ display: 'grid', gap: '8px' }}>
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
            <h2 style={{ marginTop: 0, fontSize: '24px' }}>Lead timeline</h2>
            <div style={{ display: 'grid', gap: '10px' }}>
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

        <section style={cardStyle}>
          <p style={{ margin: '0 0 6px', color: '#8fb6ff', fontWeight: 700 }}>Operations</p>
          <h2 style={{ marginTop: 0, fontSize: '24px' }}>Daily feed</h2>
          <div style={{ display: 'grid', gap: '8px' }}>
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
              .map((day) => (
                <div
                  key={day.date}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.5fr 0.8fr 0.8fr auto',
                    gap: '12px',
                    alignItems: 'center',
                    padding: '10px 12px',
                    borderRadius: '12px',
                    background: 'rgba(15, 23, 42, 0.72)',
                    border: '1px solid rgba(148,163,184,0.08)',
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
                  <div style={{ color: '#dbe7fb', fontWeight: 700 }}>{day.contactSubmissions}</div>
                  <div>
                    {renderPill(
                      day.contactSubmissions > 0 ? 'Lead' : day.totalViews > 0 ? 'Active' : 'Quiet',
                      day.contactSubmissions > 0 ? 'green' : day.totalViews > 0 ? 'blue' : 'slate'
                    )}
                  </div>
                </div>
              ))}
          </div>
        </section>
      </div>
    </div>
  );
}

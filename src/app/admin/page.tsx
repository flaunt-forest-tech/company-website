import type { CSSProperties } from 'react';

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
    'radial-gradient(circle at top left, rgba(59,130,246,0.18), transparent 0 28%), linear-gradient(135deg, #081225 0%, #0b1730 52%, #09111f 100%)',
  color: '#e5eefc',
  padding: '32px 18px 40px',
};

const shellStyle: CSSProperties = {
  maxWidth: '1240px',
  margin: '0 auto',
};

const cardStyle: CSSProperties = {
  background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.94), rgba(15, 23, 42, 0.88))',
  border: '1px solid rgba(148, 163, 184, 0.16)',
  borderRadius: '20px',
  padding: '18px',
  boxShadow: '0 20px 45px rgba(2, 6, 23, 0.25)',
  backdropFilter: 'blur(10px)',
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
  const todayConversionRate =
    today.totalViews > 0 ? ((today.contactSubmissions / today.totalViews) * 100).toFixed(1) : '0.0';
  const chartPoints = getChartPoints(snapshot.recentDays);
  const pieSlices = getPieSlices(snapshot.topSourcesLast14Days);

  return (
    <div style={pageStyle}>
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '14px',
            marginBottom: '18px',
          }}
        >
          {[
            {
              label: "Today's page views",
              value: formatCompactNumber(today.totalViews),
              note: getChangeLabel(today.totalViews, yesterday?.totalViews ?? 0),
            },
            {
              label: 'Unique visitors',
              value: formatCompactNumber(today.uniqueVisitors),
              note: `${avgPagesPerVisitor} pages per visitor`,
            },
            {
              label: 'Contact submissions',
              value: formatCompactNumber(today.contactSubmissions),
              note: `${todayConversionRate}% of today's visits converted`,
            },
            {
              label: 'Top acquisition source',
              value: topSource,
              note: snapshot.topSourcesLast14Days[0]
                ? `${topLocation} is the strongest region signal`
                : 'Waiting for traffic data',
            },
            {
              label: '14-day average',
              value: formatCompactNumber(averageDailyViews),
              note: `${topCompanySignal} is the strongest company signal`,
            },
          ].map((metric) => (
            <section key={metric.label} style={cardStyle}>
              <p style={{ margin: '0 0 10px', color: '#93a8c9' }}>{metric.label}</p>
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

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.6fr 1fr',
            gap: '16px',
            marginBottom: '18px',
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
                    background: '#0b1324',
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
            gridTemplateColumns: '1.2fr 0.9fr',
            gap: '16px',
            marginBottom: '18px',
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

        <section style={cardStyle}>
          <p style={{ margin: '0 0 6px', color: '#8fb6ff', fontWeight: 700 }}>Daily detail</p>
          <h2 style={{ marginTop: 0, fontSize: '24px' }}>Recent activity</h2>
          <div style={{ display: 'grid', gap: '10px' }}>
            {snapshot.recentDays
              .slice(-7)
              .reverse()
              .map((day) => (
                <div
                  key={day.date}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.1fr auto auto auto',
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
                      {day.uniqueVisitors} unique visitors · {day.sources[0]?.label ?? 'Direct'} ·{' '}
                      {day.locations[0]?.label ?? 'Location pending'}
                    </div>
                  </div>
                  <div style={{ color: '#dbe7fb', fontWeight: 700 }}>{day.totalViews} views</div>
                  <div style={{ color: '#dbe7fb', fontWeight: 700 }}>
                    {day.contactSubmissions} leads
                  </div>
                  <div
                    style={{
                      minWidth: '72px',
                      textAlign: 'center',
                      padding: '4px 8px',
                      borderRadius: '999px',
                      background:
                        day.contactSubmissions > 0
                          ? 'rgba(52,211,153,0.12)'
                          : day.totalViews > 0
                            ? 'rgba(96,165,250,0.12)'
                            : 'rgba(148,163,184,0.12)',
                      color:
                        day.contactSubmissions > 0
                          ? '#86efac'
                          : day.totalViews > 0
                            ? '#93c5fd'
                            : '#cbd5e1',
                      fontSize: '12px',
                      fontWeight: 700,
                    }}
                  >
                    {day.contactSubmissions > 0 ? 'Lead' : day.totalViews > 0 ? 'Active' : 'Quiet'}
                  </div>
                </div>
              ))}
          </div>
        </section>
      </div>
    </div>
  );
}

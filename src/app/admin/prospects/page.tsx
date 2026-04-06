import type { CSSProperties } from 'react';

import Link from 'next/link';

import { requireAdminAccess } from '@/lib/admin-auth';
import { getAnalyticsSnapshot } from '@/lib/analytics';
import { getAllCrmRecords } from '@/lib/crm';
import { isLikelyInfrastructureTraffic, shouldIncludeInProspects } from '@/lib/prospect-utils';
import type { CrmRecord } from '@/types/crm';
import ProspectsClient, { type ProspectEntry } from '@/components/admin/prospects-client';

export const dynamic = 'force-dynamic';

const pageStyle: CSSProperties = {
  minHeight: '100vh',
  background:
    'radial-gradient(circle at top left, rgba(96,165,250,0.16), transparent 0 28%), linear-gradient(135deg, #0b1730 0%, #102042 52%, #0a1730 100%)',
  color: '#f4f8ff',
  padding: '24px 18px 40px',
};

const shellStyle: CSSProperties = {
  maxWidth: '1240px',
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

export default async function ProspectsPage() {
  await requireAdminAccess();

  const [snapshot, crmRecords] = await Promise.all([getAnalyticsSnapshot(), getAllCrmRecords()]);

  // Build prospects: all visitors that have any signal worth tracking
  // (already contacted, company signal, known contact, or meaningful engagement)
  const defaultCrm = (visitorId: string): CrmRecord => ({
    visitorId,
    status: 'new',
    notes: '',
    followUpAt: null,
    resolvedCompany: null,
    resolvedDomain: null,
    contacts: [],
    contactsSearchedAt: null,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  });

  const hiddenInfraCount = snapshot.recentVisitors.filter(isLikelyInfrastructureTraffic).length;

  const prospects: ProspectEntry[] = snapshot.recentVisitors
    .filter((v) => shouldIncludeInProspects(v, crmRecords[v.id]))
    .map((visitor) => ({
      visitor,
      crm: crmRecords[visitor.id] ?? defaultCrm(visitor.id),
    }))
    .sort((a, b) => {
      // Priority: already-contacted status, then score, then last seen
      const statusOrder: Record<string, number> = {
        qualified: 0,
        contacted: 1,
        new: 2,
        closed: 3,
        lost: 4,
      };
      const aOrder = statusOrder[a.crm.status] ?? 2;
      const bOrder = statusOrder[b.crm.status] ?? 2;
      if (aOrder !== bOrder) return aOrder - bOrder;

      return new Date(b.visitor.lastSeenAt).getTime() - new Date(a.visitor.lastSeenAt).getTime();
    });

  const todayKey = new Date().toISOString().slice(0, 10);
  const dueToday = prospects
    .filter((entry) => {
      const followUp = entry.crm.followUpAt?.slice(0, 10);
      return Boolean(followUp && followUp <= todayKey);
    })
    .slice(0, 5);

  const overdueCount = prospects.filter((entry) => {
    const followUp = entry.crm.followUpAt?.slice(0, 10);
    return Boolean(followUp && followUp < todayKey);
  }).length;

  const highIntent = prospects
    .filter(
      (entry) =>
        entry.visitor.conversionCount > 0 ||
        Boolean(entry.visitor.contactEmail || entry.visitor.contactPhone) ||
        entry.visitor.viewCount >= 4 ||
        entry.visitor.pages.length >= 3
    )
    .slice(0, 5);

  return (
    <div style={pageStyle}>
      <div style={shellStyle}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Link
              href="/admin"
              style={{
                color: '#60a5fa',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: 700,
              }}
            >
              ← Admin dashboard
            </Link>
            <h1
              style={{
                margin: '6px 0 4px',
                fontSize: '24px',
                fontWeight: 800,
                background: 'linear-gradient(90deg, #93c5fd, #6ee7b7)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Prospects
            </h1>
            <p style={{ margin: 0, color: '#7e9fc7', fontSize: '14px' }}>
              {prospects.length} likely real prospects · review follow-ups, notes, and outreach prep
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
              <a
                href="/api/admin/crm/export"
                style={{
                  textDecoration: 'none',
                  padding: '7px 11px',
                  borderRadius: '10px',
                  background: 'rgba(96,165,250,0.12)',
                  border: '1px solid rgba(96,165,250,0.3)',
                  color: '#93c5fd',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                Export CSV
              </a>
              <span
                style={{
                  padding: '7px 11px',
                  borderRadius: '10px',
                  background: 'rgba(52,211,153,0.1)',
                  border: '1px solid rgba(52,211,153,0.25)',
                  color: '#6ee7b7',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                Manual research mode
              </span>
              <span
                style={{
                  padding: '7px 11px',
                  borderRadius: '10px',
                  background: 'rgba(245,158,11,0.1)',
                  border: '1px solid rgba(245,158,11,0.25)',
                  color: '#fbbf24',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                {hiddenInfraCount} infra/dev visits filtered
              </span>
              {overdueCount > 0 ? (
                <span
                  style={{
                    padding: '7px 11px',
                    borderRadius: '10px',
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.25)',
                    color: '#fca5a5',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  {overdueCount} overdue
                </span>
              ) : null}
            </div>
          </div>
          <div
            style={{
              padding: '8px 14px',
              borderRadius: '12px',
              background: 'rgba(15,23,42,0.8)',
              border: '1px solid rgba(148,163,184,0.14)',
              fontSize: '12px',
              color: '#7e9fc7',
              textAlign: 'right',
            }}
          >
            <div style={{ color: '#f4f8ff', fontWeight: 700 }}>
              {prospects.filter((p) => p.crm.status === 'qualified').length} qualified
            </div>
            <div>
              {prospects.filter((p) => p.crm.status === 'contacted').length} contacted ·{' '}
              {prospects.filter((p) => p.visitor.contactEmail || p.visitor.contactPhone).length}{' '}
              reachable
            </div>
          </div>
        </div>

        {dueToday.length > 0 || highIntent.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '12px',
            }}
          >
            {dueToday.length > 0 ? (
              <div
                style={{
                  borderRadius: '16px',
                  padding: '14px',
                  background: 'rgba(245,158,11,0.08)',
                  border: '1px solid rgba(245,158,11,0.22)',
                  display: 'grid',
                  gap: '10px',
                }}
              >
                <div>
                  <div style={{ color: '#fbbf24', fontSize: '12px', fontWeight: 800 }}>
                    TODAY FOLLOW-UPS
                  </div>
                  <div style={{ color: '#f8fbff', fontSize: '18px', fontWeight: 800 }}>
                    {dueToday.length} follow-up{dueToday.length === 1 ? '' : 's'} due now
                  </div>
                </div>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {dueToday.map((entry) => (
                    <div
                      key={entry.visitor.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '10px',
                        flexWrap: 'wrap',
                        padding: '10px 12px',
                        borderRadius: '12px',
                        background: 'rgba(15,23,42,0.62)',
                        border: '1px solid rgba(148,163,184,0.12)',
                      }}
                    >
                      <div>
                        <div style={{ color: '#f8fbff', fontWeight: 700 }}>
                          {entry.visitor.contactName ||
                            entry.visitor.company ||
                            `Visitor ${entry.visitor.id.slice(0, 8)}`}
                        </div>
                        <div style={{ color: '#93a8c9', fontSize: '12px' }}>
                          {entry.crm.followUpAt?.slice(0, 10)} ·{' '}
                          {entry.visitor.contactEmail ||
                            entry.visitor.contactPhone ||
                            entry.crm.resolvedDomain ||
                            entry.visitor.location ||
                            'Needs manual follow-up'}
                        </div>
                      </div>
                      <div style={{ color: '#dbeafe', fontSize: '12px' }}>{entry.crm.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {highIntent.length > 0 ? (
              <div
                style={{
                  borderRadius: '16px',
                  padding: '14px',
                  background: 'rgba(52,211,153,0.08)',
                  border: '1px solid rgba(52,211,153,0.22)',
                  display: 'grid',
                  gap: '10px',
                }}
              >
                <div>
                  <div style={{ color: '#6ee7b7', fontSize: '12px', fontWeight: 800 }}>
                    HIGH INTENT
                  </div>
                  <div style={{ color: '#f8fbff', fontSize: '18px', fontWeight: 800 }}>
                    Top accounts worth checking first
                  </div>
                </div>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {highIntent.map((entry) => (
                    <div
                      key={entry.visitor.id}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '12px',
                        background: 'rgba(15,23,42,0.62)',
                        border: '1px solid rgba(148,163,184,0.12)',
                      }}
                    >
                      <div style={{ color: '#f8fbff', fontWeight: 700 }}>
                        {entry.visitor.contactName ||
                          entry.visitor.company ||
                          `Visitor ${entry.visitor.id.slice(0, 8)}`}
                      </div>
                      <div style={{ color: '#93a8c9', fontSize: '12px' }}>
                        {entry.visitor.viewCount} views · {entry.visitor.pages.length} pages ·{' '}
                        {entry.visitor.contactEmail || entry.visitor.contactPhone
                          ? 'direct contact available'
                          : entry.visitor.lastInquiryType || 'engaged browsing'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        <ProspectsClient prospects={prospects} />
      </div>
    </div>
  );
}

import { isAdminAuthenticated } from '@/lib/admin-auth';
import { getAnalyticsSnapshot } from '@/lib/analytics';
import { getAllCrmRecords } from '@/lib/crm';
import { shouldIncludeInProspects } from '@/lib/prospect-utils';

export const runtime = 'nodejs';

function csvEscape(value: unknown): string {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}

function getDisplayName(visitor: {
  contactName?: string | null;
  company?: string | null;
  ipAddress?: string | null;
  id: string;
}): string {
  if (visitor.contactName && visitor.company) {
    return `${visitor.contactName} · ${visitor.company}`;
  }

  if (visitor.contactName) {
    return visitor.contactName;
  }

  if (visitor.company) {
    return visitor.company;
  }

  if (visitor.ipAddress) {
    return `IP ${visitor.ipAddress}`;
  }

  return `Visitor ${visitor.id.slice(0, 8)}`;
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [snapshot, crmRecords] = await Promise.all([getAnalyticsSnapshot(), getAllCrmRecords()]);

  const rows = snapshot.recentVisitors
    .filter((visitor) => shouldIncludeInProspects(visitor, crmRecords[visitor.id]))
    .map((visitor) => {
      const crm = crmRecords[visitor.id];
      return [
        visitor.id,
        getDisplayName(visitor),
        crm?.status ?? 'new',
        crm?.followUpAt ?? '',
        visitor.contactEmail ?? '',
        visitor.contactPhone ?? '',
        crm?.resolvedCompany ?? visitor.company ?? '',
        crm?.resolvedDomain ?? '',
        visitor.location ?? '',
        visitor.source ?? '',
        visitor.viewCount,
        visitor.conversionCount,
        visitor.lastInquiryType ?? '',
        visitor.recentPages.join(' | '),
        crm?.notes ?? '',
      ];
    });

  const header = [
    'visitorId',
    'name',
    'status',
    'followUpAt',
    'email',
    'phone',
    'company',
    'domain',
    'location',
    'source',
    'viewCount',
    'conversionCount',
    'interest',
    'recentPages',
    'notes',
  ];

  const csv = [header, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n');

  return new Response(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="prospects-${new Date().toISOString().slice(0, 10)}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}

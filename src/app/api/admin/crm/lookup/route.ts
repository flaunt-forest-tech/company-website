import { isAdminAuthenticated } from '@/lib/admin-auth';
import { upsertCrmRecord } from '@/lib/crm';

export const runtime = 'nodejs';

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

  return cleaned;
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const visitorId = typeof body.visitorId === 'string' ? body.visitorId.trim() : '';
  const domain = normalizeDomain(typeof body.domain === 'string' ? body.domain : null);
  const company = typeof body.company === 'string' ? body.company.trim().slice(0, 120) : null;

  if (!visitorId) {
    return Response.json({ error: 'visitorId is required' }, { status: 400 });
  }

  if (!domain && !company) {
    return Response.json({ error: 'Enter a company domain or company name' }, { status: 400 });
  }

  const record = await upsertCrmRecord(visitorId, {
    resolvedDomain: domain,
    resolvedCompany: company,
    contactsSearchedAt: new Date().toISOString(),
  });

  return Response.json({ ok: true, mode: 'manual-research', record });
}

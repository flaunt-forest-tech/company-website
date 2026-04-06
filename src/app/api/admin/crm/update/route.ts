import { isAdminAuthenticated } from '@/lib/admin-auth';
import { upsertCrmRecord } from '@/lib/crm';
import type { CrmStatus } from '@/types/crm';

export const runtime = 'nodejs';

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
  if (!visitorId) {
    return Response.json({ error: 'visitorId is required' }, { status: 400 });
  }

  const validStatuses: CrmStatus[] = ['new', 'contacted', 'qualified', 'closed', 'lost'];
  const patch: Parameters<typeof upsertCrmRecord>[1] = {};

  if (typeof body.status === 'string' && validStatuses.includes(body.status as CrmStatus)) {
    patch.status = body.status as CrmStatus;
  }

  if (typeof body.notes === 'string') {
    patch.notes = body.notes.slice(0, 4000);
  }

  if (body.followUpAt === null || typeof body.followUpAt === 'string') {
    patch.followUpAt =
      typeof body.followUpAt === 'string' && body.followUpAt.trim() ? body.followUpAt.trim() : null;
  }

  if (typeof body.resolvedCompany === 'string' || body.resolvedCompany === null) {
    patch.resolvedCompany =
      typeof body.resolvedCompany === 'string' ? body.resolvedCompany.slice(0, 200) : null;
  }

  if (typeof body.resolvedDomain === 'string' || body.resolvedDomain === null) {
    patch.resolvedDomain =
      typeof body.resolvedDomain === 'string' ? body.resolvedDomain.slice(0, 200) : null;
  }

  const record = await upsertCrmRecord(visitorId, patch);
  return Response.json({ ok: true, record });
}

import 'server-only';

import { promises as fs } from 'node:fs';
import path from 'node:path';

import { getSharedRedisClient } from '@/lib/redis';

export type { CrmStatus, CrmContact, CrmRecord } from '@/types/crm';
export { CRM_STATUS_LABELS } from '@/types/crm';
import type { CrmStatus, CrmRecord } from '@/types/crm';

type CrmFileStore = {
  records: Record<string, CrmRecord>;
};

const CRM_STORE_PATH = path.join(process.cwd(), 'data', 'crm-store.json');

function crmRecordKey(visitorId: string): string {
  return `crm:record:${visitorId}`;
}

function parseCrmRecord(raw: string | null): CrmRecord | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<CrmRecord>;
    if (!parsed || typeof parsed.visitorId !== 'string') return null;
    return {
      visitorId: parsed.visitorId,
      status: isValidStatus(parsed.status) ? parsed.status : 'new',
      notes: parsed.notes ?? '',
      followUpAt: parsed.followUpAt ?? null,
      resolvedCompany: parsed.resolvedCompany ?? null,
      resolvedDomain: parsed.resolvedDomain ?? null,
      contacts: Array.isArray(parsed.contacts) ? parsed.contacts : [],
      contactsSearchedAt: parsed.contactsSearchedAt ?? null,
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
      createdAt: parsed.createdAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function isValidStatus(value: unknown): value is CrmStatus {
  return (
    value === 'new' ||
    value === 'contacted' ||
    value === 'qualified' ||
    value === 'closed' ||
    value === 'lost'
  );
}

async function loadFileStore(): Promise<CrmFileStore> {
  try {
    const raw = await fs.readFile(CRM_STORE_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<CrmFileStore>;
    if (parsed && typeof parsed.records === 'object' && parsed.records !== null) {
      return { records: parsed.records as Record<string, CrmRecord> };
    }
    return { records: {} };
  } catch {
    return { records: {} };
  }
}

async function saveFileStore(store: CrmFileStore): Promise<void> {
  await fs.mkdir(path.dirname(CRM_STORE_PATH), { recursive: true });
  await fs.writeFile(CRM_STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
}

export async function getCrmRecord(visitorId: string): Promise<CrmRecord | null> {
  const redis = await getSharedRedisClient();
  if (redis) {
    try {
      const raw = await redis.get(crmRecordKey(visitorId));
      return parseCrmRecord(raw);
    } catch {
      // Fall through to file
    }
  }
  const store = await loadFileStore();
  return store.records[visitorId] ?? null;
}

export async function upsertCrmRecord(
  visitorId: string,
  patch: Partial<Omit<CrmRecord, 'visitorId' | 'createdAt'>>
): Promise<CrmRecord> {
  const now = new Date().toISOString();
  const existing = await getCrmRecord(visitorId);
  const record: CrmRecord = {
    visitorId,
    status: patch.status ?? existing?.status ?? 'new',
    notes: patch.notes ?? existing?.notes ?? '',
    followUpAt: patch.followUpAt !== undefined ? patch.followUpAt : (existing?.followUpAt ?? null),
    resolvedCompany:
      patch.resolvedCompany !== undefined
        ? patch.resolvedCompany
        : (existing?.resolvedCompany ?? null),
    resolvedDomain:
      patch.resolvedDomain !== undefined
        ? patch.resolvedDomain
        : (existing?.resolvedDomain ?? null),
    contacts: patch.contacts ?? existing?.contacts ?? [],
    contactsSearchedAt:
      patch.contactsSearchedAt !== undefined
        ? patch.contactsSearchedAt
        : (existing?.contactsSearchedAt ?? null),
    updatedAt: now,
    createdAt: existing?.createdAt ?? now,
  };

  const redis = await getSharedRedisClient();
  if (redis) {
    try {
      await redis.set(crmRecordKey(visitorId), JSON.stringify(record), { EX: 60 * 60 * 24 * 365 });
      return record;
    } catch {
      // Fall through to file
    }
  }

  const store = await loadFileStore();
  store.records[visitorId] = record;
  await saveFileStore(store);
  return record;
}

export async function getAllCrmRecords(): Promise<Record<string, CrmRecord>> {
  const redis = await getSharedRedisClient();
  if (redis) {
    try {
      const keys = await redis.keys('crm:record:*');
      if (keys.length === 0) return {};
      const values = await redis.mGet(keys);
      const result: Record<string, CrmRecord> = {};
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const raw = values[i] ?? null;
        const record = parseCrmRecord(raw);
        if (record && key) {
          result[record.visitorId] = record;
        }
      }
      return result;
    } catch {
      // Fall through to file
    }
  }
  const store = await loadFileStore();
  return store.records;
}

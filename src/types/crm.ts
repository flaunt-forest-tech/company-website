// Shared CRM types and constants — no server-only code, safe for client components

export type CrmStatus = 'new' | 'contacted' | 'qualified' | 'closed' | 'lost';

export const CRM_STATUS_LABELS: Record<CrmStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  closed: 'Closed / Won',
  lost: 'Lost',
};

export type CrmContact = {
  name: string | null;
  title: string | null;
  email: string | null;
  linkedinUrl: string | null;
  source: 'hunter' | 'apollo' | 'manual';
};

export type CrmRecord = {
  visitorId: string;
  status: CrmStatus;
  notes: string;
  followUpAt: string | null;
  resolvedCompany: string | null;
  resolvedDomain: string | null;
  contacts: CrmContact[];
  contactsSearchedAt: string | null;
  updatedAt: string;
  createdAt: string;
};

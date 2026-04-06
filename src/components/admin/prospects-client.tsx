'use client';

import { useCallback, useMemo, useState } from 'react';

import type { CrmContact, CrmRecord, CrmStatus } from '@/types/crm';
import { CRM_STATUS_LABELS } from '@/types/crm';
import type { AnalyticsVisitorRecord } from '@/types/analytics';
import {
  buildResearchLinks,
  getProspectSignals,
  getSuggestedResearchDomain,
} from '@/lib/prospect-utils';

export type ProspectEntry = {
  visitor: AnalyticsVisitorRecord;
  crm: CrmRecord;
};

type Props = {
  prospects: ProspectEntry[];
};

type QuickFilter = 'all' | 'reachable' | 'follow-up' | 'research';

function isReachableProspect(entry: ProspectEntry): boolean {
  return Boolean(entry.visitor.contactEmail || entry.visitor.contactPhone);
}

function isFollowUpDue(entry: ProspectEntry): boolean {
  const followUp = entry.crm.followUpAt?.slice(0, 10);

  if (!followUp) {
    return false;
  }

  return followUp <= new Date().toISOString().slice(0, 10);
}

function needsResearch(entry: ProspectEntry): boolean {
  return !isReachableProspect(entry) && !entry.crm.resolvedDomain && !entry.visitor.company;
}

const STATUS_COLORS: Record<CrmStatus, { bg: string; border: string; text: string }> = {
  new: { bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.35)', text: '#93c5fd' },
  contacted: { bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.35)', text: '#fcd34d' },
  qualified: { bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.35)', text: '#6ee7b7' },
  closed: { bg: 'rgba(52,211,153,0.2)', border: 'rgba(52,211,153,0.5)', text: '#34d399' },
  lost: { bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)', text: '#94a3b8' },
};

const PANEL_BG = 'rgba(8, 15, 30, 0.85)';
const CARD_BG = 'linear-gradient(180deg, rgba(17, 28, 49, 0.95), rgba(12, 22, 40, 0.92))';
const BORDER = '1px solid rgba(148,163,184,0.12)';
const SCROLL_STYLE = {
  overflowY: 'auto' as const,
  scrollbarWidth: 'thin' as const,
  scrollbarColor: 'rgba(96,165,250,0.18) transparent',
};

function pillStyle(tone: 'blue' | 'green' | 'amber' | 'slate') {
  const map = {
    blue: { bg: 'rgba(96,165,250,0.15)', text: '#93c5fd', border: 'rgba(96,165,250,0.25)' },
    green: { bg: 'rgba(52,211,153,0.12)', text: '#6ee7b7', border: 'rgba(52,211,153,0.25)' },
    amber: { bg: 'rgba(251,191,36,0.12)', text: '#fcd34d', border: 'rgba(251,191,36,0.25)' },
    slate: { bg: 'rgba(148,163,184,0.1)', text: '#94a3b8', border: 'rgba(148,163,184,0.18)' },
  }[tone];
  return {
    display: 'inline-block',
    padding: '2px 9px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: 700,
    background: map.bg,
    color: map.text,
    border: `1px solid ${map.border}`,
  };
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 75 ? '#34d399' : score >= 45 ? '#fbbf24' : '#60a5fa';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div
        style={{
          flex: 1,
          height: '5px',
          borderRadius: '999px',
          background: 'rgba(148,163,184,0.14)',
        }}
      >
        <div
          style={{
            width: `${score}%`,
            height: '100%',
            borderRadius: '999px',
            background: color,
            transition: 'width 300ms ease',
          }}
        />
      </div>
      <span style={{ color, fontSize: '12px', fontWeight: 700, minWidth: '28px' }}>{score}</span>
    </div>
  );
}

function getIntentScore(v: AnalyticsVisitorRecord): number {
  const first = new Date(v.firstSeenAt).getTime();
  const last = new Date(v.lastSeenAt).getTime();
  const spanMin =
    Number.isFinite(first) && Number.isFinite(last) ? Math.max(0, (last - first) / 60000) : 0;
  return Math.min(
    100,
    v.conversionCount * 42 +
      Math.min(v.viewCount * 5, 25) +
      Math.min(v.pages.length * 6, 18) +
      (v.recentPages.includes('/contact') ? 14 : 0) +
      (v.company ? 10 : 0) +
      (v.lastInquiryType ? 8 : 0) +
      (v.contactEmail ? 16 : 0) +
      (v.contactPhone ? 12 : 0) +
      (spanMin >= 10 ? 8 : 0)
  );
}

function getDisplayName(v: AnalyticsVisitorRecord): string {
  if (v.contactName && v.company) return `${v.contactName} · ${v.company}`;
  if (v.contactName) return v.contactName;
  if (v.company) return v.company;
  if (v.ipAddress) return `IP ${v.ipAddress}`;
  return `Visitor ${v.id.slice(0, 8)}`;
}

function buildEmailIntro(v: AnalyticsVisitorRecord): string {
  const firstName = v.contactName?.split(' ')[0] ?? 'there';
  const topic = v.lastInquiryType ?? v.recentPages[0] ?? 'your current project';

  return `Hi ${firstName}, I noticed interest around ${topic}. If helpful, I can share a quick plan or next-step recommendation based on what you're trying to improve.`;
}

function buildLinkedInNote(v: AnalyticsVisitorRecord): string {
  const company = v.company ?? 'your team';
  const topic = v.lastInquiryType ?? 'your workflow';

  return `Hi — reaching out with a quick idea for ${company}. We help teams simplify ${topic} with practical automation and delivery support. Happy to share a short recommendation if useful.`;
}

function buildFollowUpMessage(v: AnalyticsVisitorRecord): string {
  const firstName = v.contactName?.split(' ')[0] ?? 'there';
  const topic = v.lastInquiryType ?? v.recentPages[0] ?? 'your project';

  return `Hi ${firstName}, just following up in case support around ${topic} is still on your radar. Happy to send a short outline or answer any questions.`;
}

export default function ProspectsClient({ prospects: initial }: Props) {
  const [prospects, setProspects] = useState<ProspectEntry[]>(initial);
  const [selectedId, setSelectedId] = useState<string>(initial[0]?.visitor.id ?? '');
  const [statusFilter, setStatusFilter] = useState<CrmStatus | 'all'>('all');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupDomain, setLookupDomain] = useState('');
  const [lookupError, setLookupError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [copyNotice, setCopyNotice] = useState('');
  const [templateMode, setTemplateMode] = useState<'intro' | 'follow-up' | 'linkedin'>('intro');

  const [editNotes, setEditNotes] = useState<Record<string, string>>({});
  const [editFollowUp, setEditFollowUp] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    let list = prospects;
    if (statusFilter !== 'all') {
      list = list.filter((p) => p.crm.status === statusFilter);
    }
    if (quickFilter === 'reachable') {
      list = list.filter(isReachableProspect);
    } else if (quickFilter === 'follow-up') {
      list = list.filter(isFollowUpDue);
    } else if (quickFilter === 'research') {
      list = list.filter(needsResearch);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          getDisplayName(p.visitor).toLowerCase().includes(q) ||
          (p.visitor.location ?? '').toLowerCase().includes(q) ||
          (p.visitor.company ?? '').toLowerCase().includes(q) ||
          (p.crm.resolvedDomain ?? '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [prospects, statusFilter, quickFilter, searchQuery]);

  const reachableCount = prospects.filter(isReachableProspect).length;
  const followUpDueCount = prospects.filter(isFollowUpDue).length;
  const researchCount = prospects.filter(needsResearch).length;

  const selected = prospects.find((p) => p.visitor.id === selectedId) ?? filtered[0] ?? null;

  const updateCrm = useCallback(async (visitorId: string, patch: Record<string, unknown>) => {
    setSaving(true);
    setSaveError('');
    try {
      const res = await fetch('/api/admin/crm/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId, ...patch }),
      });
      const json = (await res.json()) as { ok?: boolean; record?: CrmRecord; error?: string };
      if (!json.ok) {
        setSaveError(json.error ?? 'Failed to save');
        return;
      }
      if (json.record) {
        setProspects((prev) =>
          prev.map((p) =>
            p.visitor.id === visitorId ? { ...p, crm: json.record as CrmRecord } : p
          )
        );
      }
    } catch {
      setSaveError('Network error — try again');
    } finally {
      setSaving(false);
    }
  }, []);

  const lookupContacts = useCallback(async (visitorId: string, domain: string) => {
    if (!domain.trim()) {
      setLookupError('Enter a domain (e.g. acme.com)');
      return;
    }
    setLookupLoading(true);
    setLookupError('');
    try {
      const res = await fetch('/api/admin/crm/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId, domain: domain.trim().toLowerCase() }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        record?: CrmRecord;
        contacts?: CrmContact[];
        error?: string;
      };
      if (!json.ok) {
        setLookupError(json.error ?? 'Lookup failed');
        return;
      }
      if (json.record) {
        setProspects((prev) =>
          prev.map((p) =>
            p.visitor.id === visitorId ? { ...p, crm: json.record as CrmRecord } : p
          )
        );
      }
    } catch {
      setLookupError('Network error — try again');
    } finally {
      setLookupLoading(false);
    }
  }, []);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of prospects) {
      counts[p.crm.status] = (counts[p.crm.status] ?? 0) + 1;
    }
    return counts;
  }, [prospects]);

  const copyTemplate = useCallback(async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyNotice(`${label} copied`);
      window.setTimeout(() => setCopyNotice(''), 1800);
    } catch {
      setCopyNotice('Copy failed');
      window.setTimeout(() => setCopyNotice(''), 1800);
    }
  }, []);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '320px 1fr',
        gap: '16px',
        height: 'calc(100vh - 160px)',
        minHeight: '640px',
      }}
    >
      {/* ─── Left: Prospect list ─────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          borderRadius: '18px',
          padding: '14px',
          background: PANEL_BG,
          border: BORDER,
          overflow: 'hidden',
        }}
      >
        {/* Search */}
        <input
          type="text"
          placeholder="Search company, name, domain…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            background: 'rgba(15,23,42,0.8)',
            border: '1px solid rgba(148,163,184,0.18)',
            borderRadius: '10px',
            padding: '8px 12px',
            color: '#f4f8ff',
            fontSize: '13px',
            outline: 'none',
            width: '100%',
            boxSizing: 'border-box',
          }}
        />

        {/* Status filter tabs */}
        <div style={{ color: '#7e9fc7', fontSize: '11px', fontWeight: 700 }}>Status</div>
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          {(['all', 'new', 'contacted', 'qualified', 'closed', 'lost'] as const).map((s) => {
            const isActive = statusFilter === s;
            const colors = s !== 'all' ? STATUS_COLORS[s] : null;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                style={{
                  padding: '3px 9px',
                  borderRadius: '999px',
                  border: `1px solid ${isActive && colors ? colors.border : 'rgba(148,163,184,0.16)'}`,
                  background: isActive && colors ? colors.bg : 'transparent',
                  color: isActive && colors ? colors.text : '#93a8c9',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {s === 'all'
                  ? `All (${prospects.length})`
                  : `${CRM_STATUS_LABELS[s]} (${statusCounts[s] ?? 0})`}
              </button>
            );
          })}
        </div>

        <div style={{ color: '#7e9fc7', fontSize: '11px', fontWeight: 700 }}>Focus</div>
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          {(
            [
              { key: 'all', label: 'Everything', count: prospects.length },
              { key: 'reachable', label: 'Reachable', count: reachableCount },
              { key: 'follow-up', label: 'Follow-up due', count: followUpDueCount },
              { key: 'research', label: 'Needs research', count: researchCount },
            ] as const
          ).map((item) => {
            const isActive = quickFilter === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setQuickFilter(item.key)}
                style={{
                  padding: '3px 9px',
                  borderRadius: '999px',
                  border: `1px solid ${isActive ? 'rgba(245,158,11,0.35)' : 'rgba(148,163,184,0.16)'}`,
                  background: isActive ? 'rgba(245,158,11,0.12)' : 'transparent',
                  color: isActive ? '#fbbf24' : '#93a8c9',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {item.label} ({item.count})
              </button>
            );
          })}
        </div>

        {/* List */}
        <div
          style={{ ...SCROLL_STYLE, flex: 1, display: 'grid', gap: '6px', alignContent: 'start' }}
        >
          {filtered.length === 0 ? (
            <p style={{ color: '#9fb0cd', fontSize: '13px', margin: '10px 0' }}>
              No prospects match the current filter.
            </p>
          ) : (
            filtered.map((p) => {
              const score = getIntentScore(p.visitor);
              const isSelected = p.visitor.id === selectedId;
              const sc = STATUS_COLORS[p.crm.status];
              const dueNow = isFollowUpDue(p);
              return (
                <button
                  key={p.visitor.id}
                  onClick={() => setSelectedId(p.visitor.id)}
                  style={{
                    textAlign: 'left',
                    padding: '10px 12px',
                    borderRadius: '12px',
                    background: isSelected
                      ? 'rgba(96,165,250,0.1)'
                      : dueNow
                        ? 'linear-gradient(180deg, rgba(245,158,11,0.10), rgba(12, 22, 40, 0.92))'
                        : CARD_BG,
                    border: `1px solid ${
                      isSelected
                        ? 'rgba(96,165,250,0.35)'
                        : dueNow
                          ? 'rgba(245,158,11,0.30)'
                          : 'rgba(148,163,184,0.1)'
                    }`,
                    cursor: 'pointer',
                    width: '100%',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '4px',
                    }}
                  >
                    <span
                      style={{
                        color: '#f4f8ff',
                        fontSize: '13px',
                        fontWeight: 700,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '170px',
                      }}
                    >
                      {getDisplayName(p.visitor)}
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '1px 7px',
                        borderRadius: '999px',
                        background: sc.bg,
                        color: sc.text,
                        border: `1px solid ${sc.border}`,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {CRM_STATUS_LABELS[p.crm.status]}
                    </span>
                  </div>
                  <div style={{ color: '#7e9fc7', fontSize: '11px', marginBottom: '6px' }}>
                    {[p.visitor.location, p.crm.resolvedDomain ?? p.visitor.hostname]
                      .filter(Boolean)
                      .join(' · ') || 'No location data'}
                  </div>
                  <ScoreBar score={score} />
                  {p.crm.followUpAt && (
                    <div style={{ color: '#fcd34d', fontSize: '11px', marginTop: '4px' }}>
                      {dueNow ? 'Due now' : 'Follow-up'}:{' '}
                      {new Date(p.crm.followUpAt).toLocaleDateString()}
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ─── Right: Detail panel ─────────────────────────────── */}
      {selected ? (
        <DetailPanel
          key={selected.visitor.id}
          entry={selected}
          saving={saving}
          saveError={saveError}
          lookupLoading={lookupLoading}
          lookupError={lookupError}
          lookupDomain={lookupDomain}
          editNotes={editNotes[selected.visitor.id] ?? selected.crm.notes}
          editFollowUp={
            editFollowUp[selected.visitor.id] ?? selected.crm.followUpAt?.slice(0, 10) ?? ''
          }
          onStatusChange={(status) => updateCrm(selected.visitor.id, { status })}
          onNotesChange={(v) => setEditNotes((prev) => ({ ...prev, [selected.visitor.id]: v }))}
          onFollowUpChange={(v) =>
            setEditFollowUp((prev) => ({ ...prev, [selected.visitor.id]: v }))
          }
          onSave={() =>
            updateCrm(selected.visitor.id, {
              notes: editNotes[selected.visitor.id] ?? selected.crm.notes,
              followUpAt: editFollowUp[selected.visitor.id] ?? selected.crm.followUpAt,
            })
          }
          onLookupDomainChange={setLookupDomain}
          onLookup={() => lookupContacts(selected.visitor.id, lookupDomain)}
          copyNotice={copyNotice}
          templateMode={templateMode}
          onTemplateModeChange={setTemplateMode}
          onCopyEmailIntro={() => copyTemplate(buildEmailIntro(selected.visitor), 'Email intro')}
          onCopyFollowUp={() => copyTemplate(buildFollowUpMessage(selected.visitor), 'Follow-up')}
          onCopyLinkedInNote={() =>
            copyTemplate(buildLinkedInNote(selected.visitor), 'LinkedIn note')
          }
        />
      ) : (
        <div
          style={{
            display: 'grid',
            placeItems: 'center',
            borderRadius: '18px',
            background: PANEL_BG,
            border: BORDER,
            color: '#7e9fc7',
          }}
        >
          Select a prospect from the list
        </div>
      )}
    </div>
  );
}

type DetailPanelProps = {
  entry: ProspectEntry;
  saving: boolean;
  saveError: string;
  lookupLoading: boolean;
  lookupError: string;
  lookupDomain: string;
  editNotes: string;
  editFollowUp: string;
  onStatusChange: (s: CrmStatus) => void;
  onNotesChange: (v: string) => void;
  onFollowUpChange: (v: string) => void;
  onSave: () => void;
  onLookupDomainChange: (v: string) => void;
  onLookup: () => void;
  copyNotice: string;
  templateMode: 'intro' | 'follow-up' | 'linkedin';
  onTemplateModeChange: (value: 'intro' | 'follow-up' | 'linkedin') => void;
  onCopyEmailIntro: () => void;
  onCopyFollowUp: () => void;
  onCopyLinkedInNote: () => void;
};

function DetailPanel({
  entry,
  saving,
  saveError,
  lookupLoading,
  lookupError,
  lookupDomain,
  editNotes,
  editFollowUp,
  onStatusChange,
  onNotesChange,
  onFollowUpChange,
  onSave,
  onLookupDomainChange,
  onLookup,
  copyNotice,
  templateMode,
  onTemplateModeChange,
  onCopyEmailIntro,
  onCopyFollowUp,
  onCopyLinkedInNote,
}: DetailPanelProps) {
  const { visitor: v, crm } = entry;
  const score = getIntentScore(v);
  const scoreTone =
    score >= 75 ? 'green' : score >= 45 ? 'amber' : ('blue' as 'green' | 'amber' | 'blue');
  const suggestedDomain = getSuggestedResearchDomain(v, crm) ?? '';
  const researchLinks = buildResearchLinks(v, crm);
  const behaviorSignals = getProspectSignals(v);

  return (
    <div
      style={{
        ...SCROLL_STYLE,
        borderRadius: '18px',
        padding: '18px',
        background: PANEL_BG,
        border: BORDER,
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      {/* Header */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '12px',
            marginBottom: '8px',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#f4f8ff' }}>
            {getDisplayName(v)}
          </h2>
          <span style={pillStyle(scoreTone)}>Score {score}/100</span>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {v.contactEmail && <span style={pillStyle('green')}>✉ {v.contactEmail}</span>}
          {v.contactPhone && <span style={pillStyle('green')}>📞 {v.contactPhone}</span>}
          {v.location && <span style={pillStyle('slate')}>{v.location}</span>}
          {v.source && <span style={pillStyle('blue')}>via {v.source}</span>}
          {v.utmCampaign && <span style={pillStyle('amber')}>Campaign: {v.utmCampaign}</span>}
          {isFollowUpDue(entry) ? <span style={pillStyle('amber')}>Follow-up due</span> : null}
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
          {v.contactEmail ? (
            <a
              href={`mailto:${v.contactEmail}`}
              style={{ ...pillStyle('green'), textDecoration: 'none' }}
            >
              Email now
            </a>
          ) : null}
          {v.contactPhone ? (
            <a
              href={`tel:${v.contactPhone}`}
              style={{ ...pillStyle('green'), textDecoration: 'none' }}
            >
              Call now
            </a>
          ) : null}
          <button
            type="button"
            onClick={onCopyEmailIntro}
            style={{
              ...pillStyle(templateMode === 'intro' ? 'blue' : 'slate'),
              cursor: 'pointer',
              background:
                templateMode === 'intro' ? 'rgba(96,165,250,0.15)' : 'rgba(148,163,184,0.1)',
            }}
          >
            Copy email intro
          </button>
          <button
            type="button"
            onClick={onCopyFollowUp}
            style={{
              ...pillStyle(templateMode === 'follow-up' ? 'green' : 'slate'),
              cursor: 'pointer',
              background:
                templateMode === 'follow-up' ? 'rgba(52,211,153,0.12)' : 'rgba(148,163,184,0.1)',
            }}
          >
            Copy follow-up
          </button>
          <button
            type="button"
            onClick={onCopyLinkedInNote}
            style={{
              ...pillStyle(templateMode === 'linkedin' ? 'amber' : 'slate'),
              cursor: 'pointer',
              background:
                templateMode === 'linkedin' ? 'rgba(251,191,36,0.12)' : 'rgba(148,163,184,0.1)',
            }}
          >
            Copy LinkedIn note
          </button>
          <a
            href="/contact"
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...pillStyle('blue'), textDecoration: 'none' }}
          >
            Open contact page
          </a>
        </div>
        {copyNotice ? (
          <div style={{ color: '#6ee7b7', fontSize: '12px', marginTop: '8px' }}>{copyNotice}</div>
        ) : null}
        <div style={{ color: '#64748b', fontSize: '11px', marginTop: '6px' }}>
          Template focus:{' '}
          {templateMode === 'intro'
            ? 'First outreach'
            : templateMode === 'follow-up'
              ? 'Follow-up reminder'
              : 'LinkedIn note'}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '14px',
        }}
      >
        {/* ─ CRM Status & Actions ─ */}
        <div
          style={{
            borderRadius: '14px',
            padding: '14px',
            background: CARD_BG,
            border: BORDER,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div
            style={{ color: '#93c5fd', fontSize: '11px', fontWeight: 800, letterSpacing: '0.08em' }}
          >
            CRM STATUS
          </div>

          {/* Status selector */}
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            {(Object.keys(CRM_STATUS_LABELS) as CrmStatus[]).map((s) => {
              const isActive = crm.status === s;
              const sc = STATUS_COLORS[s];
              return (
                <button
                  key={s}
                  onClick={() => onStatusChange(s)}
                  disabled={saving}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '999px',
                    border: `1px solid ${isActive ? sc.border : 'rgba(148,163,184,0.16)'}`,
                    background: isActive ? sc.bg : 'transparent',
                    color: isActive ? sc.text : '#93a8c9',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: saving ? 'default' : 'pointer',
                  }}
                >
                  {CRM_STATUS_LABELS[s]}
                </button>
              );
            })}
          </div>

          {/* Follow-up date */}
          <div>
            <label
              style={{ color: '#7e9fc7', fontSize: '12px', display: 'block', marginBottom: '4px' }}
            >
              Follow-up date
            </label>
            <input
              type="date"
              value={editFollowUp}
              onChange={(e) => onFollowUpChange(e.target.value)}
              style={{
                background: 'rgba(15,23,42,0.8)',
                border: '1px solid rgba(148,163,184,0.18)',
                borderRadius: '8px',
                padding: '6px 10px',
                color: '#f4f8ff',
                fontSize: '13px',
                outline: 'none',
                colorScheme: 'dark',
              }}
            />
          </div>

          {/* Notes */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ color: '#7e9fc7', fontSize: '12px' }}>Notes</label>
            <textarea
              value={editNotes}
              onChange={(e) => onNotesChange(e.target.value)}
              rows={4}
              placeholder="Add your notes here…"
              style={{
                background: 'rgba(15,23,42,0.8)',
                border: '1px solid rgba(148,163,184,0.18)',
                borderRadius: '8px',
                padding: '8px 10px',
                color: '#f4f8ff',
                fontSize: '13px',
                resize: 'vertical',
                outline: 'none',
                fontFamily: 'inherit',
                width: '100%',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            onClick={onSave}
            disabled={saving}
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              border: 'none',
              background: saving ? 'rgba(148,163,184,0.2)' : 'rgba(96,165,250,0.18)',
              color: saving ? '#94a3b8' : '#93c5fd',
              fontWeight: 700,
              cursor: saving ? 'default' : 'pointer',
              fontSize: '13px',
            }}
          >
            {saving ? 'Saving…' : 'Save notes & follow-up'}
          </button>
          {saveError && <div style={{ color: '#f87171', fontSize: '12px' }}>{saveError}</div>}
        </div>

        {/* ─ Visitor Behavior ─ */}
        <div
          style={{
            borderRadius: '14px',
            padding: '14px',
            background: CARD_BG,
            border: BORDER,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div
            style={{ color: '#93c5fd', fontSize: '11px', fontWeight: 800, letterSpacing: '0.08em' }}
          >
            BEHAVIOR
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { label: 'Page views', value: v.viewCount },
              { label: 'Unique pages', value: v.pages.length },
              { label: 'Conversions', value: v.conversionCount },
              { label: 'Device', value: v.device },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ color: '#7e9fc7', fontSize: '11px' }}>{label}</div>
                <div style={{ color: '#f4f8ff', fontWeight: 700 }}>{value}</div>
              </div>
            ))}
          </div>
          <div>
            <div style={{ color: '#7e9fc7', fontSize: '11px', marginBottom: '4px' }}>
              Recent pages
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {v.recentPages.slice(0, 6).map((pg) => (
                <span key={pg} style={pillStyle('slate')}>
                  {pg}
                </span>
              ))}
            </div>
          </div>
          {v.lastInquiryType && (
            <div>
              <div style={{ color: '#7e9fc7', fontSize: '11px' }}>Interest</div>
              <div style={{ color: '#f4f8ff', fontWeight: 700 }}>{v.lastInquiryType}</div>
            </div>
          )}
          {(v.isp || v.hostname) && (
            <div>
              <div style={{ color: '#7e9fc7', fontSize: '11px', marginBottom: '2px' }}>Network</div>
              <div style={{ color: '#dbe7fb', fontSize: '12px' }}>
                {[v.isp, v.hostname].filter(Boolean).join(' · ')}
              </div>
            </div>
          )}
          {behaviorSignals.length > 0 && (
            <div>
              <div style={{ color: '#7e9fc7', fontSize: '11px', marginBottom: '4px' }}>Signals</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {behaviorSignals.map((signal) => (
                  <span key={signal} style={pillStyle('amber')}>
                    {signal}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div style={{ color: '#7e9fc7', fontSize: '11px' }}>
            First seen: {new Date(v.firstSeenAt).toLocaleDateString()} · Last:{' '}
            {new Date(v.lastSeenAt).toLocaleDateString()}
          </div>
          <div style={{ color: '#64748b', fontSize: '11px', lineHeight: 1.6 }}>
            Returning visitors are matched using the existing browser ID stored locally in the
            browser. That gives you a fully free repeat-visit signal without paid enrichment tools.
          </div>
        </div>
      </div>

      {/* ─ Free research shortcuts ─ */}
      <div
        style={{
          borderRadius: '14px',
          padding: '14px',
          background: CARD_BG,
          border: BORDER,
        }}
      >
        <div
          style={{
            color: '#93c5fd',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.08em',
            marginBottom: '10px',
          }}
        >
          RESEARCH SHORTCUTS
        </div>
        <p style={{ color: '#9fb0cd', fontSize: '13px', lineHeight: 1.6, margin: '0 0 10px' }}>
          Save the domain in CRM, then use the links below for manual company and outreach research.
        </p>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
          <input
            type="text"
            placeholder={(crm.resolvedDomain ?? suggestedDomain) || 'Enter domain e.g. acme.com'}
            value={lookupDomain}
            onChange={(e) => onLookupDomainChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onLookup()}
            style={{
              flex: 1,
              background: 'rgba(15,23,42,0.8)',
              border: '1px solid rgba(148,163,184,0.18)',
              borderRadius: '8px',
              padding: '7px 12px',
              color: '#f4f8ff',
              fontSize: '13px',
              outline: 'none',
            }}
          />
          <button
            onClick={onLookup}
            disabled={lookupLoading}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              border: 'none',
              background: lookupLoading ? 'rgba(148,163,184,0.15)' : 'rgba(52,211,153,0.18)',
              color: lookupLoading ? '#94a3b8' : '#6ee7b7',
              fontWeight: 700,
              cursor: lookupLoading ? 'default' : 'pointer',
              fontSize: '13px',
              whiteSpace: 'nowrap',
            }}
          >
            {lookupLoading ? 'Saving…' : 'Save domain'}
          </button>
        </div>
        {lookupError && (
          <div style={{ color: '#f87171', fontSize: '12px', marginBottom: '8px' }}>
            {lookupError}
          </div>
        )}

        {researchLinks.length > 0 ? (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
            {researchLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  ...pillStyle('blue'),
                  textDecoration: 'none',
                }}
              >
                {link.label}
              </a>
            ))}
          </div>
        ) : null}

        {crm.contacts.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ color: '#64748b', fontSize: '11px' }}>Saved contacts</div>
            {crm.contacts.map((c, i) => (
              <ContactRow key={i} contact={c} />
            ))}
          </div>
        ) : v.contactEmail || v.contactPhone ? (
          <p style={{ color: '#9fb0cd', fontSize: '13px', margin: 0 }}>
            This visitor already shared direct contact details above, so you can follow up without
            any external lookup service.
          </p>
        ) : (
          <p style={{ color: '#9fb0cd', fontSize: '13px', margin: 0 }}>
            No direct contact info has been captured yet. Use the saved domain plus the research
            links above to find the right decision maker manually.
          </p>
        )}
      </div>
    </div>
  );
}

function ContactRow({ contact }: { contact: CrmContact }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 10px',
        borderRadius: '10px',
        background: 'rgba(15,23,42,0.6)',
        border: '1px solid rgba(148,163,184,0.1)',
        gap: '10px',
        flexWrap: 'wrap',
      }}
    >
      <div>
        <div style={{ color: '#f4f8ff', fontWeight: 700, fontSize: '13px' }}>
          {contact.name ?? 'Unknown'}
        </div>
        {contact.title && <div style={{ color: '#7e9fc7', fontSize: '12px' }}>{contact.title}</div>}
      </div>
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
        {contact.email && (
          <a
            href={`mailto:${contact.email}`}
            style={{
              ...pillStyle('green'),
              textDecoration: 'none',
            }}
          >
            ✉ {contact.email}
          </a>
        )}
        {contact.linkedinUrl && (
          <a
            href={contact.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              ...pillStyle('blue'),
              textDecoration: 'none',
            }}
          >
            LinkedIn
          </a>
        )}
        <span style={pillStyle('slate')}>{contact.source}</span>
      </div>
    </div>
  );
}

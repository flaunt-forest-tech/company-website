import 'server-only';

import type { AnalyticsVisitorRecord } from '@/lib/analytics';

export type ProspectScoutPriority = 'Hot' | 'Warm' | 'Watch';

export type ProspectScoutItem = {
  id: string;
  name: string;
  score: number;
  priority: ProspectScoutPriority;
  summary: string;
  reasons: string[];
  nextAction: string;
};

export type ProspectScoutSnapshot = {
  headline: string;
  summary: string;
  actionLabel: string;
  hotCount: number;
  returningCount: number;
  items: ProspectScoutItem[];
};

function getProspectScore(visitor: AnalyticsVisitorRecord): number {
  const first = new Date(visitor.firstSeenAt).getTime();
  const last = new Date(visitor.lastSeenAt).getTime();
  const spanMinutes =
    Number.isFinite(first) && Number.isFinite(last) ? Math.max(0, (last - first) / 60000) : 0;

  return Math.min(
    100,
    visitor.conversionCount * 42 +
      Math.min(visitor.viewCount * 5, 25) +
      Math.min(visitor.pages.length * 6, 18) +
      (visitor.recentPages.includes('/contact') ? 14 : 0) +
      (visitor.company ? 10 : 0) +
      (visitor.lastInquiryType ? 8 : 0) +
      (spanMinutes >= 10 ? 8 : 0)
  );
}

function getDisplayName(visitor: AnalyticsVisitorRecord): string {
  if (visitor.company) {
    return visitor.company;
  }

  if (visitor.ipAddress) {
    return `IP ${visitor.ipAddress}`;
  }

  return `Visitor ${visitor.id.slice(0, 8)}`;
}

function buildReasons(visitor: AnalyticsVisitorRecord, score: number): string[] {
  const reasons: string[] = [];

  if (visitor.conversionCount > 0) {
    reasons.push(
      `${visitor.conversionCount} lead submission${visitor.conversionCount === 1 ? '' : 's'}`
    );
  }

  if (visitor.viewCount >= 4) {
    reasons.push(`${visitor.viewCount} page views`);
  }

  if (visitor.pages.length >= 3) {
    reasons.push(`${visitor.pages.length} unique pages explored`);
  }

  if (visitor.recentPages.includes('/contact')) {
    reasons.push('Visited contact page');
  }

  if (visitor.company) {
    reasons.push(`Company signal: ${visitor.company}`);
  }

  if (visitor.lastInquiryType) {
    reasons.push(`Interest: ${visitor.lastInquiryType}`);
  }

  if (reasons.length === 0) {
    reasons.push(score >= 35 ? 'Repeated browsing pattern' : 'Early-stage site exploration');
  }

  return reasons.slice(0, 4);
}

function getPriority(score: number, visitor: AnalyticsVisitorRecord): ProspectScoutPriority {
  if (visitor.conversionCount > 0 || score >= 75) {
    return 'Hot';
  }

  if (score >= 45 || visitor.viewCount >= 3) {
    return 'Warm';
  }

  return 'Watch';
}

function buildSummary(visitor: AnalyticsVisitorRecord, priority: ProspectScoutPriority): string {
  const companyText = visitor.company ? ` from ${visitor.company}` : '';
  const sourceText = visitor.source ? ` via ${visitor.source}` : '';

  if (priority === 'Hot') {
    return `Returning prospect${companyText}${sourceText} is showing clear buying intent and should be followed up quickly.`;
  }

  if (priority === 'Warm') {
    return `Engaged visitor${companyText}${sourceText} is exploring multiple service pages and is worth nurturing.`;
  }

  return `Early-stage visitor${sourceText} is still researching and should stay in the watchlist.`;
}

function buildNextAction(visitor: AnalyticsVisitorRecord, priority: ProspectScoutPriority): string {
  if (visitor.conversionCount > 0) {
    return 'Reply fast with a tailored discovery call invite.';
  }

  if (visitor.recentPages.includes('/contact')) {
    return 'Retarget with a contact-focused offer or case study.';
  }

  if (visitor.company) {
    return 'Research the account and prepare a personalized outreach note.';
  }

  if (priority === 'Warm') {
    return 'Keep nurturing with relevant service proof and remarketing.';
  }

  return 'Monitor for another return visit before outbound follow-up.';
}

export function buildProspectScout(visitors: AnalyticsVisitorRecord[]): ProspectScoutSnapshot {
  const items = visitors
    .map((visitor) => {
      const score = getProspectScore(visitor);
      const priority = getPriority(score, visitor);

      return {
        id: visitor.id,
        name: getDisplayName(visitor),
        score,
        priority,
        summary: buildSummary(visitor, priority),
        reasons: buildReasons(visitor, score),
        nextAction: buildNextAction(visitor, priority),
      } satisfies ProspectScoutItem;
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, 5);

  const hotCount = items.filter((item) => item.priority === 'Hot').length;
  const returningCount = visitors.filter(
    (visitor) => visitor.viewCount >= 4 || visitor.pages.length >= 3 || visitor.conversionCount > 0
  ).length;
  const leadItem = items[0];

  return {
    headline:
      hotCount > 0
        ? `${hotCount} high-likelihood prospect${hotCount === 1 ? '' : 's'} detected`
        : items.length > 0
          ? 'No hot leads yet, but active prospects are emerging'
          : 'Waiting for enough visitor behavior to rank prospects',
    summary:
      leadItem?.summary ??
      'Once visitors start browsing multiple pages, the scout will rank who looks most sales-ready.',
    actionLabel: leadItem?.nextAction ?? 'Keep monitoring the dashboard for fresh activity.',
    hotCount,
    returningCount,
    items,
  };
}

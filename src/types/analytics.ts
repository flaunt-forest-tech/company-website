// Shared analytics types — no server-only code, safe for client components

export type AnalyticsPageStat = {
  path: string;
  views: number;
};

export type AnalyticsVisitorRecord = {
  id: string;
  ipAddress: string | null;
  firstSeenAt: string;
  lastSeenAt: string;
  source: string;
  location: string | null;
  company: string | null;
  hostname: string | null;
  isp: string | null;
  networkAsn: string | null;
  networkType: string | null;
  networkService: string | null;
  device: string;
  utmSource: string | null;
  utmCampaign: string | null;
  lastInquiryType: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  viewCount: number;
  conversionCount: number;
  pages: AnalyticsPageStat[];
  recentPages: string[];
};

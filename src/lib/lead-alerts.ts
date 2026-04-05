import 'server-only';

export type LeadAlertInput = {
  name: string;
  email: string;
  phone: string;
  inquiryType: string;
  subject: string;
  message: string;
  sourcePage?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
};

const FREE_EMAIL_PROVIDERS = new Set([
  'gmail.com',
  'outlook.com',
  'hotmail.com',
  'yahoo.com',
  'icloud.com',
  'aol.com',
  'qq.com',
  '163.com',
  'proton.me',
  'protonmail.com',
]);

function getEmailDomain(email: string): string | null {
  const domain = email.toLowerCase().split('@')[1]?.trim();
  return domain || null;
}

function inferCompanyHint(email: string): string | null {
  const domain = getEmailDomain(email);

  if (!domain || FREE_EMAIL_PROVIDERS.has(domain)) {
    return null;
  }

  return domain.replace(/^www\./, '');
}

export function getLeadScore(input: LeadAlertInput): number {
  let score = 30;
  const companyHint = inferCompanyHint(input.email);
  const inquiry = input.inquiryType.toLowerCase();
  const sourcePage = (input.sourcePage ?? '').toLowerCase();

  if (companyHint) {
    score += 20;
  }

  if (input.utmSource || input.utmCampaign) {
    score += 12;
  }

  if (sourcePage.includes('contact') || sourcePage.includes('ai-solutions')) {
    score += 12;
  }

  if (/ai|automation|software|cloud|web3|security|support/.test(inquiry)) {
    score += 12;
  }

  if (input.message.trim().length >= 120) {
    score += 8;
  }

  if (input.phone.trim().length >= 7) {
    score += 6;
  }

  return Math.min(score, 100);
}

export function getLeadTemperature(score: number): 'Hot' | 'Warm' | 'New' {
  if (score >= 75) {
    return 'Hot';
  }

  if (score >= 55) {
    return 'Warm';
  }

  return 'New';
}

export async function sendLeadAlert(input: LeadAlertInput): Promise<void> {
  const webhookUrl = process.env.LEAD_ALERT_WEBHOOK_URL?.trim();

  if (!webhookUrl) {
    return;
  }

  const score = getLeadScore(input);
  const temperature = getLeadTemperature(score);
  const companyHint = inferCompanyHint(input.email) ?? 'Personal email or unknown company';
  const messagePreview = input.message.replace(/\s+/g, ' ').trim().slice(0, 220);
  const lines = [
    `🚨 New ${temperature} lead (${score}/100)`,
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    `Phone: ${input.phone}`,
    `Inquiry: ${input.inquiryType}`,
    `Company hint: ${companyHint}`,
    `Source page: ${input.sourcePage || 'Unknown'}`,
    `UTM: ${input.utmSource || 'direct'} / ${input.utmMedium || 'none'} / ${input.utmCampaign || 'none'}`,
    `Subject: ${input.subject}`,
    `Message: ${messagePreview || 'No preview available'}`,
  ];

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: lines.join('\n'),
        content: lines.join('\n'),
      }),
    });
  } catch (error) {
    console.error(
      'Lead alert webhook failed',
      error instanceof Error ? error.message : String(error)
    );
  }
}

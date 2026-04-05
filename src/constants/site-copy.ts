export type CopyCard = {
  title: string;
  description: string;
};

export type LabeledCopyCard = CopyCard & {
  label: string;
};

export const HOME_BUSINESS_PROBLEMS: LabeledCopyCard[] = [
  {
    label: '01',
    title: 'Too much manual work',
    description:
      'Repeated admin, follow-ups, and handoffs slow down daily operations and create avoidable friction.',
  },
  {
    label: '02',
    title: 'Disconnected tools and data',
    description:
      'Important information lives across inboxes, spreadsheets, forms, and apps with no clean flow between them.',
  },
  {
    label: '03',
    title: 'Software that no longer fits',
    description:
      'Generic tools can only take you so far when the real need is a better system built around your workflow.',
  },
];

export const HOME_EXAMPLE_SOLUTIONS: LabeledCopyCard[] = [
  {
    label: 'Lead Flow',
    title: 'Lead intake and follow-up workflows',
    description:
      'Capture enquiries, route them correctly, and keep the follow-up process organized without relying on manual admin.',
  },
  {
    label: 'Operations',
    title: 'Internal dashboards and workflow tools',
    description:
      'Replace spreadsheet-heavy processes with a clearer system for requests, updates, approvals, and reporting.',
  },
  {
    label: 'Client Service',
    title: 'Websites, portals, and service platforms',
    description:
      'Give clients or users a more professional way to submit requests, access information, and move projects forward.',
  },
  {
    label: 'Automation',
    title: 'Backend integrations and process automation',
    description:
      'Connect systems, move data automatically, and reduce repeated tasks across the business.',
  },
  {
    label: 'Visibility',
    title: 'Reporting and business oversight tools',
    description:
      'Bring the right information into one place so it is easier to track work and make decisions.',
  },
  {
    label: 'AI Support',
    title: 'Useful AI features inside real workflows',
    description:
      'Apply AI where it genuinely helps, such as search, summaries, classification, workflow support, or information handling.',
  },
];

export const HOME_WHO_WE_HELP: CopyCard[] = [
  {
    title: 'Small and midsize businesses',
    description:
      'Businesses that need better systems behind their day-to-day operations, service delivery, or enquiries.',
  },
  {
    title: 'Growing teams',
    description:
      'Teams replacing spreadsheets, manual steps, and disconnected tools with something clearer and more reliable.',
  },
  {
    title: 'Service providers',
    description:
      'Businesses that need stronger websites, client portals, internal tools, or cleaner follow-up workflows.',
  },
  {
    title: 'Individual clients',
    description:
      'Clients with a clear technical project, product idea, workflow issue, or platform improvement in mind.',
  },
];

export const HOME_HOW_WE_WORK: LabeledCopyCard[] = [
  {
    label: '01',
    title: 'Understand the workflow',
    description:
      'We start with the real process, what is slowing things down, and what needs to improve.',
  },
  {
    label: '02',
    title: 'Define the right scope',
    description:
      'We prioritize what should be built now versus later, so the first delivery cycle stays focused.',
  },
  {
    label: '03',
    title: 'Build with focus',
    description:
      'We implement in short cycles with clear checkpoints, so decisions and progress stay visible.',
  },
  {
    label: '04',
    title: 'Launch and improve',
    description: 'Once live, we help refine, extend, or support the system where it makes sense.',
  },
];

export const HOME_WHY_CHOOSE_US: CopyCard[] = [
  {
    title: 'Practical over hype',
    description:
      'We recommend only what is useful for the situation instead of selling broad transformation stories.',
  },
  {
    title: 'Hands-on delivery',
    description:
      'Execution is part of the service, not something handed off after planning documents are done.',
  },
  {
    title: 'Built around the real workflow',
    description:
      'Recommendations are shaped around your current process and constraints, not generic templates.',
  },
  {
    title: 'Direct communication',
    description:
      'You get straightforward updates, clear tradeoffs, and fast decisions throughout delivery.',
  },
  {
    title: 'Flexible for different clients',
    description:
      'We work with businesses, teams, and individual clients when the technical need is clear and the scope is practical.',
  },
];

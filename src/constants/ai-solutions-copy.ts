export type AICopyCard = {
  title: string;
  description: string;
};

export type AILabeledCopyCard = AICopyCard & {
  label: string;
};

export type AIExampleSolution = {
  category: string;
  title: string;
  scenario: string;
  stack: string;
};

export type AIFaqItem = {
  id: string;
  question: string;
  answer: string;
};

export const AI_CAPABILITIES: AICopyCard[] = [
  {
    title: 'Workflow automation',
    description:
      'Use AI and automation to reduce repeated admin, speed up handoffs, and simplify routine work.',
  },
  {
    title: 'AI features inside real products',
    description:
      'Add useful AI capabilities to websites, portals, apps, and internal tools where they improve daily use.',
  },
  {
    title: 'Custom software around your process',
    description:
      'Build systems that fit how you actually work instead of forcing more workarounds around generic tools.',
  },
  {
    title: 'Backend integration and data flow',
    description:
      'Connect forms, CRMs, databases, APIs, and internal tools so information moves more cleanly across the business.',
  },
  {
    title: 'Practical AI planning',
    description:
      'Clarify where AI is useful, where it is not, and what the most sensible next step looks like for your situation.',
  },
  {
    title: 'Launch, support, and improvement',
    description:
      'Deploy the solution, support it after launch, and improve it as your workflow and needs evolve.',
  },
];

export const AI_DELIVERY_MODEL: AILabeledCopyCard[] = [
  {
    label: '01',
    title: 'Understand the workflow',
    description:
      'We start with the real process, the friction points, and what needs to improve before choosing any tools.',
  },
  {
    label: '02',
    title: 'Define the right scope',
    description:
      'We recommend a practical solution based on the actual need, whether that is automation, a custom tool, a portal, or backend work.',
  },
  {
    label: '03',
    title: 'Build and refine',
    description:
      'We deliver the system, get it working in the real environment, and improve it where useful after launch.',
  },
];

export const AI_CLOUD_BADGES: string[] = ['AWS', 'GCP', 'AZURE', 'HYBRID CLOUD'];

export const AI_FULL_STACK_SCOPE: string[] = [
  'Websites and web apps',
  'Backend APIs and services',
  'Databases and integrations',
  'Cloud deployment and support',
];

export const AI_EXAMPLE_SOLUTIONS: AIExampleSolution[] = [
  {
    category: 'Sales and enquiries',
    title: 'Lead intake and follow-up automation',
    scenario:
      'Useful when enquiries come in from multiple places and follow-up is inconsistent or too manual.',
    stack: 'Forms, CRM integration, email workflows, dashboards',
  },
  {
    category: 'Operations',
    title: 'Internal workflow dashboard',
    scenario:
      'Useful when requests, approvals, and updates are tracked across spreadsheets, inboxes, and disconnected tools.',
    stack: 'Next.js, backend APIs, databases, admin tools',
  },
  {
    category: 'Client service',
    title: 'Client portal or service platform',
    scenario:
      'Useful when clients need a clearer way to submit requests, access updates, or interact with your service online.',
    stack: 'Portals, authentication, backend integrations, cloud hosting',
  },
  {
    category: 'Support and knowledge',
    title: 'AI-assisted search and response tools',
    scenario:
      'Useful when staff spend too much time searching documents, answering repeat questions, or summarizing information.',
    stack: 'Search, retrieval, summaries, knowledge workflows',
  },
  {
    category: 'Admin and back office',
    title: 'Document and data processing workflows',
    scenario:
      'Useful when forms, files, emails, or records require repetitive handling and manual transfer between systems.',
    stack: 'Automation, APIs, document processing, databases',
  },
  {
    category: 'Web and product',
    title: 'AI features inside existing products',
    scenario:
      'Useful when a website, app, or internal product needs smarter search, classification, assistance, or workflow support.',
    stack: 'Web apps, backend services, AI APIs, cloud deployment',
  },
];

export const AI_TRUST_MESSAGE = {
  intro: 'We treat trust as part of the build, not an extra layer added later.',
  body: 'That means choosing sensible scope, building reliable workflows, and handling access, data flow, and automation carefully from the beginning.',
  support:
    'The goal is a system that feels professional, understandable, and safe to use in real day-to-day work.',
};

export const AI_TRUST_FOUNDATIONS: string[] = [
  'Clear scope and practical recommendations from the start',
  'Access control and permissions where the system requires it',
  'Thoughtful use of AI with sensible boundaries and review points',
  'Reliable backend structure, integrations, and deployment setup',
  'Focus on maintainability so the system stays usable over time',
  'Direct communication throughout the build process',
];

export const AI_WHO_WE_HELP: string[] = [
  'Small and midsize businesses that want better systems behind daily operations.',
  'Service providers improving enquiries, client workflows, or internal processes.',
  'Growing teams that need automation, internal tools, websites, or backend support.',
  'Individual clients with a clear project, workflow problem, or digital product need.',
];

export const AI_FAQS: AIFaqItem[] = [
  {
    id: 'aiFaqOne',
    question: 'Is this only for large AI projects?',
    answer:
      'No. Some projects are focused and straightforward, such as a workflow improvement, portal, automation setup, or a useful AI feature inside an existing system.',
  },
  {
    id: 'aiFaqTwo',
    question: 'Can you work with our existing systems?',
    answer:
      'Yes. We can improve or integrate with your current setup instead of forcing a full rebuild when that is not necessary.',
  },
  {
    id: 'aiFaqThree',
    question: 'Do you only work with businesses?',
    answer:
      'No. We work with businesses, teams, and individual clients when there is a clear technical need and a practical scope.',
  },
  {
    id: 'aiFaqFour',
    question: 'How do you approach AI safely and practically?',
    answer:
      'We focus on useful use cases, clear boundaries, reliable implementation, and the right level of review for the type of system being built.',
  },
];

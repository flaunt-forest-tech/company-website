import Footer from '@/components/shared/footer';
import GetInTouchSection from '@/components/shared/get-in-touch-section';
import Header from '@/components/shared/header';
import PageHeader, { PageHeaderProps } from '@/components/shared/page-header';
import ScriptLoader from '@/components/script-loader';
import Link from 'next/link';

const CAPABILITIES = [
  {
    title: 'Modernize Existing Platforms with AI',
    description:
      'Upgrade your current website, app, and internal systems with practical AI features, automation, governance-by-design, and analytics.',
  },
  {
    title: 'Build New Web & App Products',
    description:
      'Launch brand-new digital products with AI-ready architecture, scalable cloud foundations, and clear product strategy across frontend, backend, and database layers.',
  },
  {
    title: 'Full-Stack Engineering Delivery',
    description:
      'From frontend UX to backend APIs and database design, we build complete production systems, not isolated features.',
  },
  {
    title: 'Deploy AI Agents & Agentic Workflows',
    description:
      'Design autonomous, multi-step systems that coordinate tools, execute tasks, and improve operational speed with governance built in from the start.',
  },
  {
    title: 'Prompt Engineering & AI Strategy',
    description:
      'Develop high-performance prompts, fine-tune models for your domain, and build AI strategies aligned with your business goals and vertical industry needs.',
  },
  {
    title: 'Industry-Informed Delivery',
    description:
      'Apply experience across retail, manufacturing, services, and business operations to shape solutions around your industrys practical constraints and priorities.',
  },
];

const DELIVERY_MODEL = [
  {
    step: '01',
    title: 'Discovery & Opportunity Mapping',
    description:
      'We align business goals, technical constraints, and success metrics to define your highest-impact roadmap.',
  },
  {
    step: '02',
    title: 'Build & Integration',
    description:
      'We implement prioritized use cases across your existing stack or new products, including frontend, backend, database, and cloud integration with production-grade quality.',
  },
  {
    step: '03',
    title: 'Scale & Optimization',
    description:
      'We harden systems, monitor outcomes, and optimize continuously so performance improves over time.',
  },
];

const OUTCOME_NOTE =
  'These are representative outcomes based on our methodology and industry benchmarks. Actual results depend on implementation scope, data readiness, and adoption.';

const OUTCOME_CASES = [
  {
    industry: 'Retail & Commerce',
    title: 'Demand Planning & Inventory Optimization',
    scenario:
      'Typical scenario for retailers managing seasonal demand swings, stock imbalances, and fragmented planning across channels.',
    result:
      'Can help reduce inventory carrying costs by 20-35% and improve forecast accuracy by 10-20% when supported by clean demand and operations data.',
    tech: 'Python, forecasting models, AWS SageMaker, analytics dashboards',
  },
  {
    industry: 'Manufacturing',
    title: 'Predictive Maintenance & Production Monitoring',
    scenario:
      'Typical scenario for plants that need earlier visibility into equipment risk, maintenance scheduling, and line performance.',
    result:
      'Can reduce unplanned downtime by 30-50% and lower reactive maintenance spend by 15-25% with sensor-driven monitoring and failure prediction.',
    tech: 'IoT data pipelines, ML workflows, Apache Spark, AWS Lambda',
  },
  {
    industry: 'Financial Services',
    title: 'Document Review & Compliance Triage',
    scenario:
      'Common application for teams reviewing large volumes of onboarding, policy, and regulatory documents under tight turnaround times.',
    result:
      'Can reduce review cycle times by 60-85% and improve triage consistency across high-volume compliance workflows.',
    tech: 'NLP pipelines, LLM workflows, vector databases, Vertex AI',
  },
  {
    industry: 'Business Operations',
    title: 'Workflow Automation For Finance & Operations',
    scenario:
      'Common application for back-office teams handling invoices, approvals, exception routing, and repetitive internal requests.',
    result:
      'Can automate 40-70% of repetitive workflow steps and reduce manual processing time by 50-80% with the right process design.',
    tech: 'Workflow orchestration, agent frameworks, document AI, Cloud Run',
  },
  {
    industry: 'SaaS / Tech',
    title: 'AI Support Copilot & Knowledge Retrieval',
    scenario:
      'Typical scenario for support teams aiming to speed up responses, improve answer consistency, and deflect repetitive tier-one requests.',
    result:
      'Can improve first-response times by 50-80% and deflect 20-40% of tier-one support volume when paired with well-structured knowledge bases.',
    tech: 'Next.js, TypeScript, LLM APIs, embeddings, vector search',
  },
  {
    industry: 'Logistics & Supply Chain',
    title: 'Route Planning & Demand Coordination',
    scenario:
      'Typical scenario for logistics teams balancing route efficiency, delivery predictability, and changing regional demand patterns.',
    result:
      'Can reduce transportation planning effort by 25-40% and improve delivery predictability across regional operations.',
    tech: 'Route optimization APIs, ML pipelines, AWS SageMaker, Python',
  },
];

const FULL_STACK_SCOPE = [
  'Frontend Engineering',
  'Backend APIs & Services',
  'Database Architecture',
  'DevOps & Cloud Delivery',
];

const TRUST_FOUNDATIONS = [
  'Governance-by-design from discovery through delivery',
  'RBAC and role-based access control',
  'AI governance frameworks and practical guardrails',
  'Audit logs and operational traceability',
  'Data governance for AI and analytics workflows',
  'Responsible AI practices established early to reduce downstream risk',
];

const TRUST_MESSAGE = {
  intro:
    'As an agile AI solutions provider founded in Houston, we embed governance principles in every engagement.',
  body: 'We follow a governance-by-design approach from the start of each project, building access controls, auditability, guardrails, and decision accountability into the delivery process rather than adding them later.',
  support:
    'We also help clients establish Responsible AI practices early so teams can reduce policy, operational, and compliance risk before systems scale.',
};

const IDEAL_CLIENTS = [
  'Small and mid-size companies that want practical AI adoption without building a large in-house team first.',
  'Privately held companies modernizing operations, customer workflows, or internal systems with AI and automation.',
  'Growth-stage teams launching new digital products, AI-enabled services, or fast MVPs on AWS, GCP, Azure, or hybrid cloud.',
  'Larger organizations that need focused delivery for specific product, workflow, or data initiatives.',
];

const FAQS = [
  {
    id: 'aiFaqOne',
    question: 'Do you only handle frontend development?',
    answer:
      'No. We deliver full-stack systems including frontend, backend services, database design, and cloud deployment.',
  },
  {
    id: 'aiFaqTwo',
    question: 'Can you work with our existing systems?',
    answer:
      'Yes. We can modernize and integrate with current platforms while planning phased upgrades with minimal disruption.',
  },
  {
    id: 'aiFaqThree',
    question: 'Which cloud environments do you support?',
    answer:
      'We support AWS, GCP, Azure, and hybrid cloud environments based on your technical and compliance requirements.',
  },
  {
    id: 'aiFaqFour',
    question: 'How do you approach security and data governance?',
    answer:
      'We use a governance-by-design approach from day one, embedding access control, auditability, guardrails, and data governance into delivery while helping clients establish Responsible AI practices early.',
  },
];

export default function AISolutionsPage() {
  const pageHeaderData: PageHeaderProps = {
    title: 'AI SOLUTIONS',
    breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'AI Solutions' }],
  };

  return (
    <div className="body">
      <Header activePage="AISolutions" />
      <div role="main" className="main">
        <PageHeader {...pageHeaderData} />

        <section className="section bg-color-transparent border-0 mt-0 mb-0 pb-1">
          <div className="container container-xl-custom pt-4 mt-2">
            <div className="row justify-content-center">
              <div className="col-lg-10 text-center">
                <span className="d-block font-weight-bold custom-text-color-grey-1 line-height-1 mb-2">
                  WHAT WE DO
                </span>
                <h2 className="text-color-dark font-weight-bold text-8 line-height-2 mb-4">
                  One Partner For Digital Product Delivery And AI Execution
                </h2>
                <p className="custom-text-size-1 mb-0">
                  We modernize existing systems, build new web and app products, and deliver
                  full-stack AI execution from strategy to production.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section bg-color-transparent border-0 mt-0 mb-0 pt-3 pb-1">
          <div className="container container-xl-custom">
            <div className="row">
              {CAPABILITIES.map((item) => (
                <div key={item.title} className="col-md-6 mb-4">
                  <div className="card border-0 custom-box-shadow-1 h-100">
                    <div className="card-body p-4">
                      <h3 className="text-color-dark font-weight-bold text-5 mb-3">{item.title}</h3>
                      <p className="custom-text-size-1 mb-0">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section bg-color-transparent border-0 mt-0 mb-0 pt-3 pb-1">
          <div className="container container-xl-custom">
            <div className="row justify-content-center">
              <div className="col-lg-10 text-center">
                <span className="d-block font-weight-bold custom-text-color-grey-1 line-height-1 mb-2">
                  HOW WE DELIVER
                </span>
                <h3 className="text-color-dark font-weight-bold text-7 line-height-2 mb-4">
                  A Practical Delivery Model Built For Adoption
                </h3>
              </div>
            </div>
            <div className="row">
              {DELIVERY_MODEL.map((item) => (
                <div key={item.step} className="col-md-4 mb-4">
                  <div className="card border-0 custom-box-shadow-1 h-100">
                    <div className="card-body p-4">
                      <span className="d-block text-color-primary font-weight-bold text-6 mb-2">
                        {item.step}
                      </span>
                      <h4 className="text-color-dark font-weight-bold text-5 mb-3">{item.title}</h4>
                      <p className="custom-text-size-1 mb-0">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section bg-color-transparent border-0 mt-0 mb-0 pt-2 pb-1">
          <div className="container container-xl-custom">
            <div className="row justify-content-center">
              <div className="col-lg-10 text-center">
                <span className="d-block font-weight-bold custom-text-color-grey-1 line-height-1 mb-2">
                  CLOUD DELIVERY
                </span>
                <h3 className="text-color-dark font-weight-bold text-7 line-height-2 mb-4">
                  AWS, GCP, Azure, and Hybrid Cloud
                </h3>
              </div>
            </div>
            <div className="row justify-content-center pb-2">
              <div className="col-auto mb-2">
                <span className="badge bg-color-dark text-color-light px-4 py-2 text-2">AWS</span>
              </div>
              <div className="col-auto mb-2">
                <span className="badge bg-color-dark text-color-light px-4 py-2 text-2">GCP</span>
              </div>
              <div className="col-auto mb-2">
                <span className="badge bg-color-dark text-color-light px-4 py-2 text-2">AZURE</span>
              </div>
              <div className="col-auto mb-2">
                <span className="badge bg-color-dark text-color-light px-4 py-2 text-2">
                  HYBRID CLOUD
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="section bg-color-transparent border-0 mt-0 mb-0 pt-2 pb-1">
          <div className="container container-xl-custom">
            <div className="row justify-content-center">
              <div className="col-lg-10 text-center">
                <span className="d-block font-weight-bold custom-text-color-grey-1 line-height-1 mb-2">
                  FULL-STACK DELIVERY
                </span>
                <h3 className="text-color-dark font-weight-bold text-7 line-height-2 mb-4">
                  One Team Across Frontend, Backend, Database, and Cloud
                </h3>
              </div>
            </div>
            <div className="row pb-1">
              {FULL_STACK_SCOPE.map((item) => (
                <div key={item} className="col-sm-6 col-lg-3 mb-4">
                  <div className="card border-0 custom-box-shadow-1 h-100">
                    <div className="card-body p-4 text-center">
                      <h4 className="font-weight-bold text-5 mb-0">{item}</h4>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section bg-color-transparent border-0 mt-0 mb-0 pt-2 pb-1">
          <div className="container container-xl-custom">
            <div className="row justify-content-center">
              <div className="col-lg-10 text-center">
                <span className="d-block font-weight-bold custom-text-color-grey-1 line-height-1 mb-2">
                  EXAMPLE USE CASES
                </span>
                <h3 className="text-color-dark font-weight-bold text-7 line-height-2 mb-4">
                  Representative AI Applications
                </h3>
                <p className="custom-text-size-1 mb-0">
                  Typical applications we design and deliver for teams adopting AI in real-world
                  operations.
                </p>
              </div>
            </div>
            <div className="row pb-2">
              {OUTCOME_CASES.map((item) => (
                <div key={item.title} className="col-md-6 col-lg-6 mb-4">
                  <div className="card border-0 custom-box-shadow-1 h-100">
                    <div className="card-body p-4">
                      <span className="badge bg-light text-primary font-weight-bold text-3 mb-3 p-2">
                        {item.industry}
                      </span>
                      <h4 className="font-weight-bold text-5 mb-3">{item.title}</h4>
                      <p className="custom-text-size-1 text-color-grey mb-3">{item.scenario}</p>
                      <p className="custom-text-size-1 mb-3">{item.result}</p>
                      <p className="custom-text-size-1 text-color-grey mb-3">{OUTCOME_NOTE}</p>
                      <hr className="my-3" />
                      <p className="custom-text-size-1 text-color-grey mb-0">
                        <strong>Common delivery stack:</strong> {item.tech}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section bg-color-transparent border-0 mt-0 mb-0 pt-2 pb-1">
          <div className="container container-xl-custom">
            <div className="row justify-content-center">
              <div className="col-lg-10 text-center">
                <span className="d-block font-weight-bold custom-text-color-grey-1 line-height-1 mb-2">
                  TRUST & SECURITY
                </span>
                <h3 className="text-color-dark font-weight-bold text-7 line-height-2 mb-4">
                  Governance Built In From Day One
                </h3>
                <p className="custom-text-size-1 mb-3">{TRUST_MESSAGE.intro}</p>
                <p className="custom-text-size-1 mb-3">{TRUST_MESSAGE.body}</p>
                <p className="custom-text-size-1 mb-0">{TRUST_MESSAGE.support}</p>
              </div>
            </div>
            <div className="row justify-content-center pb-2">
              <div className="col-lg-10">
                <div className="card border-0 custom-box-shadow-1">
                  <div className="card-body p-4 p-lg-5">
                    <ul className="custom-text-size-1 mb-0 ps-3">
                      {TRUST_FOUNDATIONS.map((item) => (
                        <li key={item} className="pb-2">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section bg-color-transparent border-0 mt-0 mb-0 pt-2 pb-1">
          <div className="container container-xl-custom">
            <div className="row justify-content-center">
              <div className="col-lg-10 text-center">
                <span className="d-block font-weight-bold custom-text-color-grey-1 line-height-1 mb-2">
                  WHO WE WORK WITH
                </span>
                <h3 className="text-color-dark font-weight-bold text-7 line-height-2 mb-4">
                  Teams We Help Most
                </h3>
                <p className="custom-text-size-1 mb-0">
                  We work with a mix of small and mid-size businesses, privately held companies,
                  growth-stage teams, and selected larger organizations.
                </p>
              </div>
            </div>
            <div className="row pb-2">
              {IDEAL_CLIENTS.map((item) => (
                <div key={item} className="col-md-6 col-lg-4 mb-4">
                  <div className="card border-0 custom-box-shadow-1 h-100">
                    <div className="card-body p-4">
                      <p className="custom-text-size-1 mb-0">{item}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section bg-color-transparent border-0 mt-0 mb-0 pt-2 pb-4">
          <div className="container container-xl-custom">
            <div className="row justify-content-center">
              <div className="col-lg-10 text-center">
                <span className="d-block font-weight-bold custom-text-color-grey-1 line-height-1 mb-2">
                  FAQ
                </span>
                <h3 className="text-color-dark font-weight-bold text-7 line-height-2 mb-4">
                  Common Questions
                </h3>
              </div>
            </div>
            <div className="row justify-content-center">
              <div className="col-lg-10">
                <div className="accordion accordion-modern without-bg" id="aiFaqAccordion">
                  {FAQS.map((item, index) => (
                    <div className="card card-default" key={item.id}>
                      <div className="card-header">
                        <h4 className="card-title m-0">
                          <a
                            className="accordion-toggle px-4 pt-3"
                            data-bs-toggle="collapse"
                            data-bs-parent="#aiFaqAccordion"
                            href={`#${item.id}`}
                            aria-expanded={index === 0}
                          >
                            {item.question}
                          </a>
                        </h4>
                      </div>
                      <div id={item.id} className={`collapse ${index === 0 ? 'show' : ''}`}>
                        <div className="card-body px-4 pt-2 pb-4">
                          <p className="custom-text-size-1 mb-0">{item.answer}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <GetInTouchSection />
      </div>
      <Footer />
      <ScriptLoader />
    </div>
  );
}

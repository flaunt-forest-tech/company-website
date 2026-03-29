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
      'Upgrade your current website, app, and internal systems with practical AI features, automation, AI governance frameworks, and analytics.',
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
      'Design autonomous, multi-step systems that coordinate tools, execute tasks, and improve operational speed with governance-by-design.',
  },
  {
    title: 'Prompt Engineering & AI Strategy',
    description:
      'Develop high-performance prompts, fine-tune models for your domain, and build AI strategies aligned with your business goals and vertical industry needs.',
  },
  {
    title: 'Vertical Industry Expertise',
    description:
      'Leverage deep expertise in retail, manufacturing, services, and enterprise operations to deliver solutions tailored to your industrys unique challenges and opportunities.',
  },
];

const DELIVERY_MODEL = [
  {
    step: '01',
    title: 'Discovery & Opportunity Mapping',
    description:
      'We align business goals, technical constraints, and ROI targets to define your highest-impact roadmap.',
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

const OUTCOME_CASES = [
  {
    industry: 'Retail & Commerce',
    title: 'Inventory Optimization & Sales Forecasting',
    result:
      'Reduced inventory carrying costs by 31% and improved forecast accuracy to 94% with AI demand prediction model.',
    tech: 'Python, TensorFlow, AWS SageMaker',
  },
  {
    industry: 'Manufacturing',
    title: 'Predictive Maintenance System',
    result:
      'Reduced unplanned downtime by 45% and maintenance costs by 28% with real-time equipment monitoring and failure prediction.',
    tech: 'IoT, ML Pipelines, Apache Spark, AWS Lambda',
  },
  {
    industry: 'Financial Services',
    title: 'Regulatory Compliance Automation',
    result:
      'Cut compliance review time from 3 weeks to 2 days using AI-powered document analysis and risk classification.',
    tech: 'NLP, LLM Fine-tuning, Vector DB, GCP Vertex AI',
  },
  {
    industry: 'Enterprise Operations',
    title: 'Agentic Workflow Automation',
    result:
      'Automated 65% of invoice processing and expense approval workflows, reducing manual effort from 40 hours/week to 8 hours/week.',
    tech: 'Multi-Agent Systems, LangChain, Document AI, Cloud Run',
  },
  {
    industry: 'SaaS / Tech',
    title: 'AI-Powered Customer Support Platform',
    result:
      'Improved first-response time by 78% and customer satisfaction score by 23 points with AI copilot and agentic workflows.',
    tech: 'Next.js, TypeScript, OpenAI API, Embeddings, Pinecone',
  },
  {
    industry: 'Logistics & Supply Chain',
    title: 'Route Optimization & Demand Prediction',
    result:
      'Optimized delivery routes using AI models to reduce logistics costs and improve delivery time predictability across regional networks.',
    tech: 'Route Optimization APIs, ML Pipelines, AWS SageMaker, Python',
  },
];

const FULL_STACK_SCOPE = [
  'Frontend Engineering',
  'Backend APIs & Services',
  'Database Architecture',
  'DevOps & Cloud Delivery',
];

const TRUST_FOUNDATIONS = [
  'Security-by-Design delivery model',
  'RBAC and role-based access control',
  'AI governance frameworks and guardrails',
  'Audit logs and operational traceability',
  'Data governance for AI and analytics workflows',
  'Responsible AI practices and compliance',
];

const IDEAL_CLIENTS = [
  'Mid-size companies modernizing legacy systems with AI.',
  'Enterprises building new web and app products with full-stack teams.',
  'Growth-stage teams needing fast MVP delivery on AWS, GCP, Azure, or hybrid cloud.',
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
      'We apply security-by-design practices, access control, auditability, and data governance from day one of delivery.',
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
                  A Practical Delivery Model Built For Results
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
                  PROVEN OUTCOMES
                </span>
                <h3 className="text-color-dark font-weight-bold text-7 line-height-2 mb-4">
                  Results You Can Measure
                </h3>
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
                      <p className="custom-text-size-1 mb-3">{item.result}</p>
                      <hr className="my-3" />
                      <p className="custom-text-size-1 text-color-grey mb-0">
                        <strong>Tech Stack:</strong> {item.tech}
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
                  Built With Governance From Day One
                </h3>
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
                  IDEAL CLIENT FIT
                </span>
                <h3 className="text-color-dark font-weight-bold text-7 line-height-2 mb-4">
                  Teams We Help Most
                </h3>
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

        <section className="section bg-color-transparent border-0 mt-0 mb-0 pt-2 pb-4">
          <div className="container container-xl-custom">
            <div className="row justify-content-center">
              <div className="col-lg-10 text-center">
                <h3 className="text-color-dark font-weight-bold text-6 line-height-2 mb-3">
                  Ready To Build Your Next AI-Powered Product?
                </h3>
                <p className="custom-text-size-1 mb-4">
                  Tell us your goals and constraints. We will define a practical roadmap your team
                  can execute across product, engineering, and cloud.
                </p>
                <Link
                  href="/contact"
                  className="btn btn-secondary btn-outline text-color-dark font-weight-semibold border-width-4 custom-link-effect-1 text-1 text-xl-3 d-inline-flex align-items-center px-4 py-3"
                >
                  BOOK ARCHITECTURE CALL <i className="custom-arrow-icon ms-2"></i>
                </Link>
                <Link
                  href="/contact"
                  className="btn btn-light font-weight-semibold border-width-4 custom-link-effect-1 text-1 text-xl-3 d-inline-flex align-items-center px-4 py-3 ms-2 mt-2 mt-sm-0"
                >
                  GET DELIVERY PLAN <i className="custom-arrow-icon ms-2"></i>
                </Link>
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

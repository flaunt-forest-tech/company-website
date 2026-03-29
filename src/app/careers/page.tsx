import ScriptLoader from '@/components/script-loader';
import Footer from '@/components/shared/footer';
import Header from '@/components/shared/header';
import PageHeader, { PageHeaderProps } from '@/components/shared/page-header';
import React from 'react';
import Link from 'next/link';
import { JOBS } from '@/constants/job';

const CareersPage: React.FC = () => {
  const pageHeaderData: PageHeaderProps = {
    title: 'CAREERS',
    breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Careers' }],
  };
  return (
    <div className="body">
      <Header activePage="Careers" />
      <div role="main" className="main">
        <PageHeader {...pageHeaderData} />
        <CareersSection />
      </div>
      <Footer />
      <ScriptLoader />
    </div>
  );
};

function TeamCultureSection() {
  const cultureValues = [
    {
      title: 'Production-Grade Excellence',
      description:
        'We build AI systems in production, not sandboxes. You will work on real enterprise deployments solving actual business problems at scale.',
    },
    {
      title: 'Continuous Learning',
      description:
        'Stay at the forefront of AI and full-stack engineering. Access to industry conferences, certifications, and internal technical seminars on LLMs, prompt engineering, and agentic systems.',
    },
    {
      title: 'Vertical Industry Mastery',
      description:
        'Deep expertise in retail, manufacturing, financial services, and logistics. Work with domain experts to understand and solve industry-specific challenges.',
    },
    {
      title: 'Responsible AI by Default',
      description:
        'AI governance and ethical AI practices are not an afterthought. We architect responsible AI solutions with built-in guardrails and compliance.',
    },
    {
      title: 'Career Acceleration',
      description:
        'Engineer → Tech Lead → Architecture Partner pathway. Rapid growth for driven professionals. Lead delivery teams, mentor junior engineers, shape company direction.',
    },
    {
      title: 'Modern Tech Stack',
      description:
        'Work with cutting-edge tools: TypeScript, Next.js, Python, LLMs, Multi-Agent Systems, AWS/GCP/Azure, LangChain, RAG systems, and modern DevOps practices.',
    },
  ];

  return (
    <section className="section bg-color-transparent border-0 mt-0 mb-0 pt-0">
      <div className="container container-xl-custom">
        <div className="row justify-content-center mb-5">
          <div className="col-lg-10 text-center">
            <span className="d-block font-weight-bold custom-text-color-grey-1 line-height-1 mb-2">
              WHY JOIN FLAUNT FOREST TECH
            </span>
            <h3 className="text-color-dark font-weight-bold text-7 line-height-2 mb-0">
              Work on Problems That Matter, With People Who Care
            </h3>
          </div>
        </div>

        <div className="row row-gutter-sm pb-5">
          {cultureValues.map((value, idx) => (
            <div key={idx} className="col-md-6 col-lg-4 mb-4">
              <div className="card border-0 custom-box-shadow-1 h-100 p-4">
                <h4 className="font-weight-bold text-color-dark text-5 mb-3">{value.title}</h4>
                <p className="custom-text-size-1 text-color-grey mb-0">{value.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CareersSection() {
  return (
    <section
      className="section custom-section-full-width bg-color-transparent border-0 mt-0 mb-1"
      style={{
        backgroundImage: 'url(/img/backgrounds/dots-background-4.png)',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'top right',
      }}
    >
      <div className="container container-xl-custom pt-3 mt-4">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="overflow-hidden mb-2">
              <span className="d-block font-weight-bold custom-text-color-grey-1 text-center line-height-1 mb-0">
                BE PART OF OUR TEAM
              </span>
            </div>
            <div className="overflow-hidden mb-4">
              <h2 className="text-color-dark font-weight-bold text-center text-8 line-height-2 mb-0">
                Build The Future Of Digital And AI Solutions With Us
              </h2>
            </div>
            <p className="custom-text-size-1 text-center mb-5">
              We are hiring engineers, designers, and product builders who want to work on modern
              web platforms, AI agents, agentic workflows, and end-to-end enterprise AI delivery. If
              you are ready to solve real business problems and grow with a high-execution team,
              explore our open roles below.
            </p>
          </div>
        </div>

        <TeamCultureSection />

        <div className="row justify-content-center mt-3 pt-1">
          <div className="col-md-10 col-lg-9 col-xl-8">
            <div className="accordion accordion-modern without-bg" id="accordion11">
              {JOBS.map((job) => (
                <div className="card card-default" key={job.id}>
                  <div className="card-header">
                    <h4 className="card-title m-0">
                      <a
                        className="accordion-toggle px-4 pt-3"
                        data-bs-toggle="collapse"
                        data-bs-parent="#accordion11"
                        href={`#${job.id}`}
                        aria-expanded={job.open}
                      >
                        {job.title}
                      </a>
                    </h4>
                  </div>
                  <div id={job.id} className={`collapse ${job.open ? 'show' : ''}`}>
                    <div className="card-body px-4 pt-2 pb-5">
                      {job.content.map((text, i) => (
                        <p className="custom-text-size-1 mb-4" key={i}>
                          {text}
                        </p>
                      ))}
                      <ul className="list list-inline list-unstyled">
                        <li className="list-inline-item">
                          <strong className="text-color-dark">LOCATION:</strong> {job.location}
                        </li>
                        <li className="list-inline-item">
                          <strong className="text-color-dark">QUALIFICATION:</strong>{' '}
                          {job.qualification}
                        </li>
                      </ul>
                      <Link
                        href="/contact"
                        className="btn btn-secondary btn-outline text-color-dark font-weight-semibold border-width-4 custom-link-effect-1 text-1 text-xl-3 d-inline-flex align-items-center px-4 py-3"
                      >
                        APPLY NOW <i className="custom-arrow-icon ms-2"></i>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CareersPage;

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
    breadcrumbs: [{ label: 'home', href: '/' }, { label: 'careers' }],
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
                Joins Us In Your Greatest Professional Mission
              </h2>
            </div>
            <p className="custom-text-size-1 text-center mb-5">
              We are always on the lookout for passionate, skilled professionals who want to build
              impactful technology. If you&apos;re eager to contribute to meaningful projects and
              grow with a forward-thinking team, explore our open roles below.
            </p>
          </div>
        </div>

        <div className="row justify-content-center">
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
                        href="/demo-it-services-contact"
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

'use client';
import { SERVICES } from '@/constants/services';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SERVICE_USE_CASES: Record<string, string[]> = {
  'AI Solutions': [
    'Executive copilots for faster strategic planning and decision support.',
    'Predictive models for demand, churn, and revenue optimization.',
    'Customer-facing AI experiences that improve response speed and conversion.',
  ],
  'AI Agents & Agentic AI': [
    'Autonomous agents handling multi-step internal workflows end-to-end.',
    'Cross-tool orchestration for support, operations, and back-office execution.',
    'Decision automation with human-in-the-loop governance controls.',
  ],
  'Data & Analytics': [
    'Leadership dashboards with real-time KPIs and business health visibility.',
    'Unified pipelines that connect sales, operations, and customer data.',
    'Analytics foundations that prepare teams for AI-native execution.',
  ],
  'Cloud & Infrastructure': [
    'Cloud modernization for AI workloads and scalable digital products.',
    'Reliability engineering to reduce downtime and protect performance.',
    'Security and governance baselines for compliant growth at scale.',
  ],
  'Web3.0 Solutions': [
    'Blockchain-based workflows for transparent records and trusted transactions.',
    'Smart contract systems that automate validation and execution logic.',
    'Decentralized applications for new ecosystem and platform business models.',
  ],
};

export default function ServicesSection() {
  const pathname = usePathname();
  const mainService = SERVICES.find((s) => pathname.includes(s.link)) || SERVICES[0];

  return (
    <section
      className="section custom-section-full-width bg-color-transparent border-0 mt-0 mb-1"
      style={{
        backgroundImage: 'url(/img/backgrounds/dots-background-2.png)',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'bottom right',
      }}
    >
      <div className="container container-xl-custom pt-3 mt-4">
        <div className="row justify-content-center">
          <div className="col-md-7 mb-5 mb-md-0">
            <div className="overflow-hidden mb-2">
              <span className="d-block font-weight-bold custom-text-color-grey-1 line-height-1 mb-0">
                EXTEND YOUR BUSINESS
              </span>
            </div>
            <div className="overflow-hidden mb-4">
              <h2 className="text-color-dark font-weight-bold text-8 line-height-2 mb-0">
                {mainService.detailsTitle}
              </h2>
            </div>
            {mainService.detailsDescription?.map((desc, idx) => (
              <p
                key={idx}
                className={`custom-text-size-1 ${idx === 0 ? 'pt-3 pb-1 mb-4' : 'pb-2 mb-4'}`}
              >
                {desc}
              </p>
            ))}
          </div>
          <div className="col-md-4 offset-md-1 ps-md-5">
            {SERVICES.slice(5, 8).map((item, idx) => (
              <div key={idx}>
                <h4 className="custom-heading-bar font-weight-bold text-color-dark text-5 mb-2">
                  {item.title}
                </h4>
                <p className="custom-font-secondary text-4 pb-3 mb-4">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="row position-relative z-index-1 pb-4 my-4">
          <div className="col">
            <hr className="my-5" />
          </div>
        </div>

        <div className="row align-items-xl-center pb-md-5 my-md-5">
          <div className="col-lg-6 col-xl-4 position-relative px-xl-4 mx-auto mb-5 mb-lg-0 mt-lg-5">
            <Image
              src="/img/careers/puzzle-1.png"
              alt="Puzzle Background"
              width={500}
              height={500}
              className="img-fluid custom-position-center-x-y z-index-0"
            />
            <Image
              src="/img/about-us/generic-1.jpg"
              alt="Our Employer Culture"
              width={500}
              height={500}
              className="img-fluid position-relative z-index-1"
            />
          </div>
          <div className="col-lg-6">
            <p className="custom-text-size-1 pb-2 mb-4">
              Our team combines data strategy, automation engineering, and AI delivery expertise to
              turn business goals into measurable outcomes.
            </p>
            <p className="custom-text-size-1 pb-2 mb-4">
              We treat IT and cloud as the foundation, then build intelligent capabilities on top so
              your operations can scale with confidence.
            </p>
            <p className="custom-text-size-1 pb-3 mb-4">
              From Data & Analytics to AI-native workflows, we help you move faster, make smarter
              decisions, and unlock long-term growth opportunities.
            </p>
            <a
              href="/contact"
              className="btn btn-secondary btn-outline text-color-dark font-weight-semibold border-width-4 custom-link-effect-1 text-1 text-xl-3 d-inline-flex align-items-center px-4 py-3"
            >
              GET A QUOTE <i className="custom-arrow-icon ms-5" />
            </a>
          </div>
        </div>

        <div className="row my-5 pt-lg-4">
          <div className="col">
            <hr className="my-5" />
          </div>
        </div>

        <div className="row">
          <div className="col text-center">
            <div className="overflow-hidden mb-2">
              <span className="d-block font-weight-bold custom-text-color-grey-1 line-height-1 mb-0">
                BUSINESS USE CASES
              </span>
            </div>
            <div className="overflow-hidden mb-4">
              <h2 className="text-color-dark font-weight-bold text-8 line-height-2 mb-0">
                Where This Service Creates Value
              </h2>
            </div>
          </div>
        </div>
        <div className="row mb-5">
          {(SERVICE_USE_CASES[mainService.title] || SERVICE_USE_CASES['AI Solutions']).map(
            (item) => (
              <div key={item} className="col-md-6 col-lg-4 mb-4">
                <div className="card border-0 custom-box-shadow-1 h-100">
                  <div className="card-body p-4">
                    <p className="custom-text-size-1 mb-0">{item}</p>
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        <div className="row">
          <div className="col text-center">
            <div className="overflow-hidden mb-2">
              <span className="d-block font-weight-bold custom-text-color-grey-1 line-height-1 mb-0">
                OUR SERVICES
              </span>
            </div>
            <div className="overflow-hidden mb-4">
              <h2 className="text-color-dark font-weight-bold text-8 line-height-2 mb-0">
                More Services We Offer
              </h2>
            </div>
          </div>
        </div>
        <div className="row">
          {SERVICES.slice(0, 5).map((service, index) => (
            <div
              key={index}
              className={`col-12 col-sm-6 col-lg-4 mb-4 ${index % 2 !== 0 ? 'mt-lg-5' : ''}`}
            >
              <div className="card border-0 bg-color-transparent h-100">
                <div className="card-body text-center p-4 my-3">
                  <div className="custom-icon-wrapper mb-4">
                    <Image
                      src={`/img/icons/${service.icon}`}
                      width={100}
                      height={100}
                      alt={service.title}
                      className={`img-fluid svg-fill-color-${service.titleClass}`}
                    />
                  </div>
                  <h4 className={`text-color-${service.titleClass} font-weight-bold text-6 mb-3`}>
                    {service.title}
                  </h4>
                  <p className="custom-text-size-1 px-lg-4">{service.description}</p>
                  <Link
                    href={service.link}
                    className={`text-color-${service.linkClass} font-weight-bold custom-text-size-1`}
                  >
                    READ MORE +
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

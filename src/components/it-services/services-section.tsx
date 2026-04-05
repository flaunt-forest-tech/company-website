'use client';
import { SERVICES } from '@/constants/services';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SERVICE_USE_CASES: Record<string, string[]> = {
  'AI & Workflow Automation': [
    'Lead routing, follow-up, and admin automation that reduce repeated manual tasks.',
    'Internal notifications, summaries, and workflow handoffs that keep work moving.',
    'AI assistance for search, classification, support, or information processing where it adds clear value.',
  ],
  'Custom Software & Internal Tools': [
    'Dashboards for operations, requests, bookings, or service delivery.',
    'Internal tools that replace spreadsheets and patchwork workflows.',
    'Custom business logic for approvals, tracking, staff workflows, or client management.',
  ],
  'Websites & Client Portals': [
    'Conversion-focused websites with clearer messaging and stronger calls to action.',
    'Client portals and web apps for requests, updates, forms, or account access.',
    'Service platforms that make it easier for people to interact with you online.',
  ],
  'Backend Systems & Integrations': [
    'APIs and integrations that connect forms, CRMs, databases, payments, or internal tools.',
    'Backend logic for automation, reporting, portals, and business workflows.',
    'Data handling and system structure that make your setup more reliable and easier to extend.',
  ],
  'Cloud Deployment & Support': [
    'Hosting, deployment, and environment setup for websites, apps, and automation systems.',
    'Performance fixes, reliability improvements, and ongoing technical support.',
    'A cleaner cloud setup that is easier to maintain as your needs change.',
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
                SERVICE OVERVIEW
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
              alt="Project planning and delivery"
              width={500}
              height={500}
              className="img-fluid position-relative z-index-1"
            />
          </div>
          <div className="col-lg-6">
            <p className="custom-text-size-1 pb-2 mb-4">
              We combine planning, build, and deployment so you get a clear path from problem to a
              working solution.
            </p>
            <p className="custom-text-size-1 pb-2 mb-4">
              Some clients need a focused website or portal. Others need backend work, automation,
              internal tools, or technical cleanup. We shape the work around the actual need.
            </p>
            <p className="custom-text-size-1 pb-3 mb-4">
              The aim is dependable delivery, useful systems, and better day-to-day operations, not
              vague promises or unnecessary complexity.
            </p>
            <a
              href="/contact"
              className="btn btn-secondary btn-outline text-color-dark font-weight-semibold border-width-4 custom-link-effect-1 text-1 text-xl-3 d-inline-flex align-items-center px-4 py-3"
            >
              TALK THROUGH YOUR PROJECT <i className="custom-arrow-icon ms-5" />
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
                Where this service fits best
              </h2>
            </div>
          </div>
        </div>
        <div className="row mb-5">
          {(
            SERVICE_USE_CASES[mainService.title] || SERVICE_USE_CASES['AI & Workflow Automation']
          ).map((item) => (
            <div key={item} className="col-md-6 col-lg-4 mb-4">
              <div className="card border-0 custom-box-shadow-1 h-100">
                <div className="card-body p-4">
                  <p className="custom-text-size-1 mb-0">{item}</p>
                </div>
              </div>
            </div>
          ))}
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
                More ways we can help
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
                      className="img-fluid"
                    />
                  </div>
                  <h4 className={`${service.titleClass} font-weight-bold text-6 mb-3`}>
                    {service.title}
                  </h4>
                  <p className="custom-text-size-1 px-lg-4">{service.description}</p>
                  <Link
                    href={service.link}
                    className={`${service.linkClass} font-weight-bold custom-text-size-1`}
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

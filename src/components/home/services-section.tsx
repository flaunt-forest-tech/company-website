import React from 'react';
import Image from 'next/image';
import { SERVICES } from '@/constants/services';
import Link from 'next/link';

const BUSINESS_PROBLEMS = [
  {
    stage: '01',
    title: 'Too much manual work',
    description:
      'Repeated admin, follow-ups, and handoffs slow down day-to-day operations and waste time.',
  },
  {
    stage: '02',
    title: 'Tools that do not connect',
    description:
      'Your process is spread across email, spreadsheets, forms, and apps with no clear flow between them.',
  },
  {
    stage: '03',
    title: 'Need the right system',
    description:
      'Off-the-shelf software no longer fits, and you need a website, portal, automation, or internal tool built around your workflow.',
  },
];

const HOW_WE_WORK = [
  {
    title: 'Understand the workflow',
    description: 'We start with the real process, the bottlenecks, and what needs to improve.',
  },
  {
    title: 'Define the right scope',
    description:
      'We recommend a practical next step based on the actual need, not a bloated solution.',
  },
  {
    title: 'Build and refine',
    description:
      'We develop the system with a focus on clarity, usability, and dependable delivery.',
  },
  {
    title: 'Launch and support',
    description: 'Once live, we help improve, extend, or support the system as needed.',
  },
];

const WHY_CHOOSE_US = [
  {
    title: 'Practical recommendations',
    description:
      'We focus on useful next steps, not vague consulting language or inflated promises.',
  },
  {
    title: 'Hands-on execution',
    description: 'The work does not stop at ideas. We help plan, build, launch, and improve.',
  },
  {
    title: 'Built around your workflow',
    description: 'The solution should fit the way you work instead of forcing more workarounds.',
  },
  {
    title: 'Clear communication',
    description:
      'You get straightforward discussion, sensible scope, and a practical delivery path.',
  },
  {
    title: 'Flexible for different clients',
    description:
      'We work with businesses, teams, and individual clients with clearly defined technical needs.',
  },
];

const ServicesSection = () => {
  return (
    <section
      id="services"
      className="section custom-section-full-width bg-color-transparent border-0 mt-0 mb-1"
      style={{
        backgroundImage: "url('/img/backgrounds/dots-background-2.png')",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'bottom right',
      }}
    >
      <div className="container container-xl-custom ">
        <div className="row">
          <div className="col text-center">
            <div className="overflow-hidden mb-2">
              <span className="d-block font-weight-bold custom-text-color-grey-1 line-height-1 mb-0">
                BUSINESS PROBLEMS WE SOLVE
              </span>
            </div>
            <div className="overflow-hidden mb-4">
              <h2 className="text-color-dark font-weight-bold text-8 line-height-2 mb-0">
                Fix the bottlenecks behind day-to-day work
              </h2>
            </div>
            <p className="custom-text-size-1 text-center mb-4">
              We help businesses, teams, and individual clients simplify messy processes and build
              systems that are easier to use and manage.
            </p>
          </div>
        </div>

        <div className="row justify-content-center pb-4">
          {BUSINESS_PROBLEMS.map((item) => (
            <div key={item.stage} className="col-md-6 col-lg-4 mb-4">
              <div className="card border-0 custom-box-shadow-1 h-100">
                <div className="card-body p-4">
                  <span className="text-color-primary font-weight-bold text-6 d-block mb-2">
                    {item.stage}
                  </span>
                  <h4 className="font-weight-bold text-5 mb-3">{item.title}</h4>
                  <p className="custom-text-size-1 mb-0">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="row pt-2 pb-3">
          <div className="col text-center">
            <div className="overflow-hidden mb-2">
              <span className="d-block font-weight-bold custom-text-color-grey-1 line-height-1 mb-0">
                HOW WE WORK
              </span>
            </div>
            <div className="overflow-hidden mb-3">
              <h3 className="text-color-dark font-weight-bold text-7 line-height-2 mb-0">
                A clear path from problem to working solution
              </h3>
            </div>
            <p className="custom-text-size-1 mb-0">
              We keep the process straightforward so you can see what is being built and why it
              matters.
            </p>
          </div>
        </div>

        <div className="row pb-4">
          {HOW_WE_WORK.map((item) => (
            <div key={item.title} className="col-md-6 col-lg-3 mb-4">
              <div className="card border-0 custom-box-shadow-1 h-100">
                <div className="card-body p-4">
                  <h4 className="font-weight-bold text-5 mb-3">{item.title}</h4>
                  <p className="custom-text-size-1 mb-0">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="row pt-2 pb-3">
          <div className="col text-center">
            <div className="overflow-hidden mb-2">
              <span className="d-block font-weight-bold custom-text-color-grey-1 line-height-1 mb-0">
                WHY CHOOSE US
              </span>
            </div>
            <div className="overflow-hidden mb-3">
              <h3 className="text-color-dark font-weight-bold text-7 line-height-2 mb-0">
                Professional, direct, and hands-on
              </h3>
            </div>
          </div>
        </div>

        <div className="row pb-2">
          {WHY_CHOOSE_US.map((item) => (
            <div key={item.title} className="col-md-6 col-lg-4 mb-4">
              <div className="card border-0 custom-box-shadow-1 h-100">
                <div className="card-body p-4">
                  <h4 className="font-weight-bold text-5 mb-3">{item.title}</h4>
                  <p className="custom-text-size-1 mb-0">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="row py-3">
          <div className="col text-center">
            <p className="custom-text-size-1 mb-3">
              Need to talk through a website, system, automation idea, or technical problem?
            </p>
            <Link
              href="/contact"
              className="btn btn-secondary btn-outline text-color-dark font-weight-semibold border-width-4 custom-link-effect-1 text-1 text-xl-3 d-inline-flex align-items-center px-4 py-3 me-2 mb-2"
            >
              START A CONVERSATION <i className="custom-arrow-icon ms-2"></i>
            </Link>
            <Link
              href="/it-services"
              className="btn btn-light font-weight-semibold border-width-4 custom-link-effect-1 text-1 text-xl-3 d-inline-flex align-items-center px-4 py-3 mb-2"
            >
              VIEW FULL SERVICES <i className="custom-arrow-icon ms-2"></i>
            </Link>
          </div>
        </div>

        <div className="row pt-4">
          <div className="col text-center mb-4">
            <span className="d-block font-weight-bold custom-text-color-grey-1 line-height-1 mb-2">
              OUR SERVICES
            </span>
            <h3 className="text-color-dark font-weight-bold text-7 line-height-2 mb-0">
              Core services we provide
            </h3>
          </div>
          {SERVICES.slice(0, 5).map((service, index) => (
            <div
              key={service.title}
              className={`col-md-6 col-lg-4 text-center mb-5 ${index % 2 !== 0 ? 'mt-lg-5' : ''}`}
            >
              <Image
                src={`/img/icons/${service.icon}`}
                width={100}
                height={100}
                alt={service.title}
                className="img-fluid pb-2 mb-4"
              />
              <h4 className={`font-weight-bold text-6 mb-3 ${service.titleClass}`}>
                {service.title}
              </h4>
              <p className="custom-text-size-1 px-lg-4">{service.description}</p>
              <Link
                className={`${service.linkClass} font-weight-bold custom-text-size-1`}
                href={service.link}
              >
                LEARN MORE +
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;

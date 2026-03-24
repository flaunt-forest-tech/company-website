import React from 'react';
import Image from 'next/image';
import { SERVICES } from '@/constants/services';
import Link from 'next/link';

const TRANSFORMATION_PATH = [
  {
    stage: '01',
    title: 'Data Foundation',
    description:
      'Unify data, define KPIs, and build visibility so leadership can make faster, evidence-based decisions.',
  },
  {
    stage: '02',
    title: 'Intelligent Automation',
    description:
      'Redesign critical workflows with automation and agentic logic to reduce manual effort and increase execution speed.',
  },
  {
    stage: '03',
    title: 'AI Scale-Up',
    description:
      'Deploy AI across high-value use cases to drive measurable growth, productivity, and long-term competitive advantage.',
  },
];

const WHY_CHOOSE_US = [
  {
    title: 'Business-First AI Delivery',
    description:
      'We start from outcomes, not hype. Every solution is tied to cost, speed, or growth impact.',
  },
  {
    title: 'Data-To-AI Execution Model',
    description:
      'We build a strong analytics layer first, then scale automation and AI on top of it.',
  },
  {
    title: 'Agentic Systems Expertise',
    description:
      'From workflow orchestration to decision support, we design autonomous systems that work in production.',
  },
  {
    title: 'Future-Ready Technology Stack',
    description:
      'Cloud-native architecture, secure data pipelines, and Web3.0 capabilities for long-term innovation.',
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
          <div className="col">
            <div className="overflow-hidden mb-2">
              <span className="d-block font-weight-bold custom-text-color-grey-1 text-center line-height-1 mb-0">
                OUR SERVICES
              </span>
            </div>
            <div className="overflow-hidden mb-5">
              <h2 className="text-color-dark font-weight-bold text-center text-8 line-height-2 mb-0">
                AI-First Services Built for Business Outcomes
              </h2>
            </div>
            <p className="custom-text-size-1 text-center mb-4">
              A practical transformation path: start with data, automate with intelligence, then
              scale AI across the business.
            </p>
          </div>
        </div>

        <div className="row justify-content-center pb-2">
          {TRANSFORMATION_PATH.map((item) => (
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
                WHY CLIENTS CHOOSE US
              </span>
            </div>
            <div className="overflow-hidden mb-4">
              <h3 className="text-color-dark font-weight-bold text-7 line-height-2 mb-0">
                Built For Companies That Want To Move First
              </h3>
            </div>
          </div>
        </div>

        <div className="row pb-2">
          {WHY_CHOOSE_US.map((item) => (
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

        <div className="row pt-4">
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
                READ MORE +
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;

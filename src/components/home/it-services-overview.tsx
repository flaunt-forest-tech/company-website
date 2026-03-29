import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
const ITServicesOverview: React.FC = () => {
  return (
    <section
      className="section section-height-4 custom-section-full-width custom-section-pull-top-1 bg-color-transparent border-0 position-relative z-index-1 pb-0 pb-xl-5 mb-0"
      style={{
        backgroundImage: 'url(/img/backgrounds/dots-background-1.png)',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'top left',
      }}
    >
      <div className="container container-xl-custom mt-2 mb-xl-5">
        <div className="row">
          <div className="col-xl-7 pb-5 pb-xl-0 mb-5 mb-xl-0">
            <div className="custom-overlapping-cards">
              <div
                className="card border-0 box-shadow-1 ps-2 appear-animation"
                data-appear-animation="fadeInUpShorter"
                data-appear-animation-delay="300"
              >
                <Image
                  src="/img/generic-1.jpg"
                  className="card-img-top rounded-0 img-fluid"
                  alt="AI Strategy"
                  width={600}
                  height={400}
                  style={{ width: '100%', height: 'auto' }}
                  priority
                />
                <div className="card-body pt-4">
                  <h4 className="custom-heading-bar font-weight-bold text-color-dark text-5">
                    AI STRATEGY
                  </h4>
                  <p className="custom-font-secondary text-4 mb-3">
                    We align AI with your business model to target practical gains: faster
                    execution, lower operating cost, and better operational visibility.
                  </p>
                </div>
              </div>
              <div className="card-transform">
                <div
                  className="card border-0 box-shadow-1 pe-2 appear-animation"
                  data-appear-animation="fadeInUpShorter"
                  data-appear-animation-delay="500"
                >
                  <Image
                    src="/img/generic-2.jpg"
                    className="card-img-top rounded-0 img-fluid"
                    alt="Agentic AI Systems"
                    width={600}
                    height={400}
                    style={{ width: '100%', height: 'auto' }}
                    priority
                  />
                  <div className="card-body pt-4">
                    <h4 className="custom-heading-bar custom-heading-bar-right font-weight-bold text-color-dark text-end text-5">
                      AGENTIC AI SYSTEMS
                    </h4>
                    <p className="text-end custom-font-secondary text-4 ps-4 ms-3 mb-3">
                      We build agentic AI systems that automate workflows, support decision-making,
                      and keep critical operations moving without bottlenecks.
                    </p>
                  </div>
                </div>
              </div>
              <Image
                src="/img/puzzle-and-dots.png"
                className="custom-overlapping-cards-puzzle-background"
                alt="Puzzle and Dots background image"
                width={400}
                height={400}
                style={{ width: 'auto', height: 'auto' }}
                priority
              />
            </div>
          </div>
          <div className="col-xl-5">
            <span
              className="d-block custom-text-color-grey-1 font-weight-bold mb-1 appear-animation"
              data-appear-animation="fadeInUpShorter"
              data-appear-animation-delay="700"
            >
              WHO WE ARE
            </span>
            <h2
              className="text-color-dark font-weight-bold text-8 line-height-2 negative-ls-1 pb-3 mb-4 appear-animation"
              data-appear-animation="fadeInUpShorter"
              data-appear-animation-delay="900"
            >
              We help teams turn operations into AI-enabled systems
            </h2>
            <p
              className="custom-text-size-1 pb-3 mb-4 appear-animation"
              data-appear-animation="fadeInUpShorter"
              data-appear-animation-delay="1100"
            >
              Founded in 2025 and headquartered in Houston, Texas, we help companies modernize
              existing systems with agentic AI, intelligent automation, and cloud delivery. Our
              approach is pragmatic, hands-on, and built to improve execution without adding
              unnecessary complexity.
            </p>
            <Link
              href="/about-us"
              className="d-flex align-items-center custom-link-effect-1 text-color-primary font-weight-bold text-decoration-none text-4 appear-animation"
              data-appear-animation="fadeInUpShorter"
              data-appear-animation-delay="1300"
            >
              Learn How We Work <i className="custom-arrow-icon ms-2"></i>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ITServicesOverview;

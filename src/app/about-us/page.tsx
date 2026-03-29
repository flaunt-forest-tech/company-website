'use client';
import Footer from '@/components/shared/footer';
import GetInTouchSection from '@/components/shared/get-in-touch-section';
import Header from '@/components/shared/header';
import ScriptLoader from '@/components/script-loader';
import Image from 'next/image';
import PageHeader, { PageHeaderProps } from '@/components/shared/page-header';
import Link from 'next/link';

export default function AboutUSPage() {
  const pageHeaderData: PageHeaderProps = {
    title: 'ABOUT US',
    breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'About Us' }],
  };
  return (
    <div className="body">
      <Header activePage="AboutUs" />
      <div role="main" className="main">
        <PageHeader {...pageHeaderData} />
        <WhoWeAreSection />
        <div className="container container-xl-custom pb-3 mb-4 mt-4">
          <div className="row">
            <div className="col">
              <hr className="my-5" />
            </div>
          </div>
        </div>
        <IndustryUseCasesSection />
        <OurMission />
        <GetInTouchSection />
      </div>
      <Footer />
      <ScriptLoader />
    </div>
  );
}

function WhoWeAreSection() {
  return (
    <section
      className="section section-height-3 bg-color-transparent border-0 pb-0 m-0"
      style={{
        backgroundImage: 'url(/img/backgrounds/dots-background-3.png)',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: '112% 100%',
      }}
    >
      <div className="container container-xl-custom mt-4">
        <div className="row justify-content-center justify-content-lg-start">
          <div className="col-lg-7 col-xl-5 mb-5 mb-lg-0">
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
              We build practical AI systems for real operations
            </h2>

            <p
              className="custom-text-size-1 pb-2 mb-4 appear-animation"
              data-appear-animation="fadeInUpShorter"
              data-appear-animation-delay="1100"
            >
              Founded in 2025 and headquartered in Houston, Texas, Flaunt Forest Tech was built to
              help growing companies, private businesses, and selected larger teams adopt AI without
              the usual consulting overhead. We focus on agentic AI, intelligent automation, and
              cloud integration where the work has to connect with real systems, real users, and
              real operational constraints.
            </p>

            <p
              className="custom-text-size-1 mb-0 appear-animation"
              data-appear-animation="fadeInUpShorter"
              data-appear-animation-delay="1300"
              data-plugin-options='{"accY": 200}'
            >
              Our model is hands-on and delivery-led. We work across strategy, product, engineering,
              data, and cloud so clients can move from idea to working implementation with one
              accountable team. As a young company, we stay close to the latest tools while applying
              governance, security, and responsible AI practices from day one. With deep experience
              in AI implementation and cloud systems, we help businesses in Houston and beyond
              modernize operations responsibly.
            </p>
          </div>

          <div className="col-md-10 col-lg-5 ms-xl-auto">
            <Image
              src="/img/about-us/generic1.jpg"
              alt="Our Company"
              width={600}
              height={400}
              className="img-fluid position-relative z-index-1 appear-animation"
              data-appear-animation="fadeInRightShorter"
              data-appear-animation-delay="1500"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function IndustryUseCasesSection() {
  const useCases = [
    {
      title: 'Retail & Commerce Intelligence',
      points: [
        'Integrate sales, inventory, and commerce channels into one decision layer.',
        'Build dashboards for product performance, margin trends, and demand shifts.',
        'Deploy AI models for forecasting, replenishment, and promotional optimization.',
      ],
    },
    {
      title: 'Manufacturing & Operations Systems',
      points: [
        'Provide dedicated support teams for mission-critical business systems.',
        'Stabilize operations while modernizing legacy workflows with automation.',
        'Connect production, supply chain, and finance data for faster decision cycles.',
      ],
    },
    {
      title: 'Service Businesses & AI-Enabled Apps',
      points: [
        'Build web and mobile apps with embedded AI copilots and workflow assistants.',
        'Automate customer support and internal operations with agentic AI flows.',
        'Use unified data pipelines to improve service quality and growth planning.',
      ],
    },
  ];

  return (
    <section className="section bg-color-transparent border-0 py-0 mt-0 mb-3">
      <div className="container container-xl-custom">
        <div className="row">
          <div className="col text-center">
            <span className="d-block font-weight-bold custom-text-color-grey-1 line-height-1 mb-2">
              INDUSTRY USE CASES
            </span>
            <h2 className="text-color-dark font-weight-bold text-8 line-height-2 mb-4">
              How We Apply Digital + AI In The Real World
            </h2>
          </div>
        </div>

        <div className="row">
          {useCases.map((item) => (
            <div key={item.title} className="col-md-6 col-lg-4 mb-4">
              <div className="card border-0 custom-box-shadow-1 h-100 p-2">
                <div className="card-body">
                  <h4 className="font-weight-bold text-color-dark text-5 mb-3">{item.title}</h4>
                  <ul className="custom-text-size-1 ps-3 mb-0">
                    {item.points.map((point) => (
                      <li key={point} className="pb-2">
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function OurMission() {
  return (
    <div className="container container-xl-custom py-4 my-5">
      <div className="row row-gutter-sm justify-content-center my-3">
        <div className="col-md-6 col-lg-4 mb-4 mb-lg-0">
          <div
            className="card border-0 custom-box-shadow-1 h-100 p-1 appear-animation"
            data-appear-animation="fadeInUpShorter"
            data-appear-animation-delay="200"
          >
            <div className="card-body">
              <Image
                src={'/img/about-us/our-mission.jpg'}
                alt="Our Mission"
                className="img-fluid pb-2 mb-4"
                sizes="(max-width: 768px) 100vw, 33vw"
                width={600} // replace with actual image width
                height={400} // replace with actual image height
              />
              <h4 className="font-weight-bold text-color-dark text-6 pb-1 mb-4">OUR MISSION</h4>
              <p className="custom-font-secondary custom-text-size-2 line-height-4 pb-2 mb-4">
                Our mission is to modernize real businesses by combining strong IT delivery with
                practical AI execution, governance, and industry-informed implementation.
              </p>
              <ul className="custom-text-size-1 ps-3 mb-0">
                <li className="pb-2">
                  Upgrade websites and apps with AI-powered capabilities and responsible governance
                </li>
                <li className="pb-2">
                  Support business-critical software operations with practical industry context
                </li>
                <li className="pb-2">
                  Engineer high-performance prompts and AI solutions for your domain
                </li>
                <li>Turn operational data into intelligent decisions and growth</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-4 mb-4 mb-lg-0">
          <div
            className="card border-0 custom-box-shadow-1 h-100 p-1 appear-animation"
            data-appear-animation="fadeInUpShorter"
            data-appear-animation-delay="400"
          >
            <div className="card-body">
              <Image
                src={'/img/about-us/generic-3.jpg'}
                alt="Our Vision"
                className="img-fluid pb-2 mb-4"
                sizes="(max-width: 768px) 100vw, 33vw"
                width={600} // replace with actual image width
                height={400} // replace with actual image height
              />
              <h4 className="font-weight-bold text-color-dark text-6 pb-1 mb-4">OUR VISION</h4>
              <p className="custom-font-secondary custom-text-size-2 line-height-4 pb-2 mb-4">
                To become a reliable AI-first transformation partner for ambitious companies and
                teams, turning data into intelligence with responsible AI governance and practical
                delivery expertise.
              </p>
              <p className="custom-text-size-1 pb-2 mb-4">
                We envision a future where data systems, automation, prompt-engineered AI, and
                responsible governance are deeply integrated into daily operations, helping teams
                decide faster and execute with precision across vertical industries.
              </p>
              <p className="custom-text-size-1 mb-0">
                Our focus is to help businesses move from traditional systems to AI-native
                operations with sustainable, high-impact innovation grounded in strong delivery
                fundamentals and industry context.
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-4">
          <div
            className="card border-0 custom-box-shadow-1 h-100 p-1 appear-animation"
            data-appear-animation="fadeInUpShorter"
            data-appear-animation-delay="600"
          >
            <div className="card-body">
              <Image
                src={'/img/about-us/generic-4.jpg'}
                alt="Careers"
                className="img-fluid pb-2 mb-4"
                sizes="(max-width: 768px) 100vw, 33vw"
                width={600} // replace with actual image width
                height={400} // replace with actual image height
              />
              <h4 className="font-weight-bold text-color-dark text-6 pb-1 mb-4">OUR CAREERS</h4>
              <p className="custom-font-secondary custom-text-size-2 line-height-4 pb-2 mb-4">
                Join our team to build the future of AI-first business transformation through prompt
                engineering, AI governance, and hands-on delivery across real business use cases.
              </p>
              <p className="custom-text-size-1 pb-2 mb-4">
                We seek passionate engineers, AI specialists, and data architects who can architect
                responsible AI solutions, craft powerful prompts, and turn business requirements
                into practical systems.
              </p>
              <Link
                href="/careers"
                className="d-flex align-items-center custom-link-effect-1 text-color-primary font-weight-bold text-decoration-none text-4"
              >
                See All Positions <i className="custom-arrow-icon ms-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

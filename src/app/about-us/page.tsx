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
              We build practical systems that make work easier
            </h2>

            <p
              className="custom-text-size-1 pb-2 mb-4 appear-animation"
              data-appear-animation="fadeInUpShorter"
              data-appear-animation-delay="1100"
            >
              Flaunt Forest Tech helps small and midsize businesses, growing teams, and individual
              clients improve the way work gets done. We build practical solutions across
              automation, AI, websites, custom software, backend systems, and cloud deployment.
            </p>

            <p
              className="custom-text-size-1 mb-0 appear-animation"
              data-appear-animation="fadeInUpShorter"
              data-appear-animation-delay="1300"
              data-plugin-options='{"accY": 200}'
            >
              Our approach is clear and hands-on. We focus on understanding the workflow, choosing
              the right scope, and delivering something useful rather than overcomplicating the
              project. The goal is simple: build tools and systems that are reliable, professional,
              and worth using.
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
      title: 'Small & Midsize Businesses',
      points: [
        'Replace manual tasks, spreadsheets, and disconnected tools with a clearer system.',
        'Improve operations with automation, internal tools, and better reporting.',
        'Launch websites and portals that support growth and enquiries professionally.',
      ],
    },
    {
      title: 'Service Providers & Growing Teams',
      points: [
        'Build better client workflows, intake processes, and service dashboards.',
        'Connect websites, forms, backend tools, and follow-up processes more cleanly.',
        'Reduce friction in daily operations with practical automation and backend support.',
      ],
    },
    {
      title: 'Founders & Individual Clients',
      points: [
        'Launch or improve a website, portal, or digital service with direct technical support.',
        'Turn an idea or workflow problem into a clearer project with sensible scope.',
        'Get hands-on help without the overhead of a large consulting-style engagement.',
      ],
    },
  ];

  return (
    <section className="section bg-color-transparent border-0 py-0 mt-0 mb-3">
      <div className="container container-xl-custom">
        <div className="row">
          <div className="col text-center">
            <span className="d-block font-weight-bold custom-text-color-grey-1 line-height-1 mb-2">
              WHO WE HELP
            </span>
            <h2 className="text-color-dark font-weight-bold text-8 line-height-2 mb-4">
              Where we are a strong fit
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
                alt="How we work"
                className="img-fluid pb-2 mb-4"
                sizes="(max-width: 768px) 100vw, 33vw"
                width={600}
                height={400}
              />
              <h4 className="font-weight-bold text-color-dark text-6 pb-1 mb-4">HOW WE WORK</h4>
              <p className="custom-font-secondary custom-text-size-2 line-height-4 pb-2 mb-4">
                We keep the process straightforward: understand the problem, define the right scope,
                and build something useful.
              </p>
              <ul className="custom-text-size-1 ps-3 mb-0">
                <li className="pb-2">Start with the real workflow and pain points</li>
                <li className="pb-2">Recommend a sensible technical next step</li>
                <li className="pb-2">Build with clarity, usability, and reliability in mind</li>
                <li>Support and improve the system after launch if needed</li>
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
                alt="Why clients choose us"
                className="img-fluid pb-2 mb-4"
                sizes="(max-width: 768px) 100vw, 33vw"
                width={600}
                height={400}
              />
              <h4 className="font-weight-bold text-color-dark text-6 pb-1 mb-4">
                WHY CLIENTS CHOOSE US
              </h4>
              <p className="custom-font-secondary custom-text-size-2 line-height-4 pb-2 mb-4">
                Clients come to us when they need direct communication, hands-on delivery, and
                modern technical capability without inflated promises.
              </p>
              <p className="custom-text-size-1 pb-2 mb-4">
                We aim to make the project feel clearer, not more complicated. That means practical
                advice, sensible scoping, and work that stays tied to the real problem.
              </p>
              <p className="custom-text-size-1 mb-0">
                Whether the need is a website refresh, a workflow improvement, or a more advanced
                software build, the focus stays on useful execution.
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
                alt="What we build"
                className="img-fluid pb-2 mb-4"
                sizes="(max-width: 768px) 100vw, 33vw"
                width={600}
                height={400}
              />
              <h4 className="font-weight-bold text-color-dark text-6 pb-1 mb-4">WHAT WE BUILD</h4>
              <p className="custom-font-secondary custom-text-size-2 line-height-4 pb-2 mb-4">
                We work across automation, custom software, websites, portals, backend systems, and
                cloud deployment.
              </p>
              <p className="custom-text-size-1 pb-2 mb-4">
                Some projects start small and focused. Others grow into ongoing improvements and
                support. Either way, the goal is the same: a better system behind the work.
              </p>
              <Link
                href="/it-services"
                className="d-flex align-items-center custom-link-effect-1 text-color-primary font-weight-bold text-decoration-none text-4"
              >
                View Services <i className="custom-arrow-icon ms-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

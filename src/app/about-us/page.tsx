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
        {/* leaves it for now and we can uncomment after we actual get the client
        <OurClients />
        <CountersSection /> */}
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
              We are a full-stack digital and AI solution partner
            </h2>

            <p
              className="custom-text-size-1 pb-2 mb-4 appear-animation"
              data-appear-animation="fadeInUpShorter"
              data-appear-animation-delay="1100"
            >
              We are an AI-first partner built on strong IT execution. We do not just replace your
              existing systems; we upgrade them while building new digital products where needed.
            </p>

            <p
              className="custom-text-size-1 mb-0 appear-animation"
              data-appear-animation="fadeInUpShorter"
              data-appear-animation-delay="1300"
              data-plugin-options='{"accY": 200}'
            >
              From new website and app development to AI-enhanced product upgrades, from enterprise
              software support across complex environments to cross-platform data integration, AI
              agents, and agentic automation, we help businesses move from traditional operations to
              intelligent execution.
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
      title: 'Manufacturing & Enterprise Operations',
      points: [
        'Provide dedicated support teams for mission-critical enterprise systems.',
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

// function OurClients() {
//   const logos = [
//     { src: '/img/about-us/clients/logo-8.png', delay: 500 },
//     { src: '/img/about-us/clients/logo-9.png', delay: 1000, style: { maxWidth: '200px' } },
//     { src: '/img/about-us/clients/logo-10.png', delay: 900 },
//     { src: '/img/about-us/clients/logo-11.png', delay: 600, style: { maxWidth: '220px' } },
//     { src: '/img/about-us/clients/logo-12.png', delay: 1200 },
//     { src: '/img/about-us/clients/logo-13.png', delay: 500, style: { maxWidth: '200px' } },
//     { src: '/img/about-us/clients/logo-14.png', delay: 800, style: { maxWidth: '220px' } },
//     { src: '/img/about-us/clients/logo-15.png', delay: 1100, style: { maxWidth: '180px' } },
//   ];

//   return (
//     <div className="container container-xl-custom">
//       <div className="row">
//         <div className="col">
//           <div className="overflow-hidden mb-2">
//             <span
//               className="d-block font-weight-bold custom-text-color-grey-1 text-center line-height-1 mb-0 appear-animation"
//               data-appear-animation="maskUp"
//               data-appear-animation-delay="200"
//             >
//               WHO ARE WITH US
//             </span>
//           </div>
//           <div className="overflow-hidden mb-5">
//             <h2
//               className="text-color-dark font-weight-bold text-center text-8 line-height-2 mb-0 appear-animation"
//               data-appear-animation="maskUp"
//               data-appear-animation-delay="400"
//             >
//               Our Amazing Clients
//             </h2>
//           </div>
//         </div>
//       </div>

//       <div className="row align-items-center justify-content-center pb-4 mb-5">
//         {logos.map(({ src, delay, style }, index) => (
//           <div
//             key={index}
//             className={`col-md-4 col-xl-3 text-center mb-5 ${index >= 4 ? 'mb-xl-0' : ''} appear-animation`}
//             data-appear-animation="expandIn"
//             data-appear-animation-delay={delay}
//           >
//             <Image
//               src={src}
//               alt={`Client logo ${index + 1}`}
//               className="img-fluid"
//               style={style}
//               width={200} // required
//               height={100} // required
//               sizes="(max-width: 768px) 100vw, 200px"
//             />
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// function CountersSection() {
//   return (
//     <section className="section section-height-3 bg-color-dark custom-box-shadow-1 border-0 m-0">
//       <div className="container container-xl-custom">
//         <div className="counters row justify-content-center align-items-center">
//           <div className="col-sm-6 col-lg-3 mb-5 mb-lg-0">
//             <div className="counter">
//               <strong
//                 className="text-color-light font-weight-bold text-13 mb-2"
//                 data-to="35"
//                 data-append="+"
//               >
//                 0
//               </strong>
//               <label className="custom-font-secondary text-color-light text-5">Business Year</label>
//             </div>
//           </div>
//           <div className="col-sm-6 col-lg-3 mb-5 mb-lg-0">
//             <div className="counter">
//               <strong
//                 className="text-color-light font-weight-bold text-13 mb-2"
//                 data-to="240"
//                 data-append="+"
//               >
//                 0
//               </strong>
//               <label className="custom-font-secondary text-color-light text-5">Clients</label>
//             </div>
//           </div>
//           <div className="col-sm-6 col-lg-3 mb-5 mb-sm-0">
//             <div className="counter">
//               <strong
//                 className="text-color-light font-weight-bold text-13 mb-2"
//                 data-to="2000"
//                 data-append="+"
//               >
//                 0
//               </strong>
//               <label className="custom-font-secondary text-color-light text-5">
//                 Projects Delivery
//               </label>
//             </div>
//           </div>
//           <div className="col-sm-6 col-lg-3">
//             <div className="counter">
//               <strong
//                 className="text-color-light font-weight-bold text-13 mb-2"
//                 data-to="130"
//                 data-append="+"
//               >
//                 0
//               </strong>
//               <label className="custom-font-secondary text-color-light text-5">Team Members</label>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

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
                Our mission is to modernize real businesses by combining proven IT delivery with
                practical AI execution, governance, and vertical industry expertise.
              </p>
              <ul className="custom-text-size-1 ps-3 mb-0">
                <li className="pb-2">
                  Upgrade websites and apps with AI-powered capabilities and responsible governance
                </li>
                <li className="pb-2">
                  Support enterprise software operations with deep vertical industry knowledge
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
                To become the trusted AI-first transformation partner for ambitious organizations,
                turning data into intelligence with responsible AI governance and industry-leading
                expertise.
              </p>
              <p className="custom-text-size-1 pb-2 mb-4">
                We envision a future where data systems, automation, prompt-engineered AI, and
                responsible governance are deeply integrated into daily operations, helping teams
                decide faster and execute with precision across vertical industries.
              </p>
              <p className="custom-text-size-1 mb-0">
                Our focus is to help businesses move from traditional systems to AI-native
                organizations with sustainable, high-impact innovation grounded in vertical industry
                expertise.
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
                engineering, AI governance, and deep vertical industry expertise.
              </p>
              <p className="custom-text-size-1 pb-2 mb-4">
                We seek passionate engineers, AI specialists, and data architects who can architect
                responsible AI solutions, craft powerful prompts, and bring domain expertise to
                transform industries.
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

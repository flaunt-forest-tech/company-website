'use client';
import Footer from '@/components/shared/footer';
import Header from '@/components/shared/header';
import ScriptLoader from '@/components/script-loader';
import PageHeader, { PageHeaderProps } from '@/components/shared/page-header';
import Image from 'next/image';
import GetInTouchSection from '@/components/shared/get-in-touch-section';
import { SERVICES } from '@/constants/services';
import Link from 'next/link';

export default function ITServicesOverviewPage() {
  const pageHeaderData: PageHeaderProps = {
    title: 'IT SERVICES',
    breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'IT Services' }],
  };
  return (
    <div className="body">
      <Header activePage="ITServices" />
      <div role="main" className="main">
        <PageHeader {...pageHeaderData} />
        <ServicesSection />
        <GetInTouchSection />
      </div>
      <Footer />
      <ScriptLoader />
    </div>
  );
}

function ServicesSection() {
  const processSteps = [
    {
      step: '1',
      title: '1. BRAINSTORM',
      desc: 'We begin by understanding your goals and challenges, then explore how AI and modern IT can be tailored—or even built from the ground up—to meet your unique needs.',
    },
    {
      step: '2',
      title: '2. DEVELOPMENT',
      desc: 'Our engineering team not only leverages AI tools and automation to accelerate development, but also has the capability to design and build custom AI solutions that seamlessly integrate into your business.',
    },
    {
      step: '3',
      title: '3. DELIVERY',
      desc: 'We deploy your solution with intelligent monitoring, predictive support, and AI customization options, ensuring a smooth handover today and the flexibility to evolve your own AI ecosystem in the future.',
    },
  ];

  return (
    <section
      id="services"
      className="section bg-color-transparent border-0 mt-0 mb-1"
      style={{
        backgroundImage: 'url(/img/backgrounds/dots-background-3.png)',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'top right',
      }}
    >
      <div className="container container-xl-custom pt-3 mt-4">
        <div className="row justify-content-center">
          <div className="col-md-10 text-center">
            <div className="overflow-hidden mb-2">
              <span className="d-block font-weight-bold custom-text-color-grey-1 line-height-1 mb-0">
                OUR EXPERTISE
              </span>
            </div>
            <div className="overflow-hidden mb-4">
              <h2 className="text-color-dark font-weight-bold text-8 line-height-2 mb-0">
                World-Class Solutions for your Business
              </h2>
            </div>
            <p className="custom-text-size-1 mb-5">
              We deliver AI-driven IT solutions that fuel growth, automate operations, and secure
              your future. From modern infrastructure to smart applications—we’ve got you covered.
            </p>
          </div>
        </div>

        <div className="row row-gutter-sm justify-content-center pb-5 mb-5">
          {SERVICES.map(({ icon, title, description, link }) => (
            <div key={title} className="col-md-6 col-xl-4 mb-4">
              <div className="card border-0 custom-box-shadow-1">
                <div className="card-body text-center p-5 my-3">
                  <Image
                    src={`/img/icons/${icon}`}
                    alt={title}
                    width={100}
                    height={100}
                    className="img-fluid"
                  />
                  <h4 className="text-color-primary font-weight-bold text-6 mb-3">{title}</h4>
                  <p className="custom-text-size-1">{description}</p>
                  {/* <a
                    href="/demo-it-services-services-detail"
                    className="text-color-dark font-weight-bold custom-text-size-1"
                  >
                    READ MORE +
                  </a> */}
                  <Link href={link} className="text-color-dark font-weight-bold custom-text-size-1">
                    READ MORE +
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="row">
          <div className="col">
            <div className="overflow-hidden mb-4">
              <h2 className="text-color-dark font-weight-bold text-center text-8 line-height-2 mb-0">
                Our Process
              </h2>
            </div>
          </div>
        </div>

        <div className="row pt-lg-4">
          <div className="col position-relative">
            <div className="process custom-process-style-1 d-flex w-100 flex-column flex-lg-row pb-2 mb-4">
              {processSteps.map(({ step, title, desc }) => (
                <div key={step} className="process-step col-12 col-lg-4 mb-5 mb-lg-4">
                  <div className="process-step-circle">
                    <strong className="process-step-circle-content text-color-primary text-8">
                      {step}
                    </strong>
                  </div>
                  <div className="process-step-content px-5">
                    <h4 className="text-color-dark font-weight-bold text-4 line-height-1 mb-3">
                      {title}
                    </h4>
                    <p className="custom-font-secondary custom-text-size-1 px-3 mb-0">{desc}</p>
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

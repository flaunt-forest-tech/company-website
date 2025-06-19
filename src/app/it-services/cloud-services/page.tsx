'use client';
import Footer from '@/components/shared/footer';
import Header from '@/components/shared/header';
import ScriptLoader from '@/components/script-loader';
import PageHeader, { PageHeaderProps } from '@/components/shared/page-header';
import Image from 'next/image';

export default function CloudServicesPage() {
  const pageHeaderData: PageHeaderProps = {
    title: 'CLOUD SERVICES',
    breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'IT Services' }],
  };
  return (
    <div className="body">
      <Header activePage="ItServicesOverview" />
      <div role="main" className="main">
        <PageHeader {...pageHeaderData} />
        <CloudServicesSection />
        {/* <ServicesSection />
        <GetInTouchSection /> */}
      </div>
      <Footer />
      <ScriptLoader />
    </div>
  );
}

function CloudServicesSection() {
  const services = [
    {
      title: 'IT CONSULTING',
      description:
        'Strategic guidance to align your IT investments with your long-term business objectives, delivering measurable ROI.',
      delay: 1400,
    },
    {
      title: 'MANAGED CLOUD',
      description:
        'Fully managed cloud infrastructure services to ensure high availability, performance, and security without the complexity.',
      delay: 1600,
    },
    {
      title: 'CLOUD COMPUTING',
      description:
        'Modernize your business by leveraging scalable computing power, storage, and services in the cloud.',
      delay: 1800,
    },
  ];
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
                Enable Your Business To Its Maximum Potential With Cloud Innovation
              </h2>
            </div>
            <p className="custom-text-size-1 pt-3 pb-1 mb-4">
              Our cloud solutions empower your organization with the flexibility and scalability it
              needs to grow. Whether you&apos;re migrating legacy systems or building new
              infrastructure, we help streamline your operations for better performance and reduced
              costs.
            </p>
            <p className="custom-text-size-1">
              With a dedicated team of experts and proven frameworks, we ensure seamless cloud
              adoption, robust security, and ongoing optimization tailored to your business goals.
            </p>
          </div>
          <div className="col-md-4 offset-md-1 ps-md-5">
            {services.map((item, idx) => (
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
              Our team brings together passionate professionals, forward-thinking leadership, and a
              collaborative environment to drive client success.
            </p>
            <p className="custom-text-size-1 pb-2 mb-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
            <p className="custom-text-size-1 pb-3 mb-4">
              Partnering with us means access to a dedicated support system and a workplace that
              fosters personal and professional growth.
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

        {/* <div className="row">
          <div className="col">
            <div className="owl-carousel owl-theme nav-style-2 nav-font-size-sm mb-0">
              {[
                'Cloud Services',
                'Tech Support',
                'Data Security',
                'Software Dev',
                'Server Consulting',
              ].map((service, idx) => (
                <div
                  key={idx}
                  className={`card border-0 bg-color-transparent ${idx % 2 !== 0 ? 'mt-lg-5' : ''}`}
                >
                  <div className="card-body text-center p-4 my-3">
                    <div className="custom-icon-wrapper">
                      <Image
                        src={`/img/icons/${service.toLowerCase().replace(/ /g, '-')}.svg`}
                        alt=""
                        width={100}
                        height={100}
                        className={`img-fluid ${idx % 2 === 0 ? 'svg-fill-color-primary' : 'svg-fill-color-dark'} pb-2 mb-4`}
                      />
                    </div>
                    <h4
                      className={`font-weight-bold text-6 mb-3 ${idx % 2 === 0 ? 'text-color-primary' : 'text-color-dark'}`}
                    >
                      {service}
                    </h4>
                    <p className="custom-text-size-1 px-lg-4">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc viverra erat
                      orci.
                    </p>
                    <a
                      href="/services-detail"
                      className={`font-weight-bold custom-text-size-1 ${idx % 2 === 0 ? 'text-color-dark' : 'text-color-primary'}`}
                    >
                      READ MORE +
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div> */}
      </div>
    </section>
  );
}

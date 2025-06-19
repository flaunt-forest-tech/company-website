'use client';
import Footer from '@/components/footer';
import GetInTouchSection from '@/components/get-in-touch-section';
import Header from '@/components/header';
import ScriptLoader from '@/components/script-loader';
import Image from 'next/image';

export default function AboutUSPage() {
  return (
    <div className="body">
      <Header activePage="AboutUs" />
      <div role="main" className="main">
        <PageHeader />
        <WhoWeAreSection />
        <div className="container container-xl-custom pb-3 mb-4 mt-4">
          <div className="row">
            <div className="col">
              <hr className="my-5" />
            </div>
          </div>
        </div>
        <OurClients />
        <CountersSection />
        <OurMission />
        <GetInTouchSection />
      </div>
      <Footer />
      <ScriptLoader />
    </div>
  );
}

function PageHeader() {
  return (
    <section className="page-header page-header-modern custom-page-header-style-1 bg-color-primary page-header-lg mb-0">
      <div className="container container-xl-custom py-5">
        <div className="row">
          <div className="col-md-8 order-2 order-md-1 align-self-center p-static">
            <h1
              className="font-weight-extra-bold text-14 appear-animation"
              data-appear-animation="fadeInRightShorter"
              data-appear-animation-delay="200"
            >
              ABOUT US
            </h1>
          </div>
          <div className="col-md-4 order-1 order-md-2 align-self-center">
            <ul
              className="breadcrumb d-block text-md-end breadcrumb-light appear-animation"
              data-appear-animation="fadeInRightShorter"
              data-appear-animation-delay="400"
            >
              <li>
                <a href="#">Home</a>
              </li>
              <li className="active">About Us</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
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
              We focus on bringing value and solve business challenges through the delivery of
              modern IT services and solutions
            </h2>

            <p
              className="custom-text-size-1 pb-2 mb-4 appear-animation"
              data-appear-animation="fadeInUpShorter"
              data-appear-animation-delay="1100"
            >
              Our team specializes in delivering innovative IT support and infrastructure solutions
              tailored to meet the unique needs of small and medium businesses. We emphasize
              reliability, scalability, and long-term value in everything we do.
            </p>

            <p
              className="custom-text-size-1 mb-0 appear-animation"
              data-appear-animation="fadeInUpShorter"
              data-appear-animation-delay="1300"
              data-plugin-options='{"accY": 200}'
            >
              From proactive system monitoring to cloud migrations and cybersecurity enhancements,
              we empower organizations to operate efficiently and securely in a digital-first world.
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

function OurClients() {
  const logos = [
    { src: '/img/about-us/clients/logo-8.png', delay: 500 },
    { src: '/img/about-us/clients/logo-9.png', delay: 1000, style: { maxWidth: '200px' } },
    { src: '/img/about-us/clients/logo-10.png', delay: 900 },
    { src: '/img/about-us/clients/logo-11.png', delay: 600, style: { maxWidth: '220px' } },
    { src: '/img/about-us/clients/logo-12.png', delay: 1200 },
    { src: '/img/about-us/clients/logo-13.png', delay: 500, style: { maxWidth: '200px' } },
    { src: '/img/about-us/clients/logo-14.png', delay: 800, style: { maxWidth: '220px' } },
    { src: '/img/about-us/clients/logo-15.png', delay: 1100, style: { maxWidth: '180px' } },
  ];

  return (
    <div className="container container-xl-custom">
      <div className="row">
        <div className="col">
          <div className="overflow-hidden mb-2">
            <span
              className="d-block font-weight-bold custom-text-color-grey-1 text-center line-height-1 mb-0 appear-animation"
              data-appear-animation="maskUp"
              data-appear-animation-delay="200"
            >
              WHO ARE WITH US
            </span>
          </div>
          <div className="overflow-hidden mb-5">
            <h2
              className="text-color-dark font-weight-bold text-center text-8 line-height-2 mb-0 appear-animation"
              data-appear-animation="maskUp"
              data-appear-animation-delay="400"
            >
              Our Amazing Clients
            </h2>
          </div>
        </div>
      </div>

      <div className="row align-items-center justify-content-center pb-4 mb-5">
        {logos.map(({ src, delay, style }, index) => (
          <div
            key={index}
            className={`col-md-4 col-xl-3 text-center mb-5 ${index >= 4 ? 'mb-xl-0' : ''} appear-animation`}
            data-appear-animation="expandIn"
            data-appear-animation-delay={delay}
          >
            <Image
              src={src}
              alt={`Client logo ${index + 1}`}
              className="img-fluid"
              style={style}
              width={200} // required
              height={100} // required
              sizes="(max-width: 768px) 100vw, 200px"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function CountersSection() {
  return (
    <section className="section section-height-3 bg-color-dark custom-box-shadow-1 border-0 m-0">
      <div className="container container-xl-custom">
        <div className="counters row justify-content-center align-items-center">
          <div className="col-sm-6 col-lg-3 mb-5 mb-lg-0">
            <div className="counter">
              <strong
                className="text-color-light font-weight-bold text-13 mb-2"
                data-to="35"
                data-append="+"
              >
                0
              </strong>
              <label className="custom-font-secondary text-color-light text-5">Business Year</label>
            </div>
          </div>
          <div className="col-sm-6 col-lg-3 mb-5 mb-lg-0">
            <div className="counter">
              <strong
                className="text-color-light font-weight-bold text-13 mb-2"
                data-to="240"
                data-append="+"
              >
                0
              </strong>
              <label className="custom-font-secondary text-color-light text-5">Clients</label>
            </div>
          </div>
          <div className="col-sm-6 col-lg-3 mb-5 mb-sm-0">
            <div className="counter">
              <strong
                className="text-color-light font-weight-bold text-13 mb-2"
                data-to="2000"
                data-append="+"
              >
                0
              </strong>
              <label className="custom-font-secondary text-color-light text-5">
                Projects Delivery
              </label>
            </div>
          </div>
          <div className="col-sm-6 col-lg-3">
            <div className="counter">
              <strong
                className="text-color-light font-weight-bold text-13 mb-2"
                data-to="130"
                data-append="+"
              >
                0
              </strong>
              <label className="custom-font-secondary text-color-light text-5">Team Members</label>
            </div>
          </div>
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
                We are committed to delivering innovative IT solutions that empower businesses to
                grow <strong className="text-color-dark">efficiently </strong>and{' '}
                <strong className="text-color-dark">securely</strong>.
              </p>
              <p className="custom-text-size-1 pb-2 mb-4">
                Our dedicated team works closely with clients to understand their unique challenges
                and craft tailored strategies that drive success.
              </p>
              <p className="custom-text-size-1 mb-0">
                Through continuous improvement and proactive support, we strive to exceed
                expectations and foster long-term partnerships.
              </p>
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
                To be a trusted leader in IT services by delivering exceptional
                <strong className="text-color-dark"> value </strong> and
                <strong className="text-color-dark"> innovative</strong> solutions worldwide.
              </p>
              <p className="custom-text-size-1 pb-2 mb-4">
                We envision a future where technology seamlessly integrates with business goals to
                create unparalleled opportunities.
              </p>
              <p className="custom-text-size-1 mb-0">
                Our focus is on fostering sustainable growth, embracing change, and inspiring
                progress in everything we do.
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
                alt="Porto Careers"
                className="img-fluid pb-2 mb-4"
                sizes="(max-width: 768px) 100vw, 33vw"
                width={600} // replace with actual image width
                height={400} // replace with actual image height
              />
              <h4 className="font-weight-bold text-color-dark text-6 pb-1 mb-4">PORTO CAREERS</h4>
              <p className="custom-font-secondary custom-text-size-2 line-height-4 pb-2 mb-4">
                Join our dynamic team and help shape the future of IT services by driving
                <strong className="text-color-dark"> innovation</strong> and{' '}
                <strong className="text-color-dark">excellence.</strong>
              </p>
              <p className="custom-text-size-1 pb-2 mb-4">
                We offer an empowering work environment where your skills can flourish and your
                ideas can make an impact.
              </p>
              <a
                href="demo-it-services-careers.html"
                className="d-flex align-items-center custom-link-effect-1 text-color-primary font-weight-bold text-decoration-none text-4"
              >
                See All Positions <i className="custom-arrow-icon ms-2" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

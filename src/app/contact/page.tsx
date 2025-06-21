'use client';
import Footer from '@/components/shared/footer';
import Header from '@/components/shared/header';
import ScriptLoader from '@/components/script-loader';
import PageHeader, { PageHeaderProps } from '@/components/shared/page-header';
import Image from 'next/image';
import { CONTACT } from '@/constants/contact';

export default function ContactPage() {
  const pageHeaderData: PageHeaderProps = {
    title: 'CONTACT US',
    breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Contact Us' }],
  };
  return (
    <div className="body">
      <Header activePage="Contact" />
      <div role="main" className="main">
        <PageHeader {...pageHeaderData} />
        <ContactSection />
        {/* Uncomment the sections below as needed */}
        {/* <ServicesSection />
        {/* <WhoWeAreSection />
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
        <GetInTouchSection /> */}
      </div>
      <Footer />
      <ScriptLoader />
    </div>
  );
}

function ContactSection() {
  return (
    <section className="section border-0 py-0 m-0">
      <div className="container-fluid">
        <div className="row">
          {/* Left Column */}
          <div className="col-lg-5 px-0">
            <div className="d-flex flex-column justify-content-center bg-color-dark h-100 p-5">
              <div className="row justify-content-center pt-2 mt-5">
                <div className="col-md-9">
                  <div className="feature-box flex-column flex-xl-row align-items-center align-items-xl-start text-center text-xl-start">
                    <div className="feature-box-icon bg-color-transparent w-auto h-auto pt-0">
                      <Image
                        src="/img/icons/building.svg"
                        alt="Building Icon"
                        width={95}
                        height={95}
                        className="img-fluid"
                        data-icon
                        data-plugin-options="{'onlySVG': true, 'extraClass': 'svg-fill-color-light'}"
                      />
                    </div>
                    <div className="feature-box-info ps-2 pt-1">
                      <h4 className="text-color-light font-weight-bold text-6">
                        Corporate Headquarters
                      </h4>
                      <p className="text-color-light opacity-5 font-weight-light custom-text-size-1 pb-2 mb-4">
                        {CONTACT.ADDRESS.street}
                        <br />
                        {CONTACT.ADDRESS.street2}
                        <br />
                        {`${CONTACT.ADDRESS.city}, ${CONTACT.ADDRESS.state} ${CONTACT.ADDRESS.zip}`}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-9">
                  <hr className="bg-color-light opacity-2" />
                </div>
              </div>

              <div className="row justify-content-center py-2">
                <div className="col-auto text-center mb-4 mb-sm-0 mb-lg-4 mb-xl-0">
                  <span className="d-block font-weight-semibold">SUPPORT</span>
                  <a
                    href={`tel:${CONTACT.CELL.support}`}
                    className="text-color-light font-weight-bold text-6"
                  >
                    {CONTACT.CELL.supportFormatted}
                  </a>
                </div>
                <div className="col-auto text-center ms-xl-5">
                  <span className="d-block font-weight-semibold">SALES</span>
                  <a
                    href={`tel:${CONTACT.CELL.sales}`}
                    className="text-color-light font-weight-bold text-6"
                  >
                    {CONTACT.CELL.salesFormatted}
                  </a>
                </div>
              </div>

              <div className="row justify-content-center pt-2 pb-3 mb-5">
                <div className="col-md-9">
                  <hr className="bg-color-light opacity-2" />
                </div>
                <div className="col-md-12 text-center">
                  <span className="d-block font-weight-semibold">SEND AN EMAIL</span>
                  <a
                    href={`mailto:${CONTACT.EMAIL}`}
                    className="text-color-light font-weight-bold text-decoration-underline text-5"
                  >
                    {CONTACT.EMAIL}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Google Maps Placeholder */}
          <div className="col-lg-7 px-0">
            <div id="googlemaps" className="google-map h-100 my-0" style={{ minHeight: '500px' }}>
              {/* Google Maps - Go to the bottom of the page to change settings and map location. */}
              <div
                id="googlemaps"
                className="google-map h-100 my-0"
                style={{ minHeight: '500px' }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

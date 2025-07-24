'use client';
import Footer from '@/components/shared/footer';
import Header from '@/components/shared/header';
import ScriptLoader from '@/components/script-loader';
import PageHeader, { PageHeaderProps } from '@/components/shared/page-header';
import Image from 'next/image';
import { CONTACT } from '@/constants/contact';
// import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import React, { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { sendEmail } from '../actions/sendEmail';

export type ContactFormInputs = {
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
};

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
        <LocationSection />
        <ContactSection />
      </div>
      <Footer />
      <ScriptLoader />
    </div>
  );
}

function LocationSection() {
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
              {/* <div
                id="googlemaps"
                className="google-map h-100 my-0"
                style={{ minHeight: '500px' }}
              ></div> */}
              {/* <GoogleMapSection /> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// function GoogleMapSection() {
//   // const [map, setMap] = React.useState(null);

//   const containerStyle = {
//     width: '400px',
//     height: '400px',
//   };

//   const center = {
//     lat: -3.745,
//     lng: -38.523,
//   };
//   const { isLoaded } = useJsApiLoader({
//     id: 'google-map-script',
//     googleMapsApiKey: 'YOUR_API_KEY',
//   });

//   return isLoaded ? (
//     <GoogleMap
//       mapContainerStyle={containerStyle}
//       center={center}
//       zoom={10}
//       // onLoad={onLoad}
//       // onUnmount={onUnmount}
//     >
//       {/* Child components, such as markers, info windows, etc. */}
//       <></>
//     </GoogleMap>
//   ) : (
//     <></>
//   );
// }

function ContactSection() {
  const [status, setStatus] = useState<'success' | 'error' | null>(null);
  const { register, handleSubmit } = useForm<ContactFormInputs>();

  const onSubmit: SubmitHandler<ContactFormInputs> = async (data) => {
    const response = await sendEmail(data);
    if (response.success) {
      setStatus('success');
    } else {
      setStatus('error');
      console.error('Error sending email:', response.error);
    }
  };

  return (
    <section
      className="section custom-section-full-width bg-color-transparent border-0 mt-1 mb-1"
      style={{
        backgroundImage: 'url(img/demos/it-services/backgrounds/dots-background-4.png)',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'top right',
      }}
    >
      <div className="container container-xl-custom mt-3">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="overflow-hidden mb-2">
              <span
                className="d-block font-weight-bold custom-text-color-grey-1 text-center line-height-1 mb-0 appear-animation"
                data-appear-animation="maskUp"
                data-appear-animation-delay="300"
              >
                GET IN TOUCH
              </span>
            </div>
            <div className="overflow-hidden mb-4">
              <h2
                className="text-color-dark font-weight-bold text-center text-8 line-height-2 mb-0 appear-animation"
                data-appear-animation="maskUp"
                data-appear-animation-delay="500"
              >
                How Can We Help?
              </h2>
            </div>
            <p
              className="custom-text-size-1 text-center mb-5 appear-animation"
              data-appear-animation="fadeInUpShorter"
              data-appear-animation-delay="700"
            >
              Contact us to request a quote or to schedule a consultation with our team.
            </p>
          </div>
        </div>

        <div className="row mb-4">
          <div
            className="col appear-animation"
            data-appear-animation="fadeInUpShorter"
            data-appear-animation-delay="900"
          >
            <form className="contact-form" onSubmit={handleSubmit(onSubmit)}>
              {status === 'success' && (
                <div className="contact-form-success alert alert-success mt-4">
                  <strong>Success!</strong> Your message has been sent to us.
                </div>
              )}
              {status === 'error' && (
                <div className="contact-form-error alert alert-danger mt-4">
                  <strong>Error!</strong> There was an error sending your message.
                  <span className="mail-error-message text-1 d-block"></span>
                </div>
              )}

              <div className="row row-gutter-sm">
                <div className="form-group col-lg-6 mb-4">
                  <input
                    type="text"
                    id="name"
                    maxLength={100}
                    required
                    data-msg-required="Please enter your name."
                    className="form-control border-0 custom-box-shadow-1 py-3 px-4 h-auto text-3 text-color-dark"
                    placeholder="Your Name"
                    {...register('name')}
                  />
                </div>
                <div className="form-group col-lg-6 mb-4">
                  <input
                    type="text"
                    id="phone"
                    maxLength={100}
                    required
                    data-msg-required="Please enter your phone number."
                    className="form-control border-0 custom-box-shadow-1 py-3 px-4 h-auto text-3 text-color-dark"
                    placeholder="Phone Number"
                    {...register('phone')}
                  />
                </div>
              </div>

              <div className="row row-gutter-sm">
                <div className="form-group col-lg-6 mb-4">
                  <input
                    type="email"
                    id="email"
                    maxLength={100}
                    required
                    data-msg-required="Please enter your email address."
                    data-msg-email="Please enter a valid email address."
                    className="form-control border-0 custom-box-shadow-1 py-3 px-4 h-auto text-3 text-color-dark"
                    placeholder="Your Email"
                    {...register('email')}
                  />
                </div>
                <div className="form-group col-lg-6 mb-4">
                  <input
                    type="text"
                    id="subject"
                    maxLength={100}
                    required
                    data-msg-required="Please enter the subject."
                    className="form-control border-0 custom-box-shadow-1 py-3 px-4 h-auto text-3 text-color-dark"
                    placeholder="Subject"
                    {...register('subject')}
                  />
                </div>
              </div>

              <div className="row">
                <div className="form-group col mb-4">
                  <textarea
                    id="message"
                    rows={10}
                    maxLength={5000}
                    required
                    data-msg-required="Please enter your message."
                    className="form-control border-0 custom-box-shadow-1 py-3 px-4 h-auto text-3 text-color-dark"
                    placeholder="Your Message"
                    {...register('message')}
                  ></textarea>
                </div>
              </div>

              <div className="row">
                <div className="form-group col mb-0">
                  <button
                    type="submit"
                    className="btn btn-secondary btn-outline text-color-dark font-weight-semibold border-width-4 custom-link-effect-1 text-1 text-xl-3 d-inline-flex align-items-center px-4 py-3"
                    data-loading-text="Loading..."
                  >
                    SUBMIT <i className="custom-arrow-icon ms-5"></i>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

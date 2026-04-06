'use client';
import Footer from '@/components/shared/footer';
import Header from '@/components/shared/header';
import ScriptLoader from '@/components/script-loader';
import PageHeader, { PageHeaderProps } from '@/components/shared/page-header';
import Image from 'next/image';
import { CONTACT } from '@/constants/contact';
// import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import React, { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { sendEmail } from '../actions/sendEmail';
import {
  TRACKING_CONSENT_EVENT,
  UTM_STORAGE_KEY,
  VISITOR_STORAGE_KEY,
  hasTrackingConsent,
} from '@/lib/tracking-consent';

export type ContactFormInputs = {
  name: string;
  phone: string;
  email: string;
  inquiryType: string;
  subject: string;
  message: string;
  honeypot?: string;
  sourcePage?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  visitorId?: string;
};

export default function ContactPage() {
  const pageHeaderData: PageHeaderProps = {
    title: 'CONTACT',
    breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Contact' }],
  };
  return (
    <div className="body">
      <Header activePage="Contact" />
      <div role="main" className="main">
        <PageHeader {...pageHeaderData} />
        <LocationSection />
        <ContactSection />
        <ContactSupportSections />
      </div>
      <Footer />
      <ScriptLoader />
    </div>
  );
}

function LocationSection() {
  const mapQuery = encodeURIComponent(
    `${CONTACT.ADDRESS.street}, ${CONTACT.ADDRESS.city}, ${CONTACT.ADDRESS.state} ${CONTACT.ADDRESS.zip}`
  );

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
                      <h4 className="text-color-light font-weight-bold text-6">Office</h4>
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
              <iframe
                title="Corporate headquarters map"
                src={`https://maps.google.com/maps?q=${mapQuery}&z=15&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '500px' }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
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
  const { register, handleSubmit, setValue } = useForm<ContactFormInputs>();

  useEffect(() => {
    setValue('sourcePage', window.location.pathname);

    const applyTrackingFields = () => {
      if (!hasTrackingConsent()) {
        setValue('visitorId', '');
        setValue('utmSource', '');
        setValue('utmMedium', '');
        setValue('utmCampaign', '');
        return;
      }

      try {
        const existingVisitorId = window.localStorage.getItem(VISITOR_STORAGE_KEY)?.trim();
        const visitorId =
          existingVisitorId ||
          (typeof window.crypto?.randomUUID === 'function'
            ? window.crypto.randomUUID()
            : `visitor_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`);

        if (!existingVisitorId) {
          window.localStorage.setItem(VISITOR_STORAGE_KEY, visitorId);
        }

        setValue('visitorId', visitorId);

        const stored = window.sessionStorage.getItem(UTM_STORAGE_KEY);
        if (!stored) {
          return;
        }

        const utm = JSON.parse(stored) as {
          utmSource?: string;
          utmMedium?: string;
          utmCampaign?: string;
        };

        setValue('utmSource', utm.utmSource ?? '');
        setValue('utmMedium', utm.utmMedium ?? '');
        setValue('utmCampaign', utm.utmCampaign ?? '');
      } catch {
        // Ignore analytics-only field issues.
      }
    };

    applyTrackingFields();
    window.addEventListener(TRACKING_CONSENT_EVENT, applyTrackingFields as EventListener);

    return () => {
      window.removeEventListener(TRACKING_CONSENT_EVENT, applyTrackingFields as EventListener);
    };
  }, [setValue]);

  const onSubmit: SubmitHandler<ContactFormInputs> = async (data) => {
    const response = await sendEmail(data);
    if (response.success) {
      setStatus('success');
    } else {
      setStatus('error');
      console.error('Form submission error');
    }
  };

  return (
    <section
      className="section custom-section-full-width bg-color-transparent border-0 mt-1 mb-1"
      style={{
        backgroundImage: 'url(/img/demos/it-services/backgrounds/dots-background-4.png)',
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
                Tell Us What You Need Help With
              </h2>
            </div>
            <p
              className="custom-text-size-1 text-center mb-5 appear-animation"
              data-appear-animation="fadeInUpShorter"
              data-appear-animation-delay="700"
            >
              A short summary is enough to start. We help with websites, automation, custom
              software, internal tools, backend systems, integrations, cloud deployment, and other
              practical technical projects for businesses, teams, and individual clients.
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
                  <label htmlFor="name" className="visually-hidden">
                    Your Name
                  </label>
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
                  <label htmlFor="phone" className="visually-hidden">
                    Phone Number
                  </label>
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
                  <label htmlFor="email" className="visually-hidden">
                    Your Email
                  </label>
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
                  <label htmlFor="inquiryType" className="visually-hidden">
                    Project Focus
                  </label>
                  <select
                    id="inquiryType"
                    required
                    data-msg-required="Please choose your project focus."
                    className="form-control border-0 custom-box-shadow-1 py-3 px-4 h-auto text-3 text-color-dark"
                    defaultValue=""
                    {...register('inquiryType')}
                  >
                    <option value="" disabled>
                      Project Focus
                    </option>
                    <option value="Automation or AI">Automation or AI</option>
                    <option value="Custom Software or Internal Tool">
                      Custom Software or Internal Tool
                    </option>
                    <option value="Website or Web App">Website or Web App</option>
                    <option value="Backend, API, or Integration">
                      Backend, API, or Integration
                    </option>
                    <option value="Cloud Deployment or Support">Cloud Deployment or Support</option>
                    <option value="Small Business System Improvement">
                      Small Business System Improvement
                    </option>
                    <option value="Personal or Individual Project">
                      Personal or Individual Project
                    </option>
                    <option value="Not Sure Yet">Not Sure Yet</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="row row-gutter-sm">
                <div className="form-group col-lg-12 mb-4">
                  <label htmlFor="subject" className="visually-hidden">
                    Subject
                  </label>
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
                  <label htmlFor="message" className="visually-hidden">
                    Your Message
                  </label>
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

              {/* Honeypot field - hidden from real users */}
              <input
                type="text"
                {...register('honeypot')}
                style={{ display: 'none' }}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />
              <input type="hidden" {...register('sourcePage')} />
              <input type="hidden" {...register('utmSource')} />
              <input type="hidden" {...register('utmMedium')} />
              <input type="hidden" {...register('utmCampaign')} />
              <input type="hidden" {...register('visitorId')} />

              <div className="row">
                <div className="form-group col mb-0">
                  <button
                    type="submit"
                    data-analytics-label="Contact form submit"
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

function ContactSupportSections() {
  return (
    <section className="section bg-color-transparent border-0 mt-0 mb-0 pt-2 pb-4">
      <div className="container container-xl-custom">
        <div className="row">
          <div className="col-lg-6 mb-4">
            <div className="card border-0 custom-box-shadow-1 h-100">
              <div className="card-body p-4">
                <span className="d-block font-weight-bold custom-text-color-grey-1 line-height-1 mb-2">
                  WHO THIS IS FOR
                </span>
                <h3 className="text-color-dark font-weight-bold text-6 mb-3">
                  A strong fit if you are
                </h3>
                <ul className="custom-text-size-1 ps-3 mb-0">
                  <li className="pb-2">A small or midsize business improving operations</li>
                  <li className="pb-2">A team replacing manual workflows and disconnected tools</li>
                  <li className="pb-2">A service provider needing a better website or portal</li>
                  <li>An individual client with a clear technical project in mind</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="col-lg-6 mb-4">
            <div className="card border-0 custom-box-shadow-1 h-100">
              <div className="card-body p-4">
                <span className="d-block font-weight-bold custom-text-color-grey-1 line-height-1 mb-2">
                  WHAT HAPPENS NEXT
                </span>
                <h3 className="text-color-dark font-weight-bold text-6 mb-3">After you submit</h3>
                <ol className="custom-text-size-1 ps-3 mb-0">
                  <li className="pb-2">We review your request and current context</li>
                  <li className="pb-2">We follow up with practical next steps if there is a fit</li>
                  <li className="pb-2">We align scope, timeline, and delivery approach</li>
                  <li>We start with the highest-value first step</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

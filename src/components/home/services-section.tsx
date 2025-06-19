import React from 'react';
import Image from 'next/image';
import { services } from '@/constants/services';

const ServicesSection = () => {
  return (
    <section
      id="services"
      className="section custom-section-full-width bg-color-transparent border-0 mt-0 mb-1"
      style={{
        backgroundImage: "url('/img/backgrounds/dots-background-2.png')",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'bottom right',
      }}
    >
      <div className="container container-xl-custom ">
        <div className="row">
          <div className="col">
            <div className="overflow-hidden mb-2">
              <span className="d-block font-weight-bold custom-text-color-grey-1 text-center line-height-1 mb-0">
                OUR SERVICES
              </span>
            </div>
            <div className="overflow-hidden mb-5">
              <h2 className="text-color-dark font-weight-bold text-center text-8 line-height-2 mb-0">
                World-Class Solutions for your Business
              </h2>
            </div>
          </div>
        </div>

        <div className="row pt-4">
          {services.slice(0, 4).map((service, index) => (
            <div
              key={service.title}
              className={`col-md-6 col-lg-3 text-center mb-5 ${index % 2 !== 0 ? 'mt-lg-5' : ''}`}
            >
              <Image
                src={`/img/icons/${service.icon}`}
                width={100}
                height={100}
                alt={service.title}
                className="img-fluid pb-2 mb-4"
              />
              <h4 className={`font-weight-bold text-6 mb-3 ${service.titleClass}`}>
                {service.title}
              </h4>
              <p className="custom-text-size-1 px-lg-4">{service.description}</p>
              <a
                href="/demo-it-services-services-detail"
                className={`${service.linkClass} font-weight-bold custom-text-size-1`}
              >
                READ MORE +
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// const services = [
//   {
//     title: 'Cloud Services',
//     icon: '/img/icons/backup-data-server.svg',
//     description:
//       'Reliable cloud infrastructure to host, scale, and manage your applications with maximum uptime and flexibility.',
//     titleClass: 'text-color-primary',
//     linkClass: 'text-color-dark',
//   },
//   {
//     title: 'Tech Support',
//     icon: '/img/icons/remove-monitor-access.svg',
//     description:
//       'Expert IT support to troubleshoot hardware and software issues, ensuring your business stays productive.',
//     titleClass: 'text-color-dark',
//     linkClass: 'text-color-primary',
//   },
//   {
//     title: 'Data Security',
//     icon: '/img/icons/password-lock-secure.svg',
//     description:
//       'Comprehensive security solutions to protect your business data from cyber threats and unauthorized access.',
//     titleClass: 'text-color-primary',
//     linkClass: 'text-color-dark',
//   },
//   {
//     title: 'Software Dev',
//     icon: '/img/icons/floppy-disk-memory.svg',
//     description:
//       'Custom software development tailored to your business needs, from web apps to enterprise-grade platforms.',
//     titleClass: 'text-color-dark',
//     linkClass: 'text-color-primary',
//   },
// ];

export default ServicesSection;

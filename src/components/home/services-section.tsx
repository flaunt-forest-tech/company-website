import React from 'react';
import Image from 'next/image';
import { SERVICES } from '@/constants/services';
import Link from 'next/link';

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
          {SERVICES.slice(0, 4).map((service, index) => (
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
              <Link
                className={`${service.linkClass} font-weight-bold custom-text-size-1`}
                href={service.link}
              >
                READ MORE +
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;

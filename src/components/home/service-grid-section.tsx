import Image from 'next/image';
import Link from 'next/link';

import { SERVICES } from '@/constants/services';

export default function ServiceGridSection() {
  return (
    <section className="section bg-color-transparent border-0 mt-0 mb-0 pt-2 pb-1">
      <div className="container container-xl-custom">
        <div className="row justify-content-center">
          <div className="col-lg-10 text-center">
            <span className="d-block font-weight-bold custom-text-color-grey-1 line-height-1 mb-2">
              OUR SERVICES
            </span>
            <h2 className="text-color-dark font-weight-bold text-8 line-height-2 mb-4">
              Core services we provide
            </h2>
            <p className="custom-text-size-1 mb-0">
              Start with the business problem and we can help define which technical approach makes
              the most sense.
            </p>
          </div>
        </div>
        <div className="row pt-4">
          {SERVICES.slice(0, 5).map((service, index) => (
            <div
              key={service.title}
              className={`col-md-6 col-lg-4 text-center mb-5 ${index % 2 !== 0 ? 'mt-lg-5' : ''}`}
            >
              <Image
                src={`/img/icons/${service.icon}`}
                width={100}
                height={100}
                alt={service.title}
                className="img-fluid pb-2 mb-4"
              />
              <h3 className={`font-weight-bold text-6 mb-3 ${service.titleClass}`}>
                {service.title}
              </h3>
              <p className="custom-text-size-1 px-lg-4">{service.description}</p>
              <Link
                className={`${service.linkClass} font-weight-bold custom-text-size-1`}
                href={service.link}
              >
                LEARN MORE +
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

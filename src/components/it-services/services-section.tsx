import { SERVICES } from '@/constants/services';
import Image from 'next/image';
import Link from 'next/link';

export default function ServicesSection() {
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
                Enable Your Business To Its Maximum Potential With AI-Powered Cloud Innovation
              </h2>
            </div>
            <p className="custom-text-size-1 pt-3 pb-1 mb-4">
              Our next-generation cloud solutions combine scalability with AI-driven intelligence,
              empowering your organization to grow faster and smarter. Whether you’re migrating
              legacy systems, building new infrastructure, or integrating AI into your operations,
              we help streamline workflows, enhance performance, and reduce costs.
            </p>
            <p className="custom-text-size-1">
              With a dedicated team of experts and proven frameworks, we deliver seamless cloud
              adoption, robust AI-enabled security, and continuous optimization—all tailored to your
              unique business goals.
            </p>
            <p className="custom-text-size-1">
              We go beyond traditional IT. By combining our knowledge with AI innovation, we help
              your business grow stronger, faster, and smarter.
            </p>
          </div>
          <div className="col-md-4 offset-md-1 ps-md-5">
            {SERVICES.slice(0, 3).map((item, idx) => (
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
              Our team brings together passionate professionals, forward-thinking leadership, and
              deep industry knowledge—enhanced by the latest AI innovations—to deliver smarter,
              faster, and more reliable solutions.
            </p>
            <p className="custom-text-size-1 pb-2 mb-4">
              By blending our proven IT expertise with the power of AI, we create solutions that are
              tailored, scalable, and future-ready. This unique approach ensures your business gains
              the efficiency of automation without losing the insight of human expertise.
            </p>
            <p className="custom-text-size-1 pb-3 mb-4">
              We are not just another IT company. By combining human expertise with AI intelligence,
              we solve challenges in ways traditional providers cannot. Partnering with us means
              access to a dedicated support system, future-ready technology, and a partner committed
              to your long-term growth.
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
        <div className="row">
          {SERVICES.map((service, index) => (
            <div
              key={index}
              className={`col-12 col-sm-6 col-lg-4 mb-4 ${index % 2 !== 0 ? 'mt-lg-5' : ''}`}
            >
              <div className="card border-0 bg-color-transparent h-100">
                <div className="card-body text-center p-4 my-3">
                  <div className="custom-icon-wrapper mb-4">
                    <Image
                      src={`/img/icons/${service.icon}`}
                      width={100}
                      height={100}
                      alt={service.title}
                      className={`img-fluid svg-fill-color-${service.titleClass}`}
                    />
                  </div>
                  <h4 className={`text-color-${service.titleClass} font-weight-bold text-6 mb-3`}>
                    {service.title}
                  </h4>
                  <p className="custom-text-size-1 px-lg-4">{service.description}</p>
                  <Link
                    href="#"
                    className={`text-color-${service.linkClass} font-weight-bold custom-text-size-1`}
                  >
                    READ MORE +
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

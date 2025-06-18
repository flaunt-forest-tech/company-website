'use client';
import Image from 'next/image';

export default function WhoWeAreSection() {
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

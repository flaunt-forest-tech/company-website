import Link from 'next/link';

const GetInTouchSection = () => {
  return (
    <section className="section section-height-3 bg-color-dark border-0 m-0">
      <div className="container container-xl-custom">
        <div className="row justify-content-center align-items-center">
          <div className="col-lg-8 col-xl-6 mb-5 mb-lg-0">
            <span
              className="d-block custom-text-color-light-2 custom-heading-bar custom-heading-bar-with-padding font-weight-light text-5 mb-3 appear-animation"
              data-appear-animation="fadeInUpShorter"
              data-appear-animation-delay="300"
            >
              Let’s Get in Touch
            </span>
            <h2
              className="text-color-light font-weight-extra-bold text-10 negative-ls-1 pe-3 mb-3 appear-animation"
              data-appear-animation="fadeInUpShorter"
              data-appear-animation-delay="500"
            >
              LET&apos;S TALK ABOUT YOUR BUSINESS IT SERVICES NEEDS
            </h2>
            <p
              className="custom-font-secondary text-4 custom-text-color-light-3 mb-0 appear-animation"
              data-appear-animation="fadeInUpShorter"
              data-appear-animation-delay="700"
            >
              Whether you need ongoing IT support or a strategic technology partner, we&apos;re here
              to help you grow and secure your business with reliable and scalable solutions.
            </p>
          </div>
          <div className="col-lg-4 col-xl-3">
            <div className="overflow-hidden">
              <Link
                href="/contact" // Assuming you have a route like /contact
                className="btn btn-secondary btn-outline text-color-light font-weight-semibold border-width-4 custom-link-effect-1 text-1 text-xl-3 d-inline-flex align-items-center px-4 py-3 appear-animation"
                data-appear-animation="maskRight"
                data-appear-animation-delay="900"
              >
                GET STARTED NOW <i className="custom-arrow-icon ms-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GetInTouchSection;

import Link from 'next/link';

export default function FinalCtaSection() {
  return (
    <section className="section bg-color-transparent border-0 mt-0 mb-0 pt-2 pb-4">
      <div className="container container-xl-custom">
        <div className="row justify-content-center">
          <div className="col-lg-10 text-center">
            <h2 className="text-color-dark font-weight-bold text-6 line-height-2 mb-3">
              Want to explore a practical AI use case?
            </h2>
            <p className="custom-text-size-1 mb-4">
              If you already have a workflow, service, or operational problem in mind, we can help
              you define the right next step and whether AI is actually part of it.
            </p>
            <Link
              href="/contact"
              className="btn btn-secondary btn-outline text-color-dark font-weight-semibold border-width-4 custom-link-effect-1 text-1 text-xl-3 d-inline-flex align-items-center px-4 py-3"
            >
              BOOK A CONSULTATION <i className="custom-arrow-icon ms-2"></i>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

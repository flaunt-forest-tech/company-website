import { HOME_EXAMPLE_SOLUTIONS } from '@/constants/site-copy';
import Link from 'next/link';

export default function ExampleSolutionsSection() {
  return (
    <section className="section bg-color-transparent border-0 mt-0 mb-0 pt-2 pb-1">
      <div className="container container-xl-custom">
        <div className="row justify-content-center">
          <div className="col-lg-10 text-center">
            <span className="d-block font-weight-bold custom-text-color-grey-1 line-height-1 mb-2">
              EXAMPLE SOLUTIONS
            </span>
            <h2 className="text-color-dark font-weight-bold text-8 line-height-2 mb-4">
              What this work can look like in practice
            </h2>
            <p className="custom-text-size-1 mb-0">
              These are the kinds of systems and improvements we commonly help clients build.
            </p>
          </div>
        </div>
        <div className="row pt-4">
          {HOME_EXAMPLE_SOLUTIONS.slice(0, 4).map((item) => (
            <div key={item.title} className="col-md-6 col-lg-4 mb-4">
              <div className="card border-0 custom-box-shadow-1 h-100">
                <div className="card-body p-4">
                  <span className="badge bg-light text-primary font-weight-bold text-3 mb-3 p-2">
                    {item.label}
                  </span>
                  <h3 className="font-weight-bold text-5 mb-3">{item.title}</h3>
                  <p className="custom-text-size-1 mb-0">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="row pt-2">
          <div className="col text-center">
            <Link
              href="/it-services"
              className="btn btn-secondary btn-outline text-color-dark font-weight-semibold border-width-4 custom-link-effect-1 text-1 text-xl-3 d-inline-flex align-items-center px-4 py-3"
            >
              VIEW FULL SERVICES <i className="custom-arrow-icon ms-2"></i>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

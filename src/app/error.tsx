'use client';

import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="body">
      <div className="main">
        <section className="section section-height-3 bg-color-transparent border-0 m-0">
          <div className="container container-xl-custom">
            <div className="row justify-content-center align-items-center h-100">
              <div className="col-md-10 col-lg-8 text-center">
                <h1 className="text-color-dark font-weight-bold text-14 mb-4">
                  Oops! Something Went Wrong
                </h1>
                <p className="custom-text-size-1 text-color-grey mb-5">
                  We encountered an unexpected error. Please try again in a few moments, or return
                  to the homepage.
                </p>

                <div className="row justify-content-center gap-3">
                  <div className="col-auto">
                    <button
                      onClick={() => reset()}
                      className="btn btn-secondary btn-outline text-color-dark font-weight-semibold border-width-4 custom-link-effect-1 text-1 text-xl-3 d-inline-flex align-items-center px-4 py-3"
                    >
                      TRY AGAIN <i className="custom-arrow-icon ms-2"></i>
                    </button>
                  </div>
                  <div className="col-auto">
                    <Link
                      href="/"
                      className="btn btn-secondary btn-outline text-color-dark font-weight-semibold border-width-4 custom-link-effect-1 text-1 text-xl-3 d-inline-flex align-items-center px-4 py-3"
                    >
                      BACK TO HOME <i className="custom-arrow-icon ms-2"></i>
                    </Link>
                  </div>
                </div>

                {process.env.NODE_ENV === 'development' && error.message && (
                  <div className="mt-5 pt-4 border-top">
                    <p className="custom-text-size-1 text-danger mb-2">
                      <strong>Developer Info:</strong>
                    </p>
                    <p className="custom-text-size-1 text-muted">{error.message}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

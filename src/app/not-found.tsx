import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="body">
      <div className="main">
        <section className="section section-height-3 bg-color-transparent border-0 m-0">
          <div className="container container-xl-custom">
            <div className="row justify-content-center align-items-center h-100">
              <div className="col-md-10 col-lg-8 text-center">
                <h1 className="text-color-dark font-weight-bold text-14 mb-2">404</h1>
                <h2 className="text-color-dark font-weight-bold text-9 mb-4">Page Not Found</h2>
                <p className="custom-text-size-1 text-color-grey mb-5">
                  The page you're looking for doesn't exist or has been moved. Let's get you back on
                  track.
                </p>

                <Link
                  href="/"
                  className="btn btn-secondary btn-outline text-color-dark font-weight-semibold border-width-4 custom-link-effect-1 text-1 text-xl-3 d-inline-flex align-items-center px-4 py-3"
                >
                  BACK TO HOME <i className="custom-arrow-icon ms-2"></i>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

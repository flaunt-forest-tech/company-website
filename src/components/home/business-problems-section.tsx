import { HOME_BUSINESS_PROBLEMS } from '@/constants/site-copy';

export default function BusinessProblemsSection() {
  return (
    <section className="section bg-color-transparent border-0 mt-0 mb-0 pb-1">
      <div className="container container-xl-custom">
        <div className="row justify-content-center">
          <div className="col-lg-10 text-center">
            <span className="d-block font-weight-bold custom-text-color-grey-1 line-height-1 mb-2">
              BUSINESS PROBLEMS WE SOLVE
            </span>
            <h2 className="text-color-dark font-weight-bold text-8 line-height-2 mb-4">
              Fix the bottlenecks behind day-to-day work
            </h2>
            <p className="custom-text-size-1 mb-0">
              Most clients do not need more software. They need the right system, set up properly.
            </p>
          </div>
        </div>
        <div className="row pt-4">
          {HOME_BUSINESS_PROBLEMS.map((item) => (
            <div key={item.label} className="col-md-6 col-lg-4 mb-4">
              <div className="card border-0 custom-box-shadow-1 h-100">
                <div className="card-body p-4">
                  <span className="text-color-primary font-weight-bold text-6 d-block mb-2">
                    {item.label}
                  </span>
                  <h3 className="font-weight-bold text-5 mb-3">{item.title}</h3>
                  <p className="custom-text-size-1 mb-0">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

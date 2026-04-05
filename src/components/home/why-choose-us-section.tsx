import { HOME_WHY_CHOOSE_US } from '@/constants/site-copy';

export default function WhyChooseUsSection() {
  return (
    <section className="section bg-color-transparent border-0 mt-0 mb-0 pt-2 pb-1">
      <div className="container container-xl-custom">
        <div className="row justify-content-center">
          <div className="col-lg-10 text-center">
            <span className="d-block font-weight-bold custom-text-color-grey-1 line-height-1 mb-2">
              WHY CHOOSE US
            </span>
            <h2 className="text-color-dark font-weight-bold text-8 line-height-2 mb-4">
              Professional, direct, and hands-on
            </h2>
            <p className="custom-text-size-1 mb-0">
              Why clients choose to work with us once scope and options are clear.
            </p>
          </div>
        </div>
        <div className="row pt-4">
          {HOME_WHY_CHOOSE_US.slice(0, 4).map((item) => (
            <div key={item.title} className="col-md-6 mb-4">
              <div className="card border-0 custom-box-shadow-1 h-100">
                <div className="card-body p-4">
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

import { AI_FAQS } from '@/constants/ai-solutions-copy';

export default function FaqSection() {
  return (
    <section className="section bg-color-transparent border-0 mt-0 mb-0 pt-2 pb-4">
      <div className="container container-xl-custom">
        <div className="row justify-content-center">
          <div className="col-lg-10 text-center">
            <span className="d-block font-weight-bold custom-text-color-grey-1 line-height-1 mb-2">
              FAQ
            </span>
            <h2 className="text-color-dark font-weight-bold text-8 line-height-2 mb-4">
              Common questions
            </h2>
          </div>
        </div>
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="accordion accordion-modern without-bg" id="aiFaqAccordion">
              {AI_FAQS.map((item, index) => (
                <div className="card card-default" key={item.id}>
                  <div className="card-header">
                    <h4 className="card-title m-0">
                      <a
                        className="accordion-toggle px-4 pt-3"
                        data-bs-toggle="collapse"
                        data-bs-parent="#aiFaqAccordion"
                        href={`#${item.id}`}
                        aria-expanded={index === 0}
                      >
                        {item.question}
                      </a>
                    </h4>
                  </div>
                  <div id={item.id} className={`collapse ${index === 0 ? 'show' : ''}`}>
                    <div className="card-body px-4 pt-2 pb-4">
                      <p className="custom-text-size-1 mb-0">{item.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

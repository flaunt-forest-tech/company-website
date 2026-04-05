import SectionHeading from '@/components/ai-solutions/section-heading';
import { AI_DELIVERY_MODEL } from '@/constants/ai-solutions-copy';

export default function DeliveryModelSection() {
  return (
    <section className="section bg-color-transparent border-0 mt-0 mb-0 pt-3 pb-1">
      <div className="container container-xl-custom">
        <SectionHeading
          eyebrow="HOW WE DELIVER"
          title="A practical delivery model built around real use"
        />
        <div className="row pt-4">
          {AI_DELIVERY_MODEL.map((item) => (
            <div key={item.label} className="col-md-4 mb-4">
              <div className="card border-0 custom-box-shadow-1 h-100">
                <div className="card-body p-4">
                  <span className="d-block text-color-primary font-weight-bold text-6 mb-2">
                    {item.label}
                  </span>
                  <h3 className="text-color-dark font-weight-bold text-5 mb-3">{item.title}</h3>
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

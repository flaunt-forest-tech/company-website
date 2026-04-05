import SectionHeading from '@/components/ai-solutions/section-heading';
import { AI_CAPABILITIES } from '@/constants/ai-solutions-copy';

export default function CapabilitiesSection() {
  return (
    <section className="section bg-color-transparent border-0 mt-0 mb-0 pt-3 pb-1">
      <div className="container container-xl-custom">
        <SectionHeading
          eyebrow="WHAT WE DO"
          title="Practical AI solutions for real business and workflow needs"
          description="We use AI where it actually helps: to reduce manual work, improve workflows, and build more useful software, portals, and internal systems."
        />
        <div className="row pt-4">
          {AI_CAPABILITIES.map((item) => (
            <div key={item.title} className="col-md-6 mb-4">
              <div className="card border-0 custom-box-shadow-1 h-100">
                <div className="card-body p-4">
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

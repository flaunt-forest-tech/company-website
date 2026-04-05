import SectionHeading from '@/components/ai-solutions/section-heading';
import { AI_CLOUD_BADGES } from '@/constants/ai-solutions-copy';

export default function CloudDeliverySection() {
  return (
    <section className="section bg-color-transparent border-0 mt-0 mb-0 pt-2 pb-1">
      <div className="container container-xl-custom">
        <SectionHeading eyebrow="CLOUD DELIVERY" title="Flexible technical delivery" />
        <div className="row justify-content-center pt-2 pb-2">
          {AI_CLOUD_BADGES.map((cloud) => (
            <div key={cloud} className="col-auto mb-2">
              <span className="badge bg-color-dark text-color-light px-4 py-2 text-2">{cloud}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

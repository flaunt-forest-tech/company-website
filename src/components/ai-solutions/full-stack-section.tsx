import SectionHeading from '@/components/ai-solutions/section-heading';
import { AI_FULL_STACK_SCOPE } from '@/constants/ai-solutions-copy';

export default function FullStackSection() {
  return (
    <section className="section bg-color-transparent border-0 mt-0 mb-0 pt-2 pb-1">
      <div className="container container-xl-custom">
        <SectionHeading
          eyebrow="FULL-STACK DELIVERY"
          title="One team across product, backend, and deployment"
        />
        <div className="row pt-2 pb-1">
          {AI_FULL_STACK_SCOPE.map((item) => (
            <div key={item} className="col-sm-6 col-lg-3 mb-4">
              <div className="card border-0 custom-box-shadow-1 h-100">
                <div className="card-body p-4 text-center">
                  <h3 className="font-weight-bold text-5 mb-0">{item}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

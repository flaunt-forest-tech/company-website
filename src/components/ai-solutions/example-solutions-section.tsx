import SectionHeading from '@/components/ai-solutions/section-heading';
import { AI_EXAMPLE_SOLUTIONS } from '@/constants/ai-solutions-copy';

export default function ExampleSolutionsSection() {
  return (
    <section className="section bg-color-transparent border-0 mt-0 mb-0 pt-2 pb-1">
      <div className="container container-xl-custom">
        <SectionHeading
          eyebrow="EXAMPLE USE CASES"
          title="Example AI applications"
          description="Example ways AI can be used inside practical business systems without relying on fake case studies or inflated claims."
        />
        <div className="row pt-4 pb-2">
          {AI_EXAMPLE_SOLUTIONS.map((item) => (
            <div key={item.title} className="col-md-6 col-lg-6 mb-4">
              <div className="card border-0 custom-box-shadow-1 h-100">
                <div className="card-body p-4">
                  <span className="badge bg-light text-primary font-weight-bold text-3 mb-3 p-2">
                    {item.category}
                  </span>
                  <h3 className="font-weight-bold text-5 mb-3">{item.title}</h3>
                  <p className="custom-text-size-1 text-color-grey mb-3">{item.scenario}</p>
                  <hr className="my-3" />
                  <p className="custom-text-size-1 text-color-grey mb-0">
                    <strong>Common delivery stack:</strong> {item.stack}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

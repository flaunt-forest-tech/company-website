import SectionHeading from '@/components/ai-solutions/section-heading';
import { AI_WHO_WE_HELP } from '@/constants/ai-solutions-copy';

export default function WhoWeHelpSection() {
  return (
    <section className="section bg-color-transparent border-0 mt-0 mb-0 pt-2 pb-1">
      <div className="container container-xl-custom">
        <SectionHeading
          eyebrow="WHO WE WORK WITH"
          title="Who we help most"
          description="We are usually the best fit for clients who need practical execution and clearer systems, not vague innovation language."
        />
        <div className="row pt-4 pb-2">
          {AI_WHO_WE_HELP.map((item) => (
            <div key={item} className="col-md-6 col-lg-3 mb-4">
              <div className="card border-0 custom-box-shadow-1 h-100">
                <div className="card-body p-4">
                  <p className="custom-text-size-1 mb-0">{item}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import SectionHeading from '@/components/ai-solutions/section-heading';
import { AI_TRUST_FOUNDATIONS, AI_TRUST_MESSAGE } from '@/constants/ai-solutions-copy';

export default function TrustSection() {
  return (
    <section className="section bg-color-transparent border-0 mt-0 mb-0 pt-2 pb-1">
      <div className="container container-xl-custom">
        <SectionHeading eyebrow="TRUST AND SECURITY" title="Governance built in from day one" />
        <div className="row justify-content-center">
          <div className="col-lg-10 text-center">
            <p className="custom-text-size-1 mb-3">{AI_TRUST_MESSAGE.intro}</p>
            <p className="custom-text-size-1 mb-3">{AI_TRUST_MESSAGE.body}</p>
            <p className="custom-text-size-1 mb-0">{AI_TRUST_MESSAGE.support}</p>
          </div>
        </div>
        <div className="row justify-content-center pt-3 pb-2">
          <div className="col-lg-10">
            <div className="card border-0 custom-box-shadow-1">
              <div className="card-body p-4 p-lg-5">
                <ul className="custom-text-size-1 mb-0 ps-3">
                  {AI_TRUST_FOUNDATIONS.map((item) => (
                    <li key={item} className="pb-2">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

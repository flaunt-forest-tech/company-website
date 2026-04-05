import CapabilitiesSection from '@/components/ai-solutions/capabilities-section';
import CloudDeliverySection from '@/components/ai-solutions/cloud-delivery-section';
import DeliveryModelSection from '@/components/ai-solutions/delivery-model-section';
import ExampleSolutionsSection from '@/components/ai-solutions/example-solutions-section';
import FaqSection from '@/components/ai-solutions/faq-section';
import FinalCtaSection from '@/components/ai-solutions/final-cta-section';
import FullStackSection from '@/components/ai-solutions/full-stack-section';
import TrustSection from '@/components/ai-solutions/trust-section';
import WhoWeHelpSection from '@/components/ai-solutions/who-we-help-section';
import Footer from '@/components/shared/footer';
import GetInTouchSection from '@/components/shared/get-in-touch-section';
import Header from '@/components/shared/header';
import PageHeader, { PageHeaderProps } from '@/components/shared/page-header';
import ScriptLoader from '@/components/script-loader';

export default function AISolutionsPage() {
  const pageHeaderData: PageHeaderProps = {
    title: 'AI SOLUTIONS',
    breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'AI Solutions' }],
  };

  return (
    <div className="body">
      <Header activePage="AISolutions" />
      <div role="main" className="main">
        <PageHeader {...pageHeaderData} />
        <CapabilitiesSection />
        <DeliveryModelSection />
        <CloudDeliverySection />
        <FullStackSection />
        <ExampleSolutionsSection />
        <TrustSection />
        <WhoWeHelpSection />
        <FaqSection />
        <FinalCtaSection />

        <GetInTouchSection />
      </div>
      <Footer />
      <ScriptLoader />
    </div>
  );
}

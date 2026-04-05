import BusinessProblemsSection from '@/components/home/business-problems-section';
import Carousel from '@/components/home/carousel';
import ExampleSolutionsSection from '@/components/home/example-solutions-section';
import Footer from '@/components/shared/footer';
import GetInTouchSection from '@/components/shared/get-in-touch-section';
import Header from '@/components/shared/header';
import HowWeWorkSection from '@/components/home/how-we-work-section';
import ITServicesOverview from '@/components/home/it-services-overview';
import ScriptLoader from '@/components/script-loader';
import WhyChooseUsSection from '@/components/home/why-choose-us-section';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div className="body">
      <Header activePage="Home" />
      <div role="main" className="main">
        <Carousel />
        <ITServicesOverview />
        <BusinessProblemsSection />
        <ExampleSolutionsSection />
        <HowWeWorkSection />
        <WhyChooseUsSection />
        <GetInTouchSection />
      </div>
      <Footer />
      <ScriptLoader />
    </div>
  );
}

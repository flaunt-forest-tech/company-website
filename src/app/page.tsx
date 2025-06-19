import Carousel from '@/components/home/carousel';
import Footer from '@/components/footer';
import GetInTouchSection from '@/components/get-in-touch-section';
import Header from '@/components/header';
import ITServicesOverview from '@/components/home/it-services-overview';
import ServicesSection from '@/components/home/services-section';
import ScriptLoader from '@/components/script-loader';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div className="body">
      <Header activePage="Home" />
      <div role="main" className="main">
        <Carousel />
        <ITServicesOverview />
        <div className="container container-xl-custom mt-5">
          <div className="row">
            <div className="col">
              <hr className="my-5" />
            </div>
          </div>
        </div>
        <ServicesSection />
        <GetInTouchSection />
      </div>
      <Footer />
      <ScriptLoader />
    </div>
  );
}

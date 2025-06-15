import Carousel from '@/components/carousel';
import Header from '@/components/header';
import ITServicesOverview from '@/components/it-services-overview';
import ServicesSection from '@/components/services-section';

export default function Home() {
  return (
    <div className="body">
      <Header />
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
      </div>
    </div>
  );
}

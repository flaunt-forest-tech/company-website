import Carousel from '@/components/carousel';
import Header from '@/components/header';
import ITServicesOverview from '@/components/it-services-overview';

export default function Home() {
  return (
    <div className="body">
      <Header />
      <div role="main" className="main">
        <Carousel />
        <ITServicesOverview />
      </div>
    </div>
  );
}

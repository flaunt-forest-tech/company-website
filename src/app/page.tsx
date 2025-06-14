import Carousel from '@/components/carousel';
import Header from '@/components/header';

export default function Home() {
  return (
    <div className="body">
      <Header />
      <div role="main" className="main">
        <Carousel />
      </div>
    </div>
  );
}

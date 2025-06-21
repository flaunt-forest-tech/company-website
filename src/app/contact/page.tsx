'use client';
import Footer from '@/components/shared/footer';
import Header from '@/components/shared/header';
import ScriptLoader from '@/components/script-loader';
import PageHeader, { PageHeaderProps } from '@/components/shared/page-header';

export default function AboutUSPage() {
  const pageHeaderData: PageHeaderProps = {
    title: 'CONTACT US',
    breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Contact Us' }],
  };
  return (
    <div className="body">
      <Header activePage="Contact" />
      <div role="main" className="main">
        <PageHeader {...pageHeaderData} />
        {/* <WhoWeAreSection />
        <div className="container container-xl-custom pb-3 mb-4 mt-4">
          <div className="row">
            <div className="col">
              <hr className="my-5" />
            </div>
          </div>
        </div>
        <OurClients />
        <CountersSection />
        <OurMission />
        <GetInTouchSection /> */}
      </div>
      <Footer />
      <ScriptLoader />
    </div>
  );
}

import ScriptLoader from '@/components/script-loader';
import Footer from '@/components/shared/footer';
import Header from '@/components/shared/header';
import PageHeader, { PageHeaderProps } from '@/components/shared/page-header';
import React from 'react';

const CareersPage: React.FC = () => {
  const pageHeaderData: PageHeaderProps = {
    title: 'CAREERS',
    breadcrumbs: [{ label: 'home', href: '/' }, { label: 'careers' }],
  };
  return (
    <div className="body">
      <Header activePage="Careers" />
      <div role="main" className="main">
        <PageHeader {...pageHeaderData} />
      </div>
      <Footer />
      <ScriptLoader />
    </div>
  );
};

export default CareersPage;

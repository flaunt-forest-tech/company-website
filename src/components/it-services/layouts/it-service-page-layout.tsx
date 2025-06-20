'use client';
import Header from '@/components/shared/header';
import Footer from '@/components/shared/footer';
import ScriptLoader from '@/components/script-loader';
import PageHeader, { PageHeaderProps } from '@/components/shared/page-header';
import { ReactNode } from 'react';

interface ITServiceLayoutProps {
  pageHeaderData: PageHeaderProps;
  children: ReactNode;
}

export default function ITServicePageLayout({ pageHeaderData, children }: ITServiceLayoutProps) {
  return (
    <div className="body">
      <Header activePage="ITServices" />
      <div role="main" className="main">
        <PageHeader {...pageHeaderData} />
        {children}
      </div>
      <Footer />
      <ScriptLoader />
    </div>
  );
}

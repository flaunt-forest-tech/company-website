'use client';
import { PageHeaderProps } from '@/components/shared/page-header';
import ITServicePageLayout from '@/components/it-services/layouts/it-service-page-layout';
import ServicesSection from '@/components/it-services/services-section';

export default function DataSecurityPage() {
  const pageHeaderData: PageHeaderProps = {
    title: 'WEBSITES & CLIENT PORTALS',
    breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Websites & Client Portals' }],
  };
  return (
    <ITServicePageLayout pageHeaderData={pageHeaderData}>
      <ServicesSection />
    </ITServicePageLayout>
  );
}

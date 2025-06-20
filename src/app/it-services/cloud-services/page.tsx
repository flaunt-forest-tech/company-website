'use client';
import { PageHeaderProps } from '@/components/shared/page-header';
import ITServicePageLayout from '@/components/it-services/layouts/it-service-page-layout';
import ServicesSection from '@/components/it-services/services-section';

export default function CloudServicesPage() {
  const pageHeaderData: PageHeaderProps = {
    title: 'CLOUD SERVICES',
    breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'IT Services' }],
  };
  return (
    <ITServicePageLayout pageHeaderData={pageHeaderData}>
      <ServicesSection />
    </ITServicePageLayout>
  );
}

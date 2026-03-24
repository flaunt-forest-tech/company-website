'use client';
import { PageHeaderProps } from '@/components/shared/page-header';
import ITServicePageLayout from '@/components/it-services/layouts/it-service-page-layout';
import ServicesSection from '@/components/it-services/services-section';

export default function SoftwareDevelopmentPage() {
  const pageHeaderData: PageHeaderProps = {
    title: 'CLOUD, PLATFORM & INFRASTRUCTURE',
    breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'AI Solutions' }],
  };
  return (
    <ITServicePageLayout pageHeaderData={pageHeaderData}>
      <ServicesSection />
    </ITServicePageLayout>
  );
}

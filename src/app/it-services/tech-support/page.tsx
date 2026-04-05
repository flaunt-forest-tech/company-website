'use client';
import { PageHeaderProps } from '@/components/shared/page-header';
import ITServicePageLayout from '@/components/it-services/layouts/it-service-page-layout';
import ServicesSection from '@/components/it-services/services-section';

export default function TechSupportPage() {
  const pageHeaderData: PageHeaderProps = {
    title: 'CUSTOM SOFTWARE & INTERNAL TOOLS',
    breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Custom Software & Internal Tools' }],
  };
  return (
    <ITServicePageLayout pageHeaderData={pageHeaderData}>
      <ServicesSection />
    </ITServicePageLayout>
  );
}

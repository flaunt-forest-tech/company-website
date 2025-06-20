'use client';
import { PageHeaderProps } from '@/components/shared/page-header';
import ITServicePageLayout from '@/components/it-services/layouts/it-service-page-layout';
import ServicesSection from '@/components/home/services-section';

export default function TechSupportPage() {
  const pageHeaderData: PageHeaderProps = {
    title: 'TECH SUPPORT',
    breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'IT Services' }],
  };
  return (
    <ITServicePageLayout pageHeaderData={pageHeaderData}>
      <ServicesSection />
    </ITServicePageLayout>
  );
}

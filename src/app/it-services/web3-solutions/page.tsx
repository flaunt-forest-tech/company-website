'use client';
import { PageHeaderProps } from '@/components/shared/page-header';
import ITServicePageLayout from '@/components/it-services/layouts/it-service-page-layout';
import ServicesSection from '@/components/it-services/services-section';

export default function Web3SolutionsPage() {
  const pageHeaderData: PageHeaderProps = {
    title: 'CLOUD DEPLOYMENT & SUPPORT',
    breadcrumbs: [{ label: 'Home', href: '/' }, { label: 'Cloud Deployment & Support' }],
  };
  return (
    <ITServicePageLayout pageHeaderData={pageHeaderData}>
      <ServicesSection />
    </ITServicePageLayout>
  );
}

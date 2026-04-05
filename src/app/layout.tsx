import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import AnalyticsTracker from '@/components/analytics-tracker';

import './globals.css';
// import Script from 'next/script';
// import Head from 'next/head';
// import ScriptLoader from '@/components/script-loader';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Flaunt Forest Tech | Agentic AI, Automation & Cloud Delivery',
  description:
    'Houston-based technology partner delivering agentic AI systems, intelligent automation, full-stack product development, data foundations, and AWS/GCP/Azure cloud delivery for growing teams, private companies, established businesses, and selected larger organizations.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <html lang="en">
        {/* <Head> */}
        {/* Load jQuery early using defer for global scope */}
        {/* <script src="/js/vendor/jquery/jquery.min.js" defer />
          <script src="/js/plugins/js/plugins.min.js" defer />
          <script src="/js/theme.js" defer />
          <script src="/js/demo-it-services.js" defer />
          <script src="/js/custom.js" defer />
          <script src="/js/theme.init.js" defer /> */}
        {/* </Head> */}
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <AnalyticsTracker />
          {children}
          {/* <ScriptLoader /> */}
        </body>
      </html>
      {/* Scripts */}
      {/* <Script src="/js/vendor/jquery/jquery.min.js" strategy="afterInteractive" />
      <Script src="/js/plugins/js/plugins.min.js" strategy="afterInteractive" />
      <Script src="/js/theme.js" strategy="afterInteractive" />
      <Script src="/js/demo-it-services.js" strategy="afterInteractive" />
      <Script src="/js/custom.js" strategy="afterInteractive" />
      <Script src="/js/theme.init.js" strategy="afterInteractive" /> */}
    </>
  );
}

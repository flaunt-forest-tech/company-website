import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import './globals.css';
import Script from 'next/script';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Flaunt Forest Tech',
  description:
    'Flaunt Forest Tech is a creative technology company delivering innovative digital solutions through smart design, modern development, and forward-thinking strategy.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          {children}
        </body>
      </html>
      {/* Scripts */}
      <Script src="/js/vendor/jquery/jquery.min.js" strategy="afterInteractive" />
      <Script src="/js/plugins/js/plugins.min.js" strategy="afterInteractive" />
      <Script src="/js/theme.js" strategy="afterInteractive" />
      <Script src="/js/demo-it-services.js" strategy="afterInteractive" />
      <Script src="/js/custom.js" strategy="afterInteractive" />
      <Script src="/js/theme.init.js" strategy="afterInteractive" />
    </>
  );
}

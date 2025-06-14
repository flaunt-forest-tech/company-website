import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

// // Vendor CSS
// import "../vendor/bootstrap/css/bootstrap.min.css";
// import "../vendor/fontawesome-free/css/all.min.css";
// import "../vendor/animate/animate.compat.css";
// import "../vendor/simple-line-icons/css/simple-line-icons.min.css";
// import "../vendor/owl.carousel/assets/owl.carousel.min.css";
// import "../vendor/owl.carousel/assets/owl.theme.default.min.css";
// import "../vendor/magnific-popup/magnific-popup.min.css";

// // Theme CSS
// import "../css/theme.css";
// import "../css/theme-elements.css";
// import "../css/theme-blog.css";
// import "../css/theme-shop.css";

// // Demo CSS
// import "../css/demo-it-services.css";

// // Skin CSS
// import "../css/skin-it-services.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flaunt Forest Tech",
  description: "Flaunt Forest Tech is a creative technology company delivering innovative digital solutions through smart design, modern development, and forward-thinking strategy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SITE_URL, absoluteUrl, jsonLd } from "@/utils/site";

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Infopeso",
  url: SITE_URL,
  logo: absoluteUrl("/logo.png"),
  description: "Datos económicos y cotizaciones de Argentina en tiempo real.",
  sameAs: ["https://x.com/infopeso"],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Infopeso",
  url: SITE_URL,
};

export default function SiteLayout({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <Analytics />
      <Script
        src="https://analytics.ahrefs.com/analytics.js"
        data-key="dyUorFBLMLqDr0dtEh9Klg"
        strategy="afterInteractive"
      />
      <Script
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4776852547323922"
        crossOrigin="anonymous"
        strategy="lazyOnload"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(orgSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(websiteSchema) }} />
    </>
  );
}

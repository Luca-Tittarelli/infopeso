import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = {
  metadataBase: new URL("https://infopeso.com"),
  title: {
    default: "Infopeso — Datos económicos de Argentina",
    template: "%s — Infopeso",
  },
  description:
    "Infopeso: datos económicos y cotizaciones de Argentina en tiempo real. Dólar Blue, Riesgo País, Inflación, Reservas BCRA y más.",
  keywords: [
    "Infopeso",
    "datos económicos",
    "Argentina",
    "finanzas",
    "cotizaciones",
    "dolar blue",
    "dolar hoy",
    "BCRA",
    "riesgo pais",
    "inflacion",
    "reservas",
    "tipo de cambio",
  ],
  authors: [{ name: "Infopeso" }],
  creator: "Infopeso",
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "Infopeso",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Infopeso" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@infopeso",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export const viewport = {
  themeColor: "#0F0F0D",
};

// JSON-LD global: Organization + WebSite
const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Infopeso",
  url: "https://infopeso.com",
  logo: "https://infopeso.com/logo.png",
  description: "Datos económicos y cotizaciones de Argentina en tiempo real.",
  sameAs: ["https://x.com/infopeso"],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Infopeso",
  url: "https://infopeso.com",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&family=Instrument+Serif:ital@0;1&family=Inter:opsz,wght@14..32,400;14..32,500;14..32,600;14..32,700&display=swap"
        />
        {/* Ahrefs Analytics */}
        <script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="dyUorFBLMLqDr0dtEh9Klg"
          async
        />
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4776852547323922"
          crossOrigin="anonymous"
        />
        {/* JSON-LD global */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}

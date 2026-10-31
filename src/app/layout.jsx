import "./globals.css";
import { SITE_URL } from "@/utils/site";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Infopeso — Dólar, inflación, mercado y tu cartera",
    template: "%s | Infopeso",
  },
  description:
    "Cotizaciones del dólar (MEP, CCL, blue, oficial), inflación, riesgo país, bonos y seguimiento de tu cartera personal en pesos y dólares.",
  icons: {
    icon: [
      { url: "/brand/favicon.svg", type: "image/svg+xml" },
      { url: "/brand/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/brand/apple-touch-icon-180.png",
  },
  keywords: [
    "Infopeso",
    "datos económicos",
    "Argentina",
    "finanzas",
    "cotizaciones",
    "dolar blue",
    "dolar mep",
    "dolar ccl",
    "dolar hoy",
    "BCRA",
    "riesgo pais",
    "inflacion",
    "reservas",
    "cartera de inversiones",
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
  themeColor: "#141210",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es-AR" data-theme="dark" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Geist+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/brand/tokens.css" />
        {/* Oscuro primero: sincroniza data-theme antes de hidratar */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
              try {
                var saved = localStorage.getItem('theme');
                var theme = (saved === 'light' || saved === 'dark') ? saved : 'dark';
                document.documentElement.setAttribute('data-theme', theme);
                document.documentElement.classList.toggle('dark', theme === 'dark');
              } catch(e) {}
            })();`,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

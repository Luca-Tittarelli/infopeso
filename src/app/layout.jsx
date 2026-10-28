import "./globals.css";
import { SITE_URL } from "@/utils/site";
import { Inter, DM_Mono, Instrument_Serif } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-mono",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Infopeso — Datos económicos de Argentina",
    template: "%s | Infopeso",
  },
  description:
    "Infopeso: datos económicos y cotizaciones de Argentina en tiempo real. Dólar Blue, Riesgo País, Inflación, Reservas BCRA y más.",
  icons: {
    icon: "/favicon.ico",
  },
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

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`dark ${inter.variable} ${dmMono.variable} ${instrumentSerif.variable}`} suppressHydrationWarning>
      <head>
        {/* Inline Theme Initializer: prevents theme flash before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
              try {
                var saved = localStorage.getItem('theme');
                if (saved === 'light') {
                  document.documentElement.classList.remove('dark');
                } else if (saved === 'dark') {
                  document.documentElement.classList.add('dark');
                } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
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

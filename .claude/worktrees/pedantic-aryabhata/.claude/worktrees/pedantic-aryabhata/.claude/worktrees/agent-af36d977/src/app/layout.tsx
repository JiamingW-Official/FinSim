import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

const BASE_URL = "https://alphadeck.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Alpha Deck — Trading Flight Simulator | Learn Options & Prediction Markets",
    template: "%s | Alpha Deck",
  },
  description:
    "The most advanced options trading simulator. Learn Black-Scholes, Greeks, prediction markets, and behavioral finance through AI-coached simulation. Free to start.",
  keywords: [
    "options trading simulator",
    "learn options trading",
    "Black-Scholes calculator",
    "prediction market education",
    "trading simulator",
    "options Greeks explained",
    "paper trading",
    "options chain simulator",
    "AI trading coach",
    "stock market education",
  ],
  openGraph: {
    title: "Alpha Deck — Trading Flight Simulator | Learn Options & Prediction Markets",
    description:
      "The most advanced options trading simulator. Learn Black-Scholes, Greeks, prediction markets, and behavioral finance through AI-coached simulation. Free to start.",
    type: "website",
    url: BASE_URL,
    siteName: "Alpha Deck",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Alpha Deck — Trading Flight Simulator",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Alpha Deck — Trading Flight Simulator | Learn Options & Prediction Markets",
    description:
      "The most advanced options trading simulator. Learn Black-Scholes, Greeks, prediction markets, and behavioral finance through AI-coached simulation. Free to start.",
    creator: "@alphadeckapp",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
  category: "finance",
};

export const viewport: Viewport = {
  themeColor: "#2d9cdb",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}

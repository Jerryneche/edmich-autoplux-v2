// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import ClientProvider from "./ClientProvider";
import "./globals.css";
import Script from "next/script";
import Link from "next/link";
import PWAInstaller from "@/app/components/PWAInstaller";
import PushNotificationManager from "@/app/components/PushNotificationManager";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2563eb" },
    { media: "(prefers-color-scheme: dark)", color: "#1e40af" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.edmich.com"),

  title: {
    default: "EDMICH AutoPlux - Africa's Leading B2B Automotive Platform",
    template: "%s | EDMICH AutoPlux",
  },

  description:
    "Transform your automotive business with EDMICH AutoPlux. Connect with 500+ verified suppliers, 350+ certified mechanics, and smart logistics across Nigeria. Source genuine auto parts, manage services, and scale operations in one powerful platform.",

  keywords: [
    // High-intent auto parts keywords
    "buy auto parts online Nigeria",
    "auto parts near me",
    "car parts online",
    "genuine spare parts Nigeria",
    "auto parts store Lagos",
    "car spare parts online Nigeria",
    "where to buy car parts in Lagos",
    "cheap auto parts Nigeria",
    "original car parts Nigeria",
    // Brand-specific
    "Toyota parts Nigeria",
    "Honda parts Lagos",
    "Mercedes spare parts Nigeria",
    "BMW parts online Nigeria",
    "Lexus parts Lagos",
    "Hyundai parts Nigeria",
    "Kia spare parts",
    "Nissan parts online",
    // Part types
    "engine parts Nigeria",
    "brake pads Lagos",
    "car battery online Nigeria",
    "oil filter Nigeria",
    "car suspension parts",
    "transmission parts Nigeria",
    "car body parts online",
    "car tires Nigeria",
    // Mechanic keywords
    "mechanic near me Nigeria",
    "car mechanic Lagos",
    "mobile mechanic Abuja",
    "car repair services Nigeria",
    "book mechanic online",
    "certified car mechanic",
    // Logistics
    "auto parts delivery Nigeria",
    "car parts shipping Lagos",
    // B2B
    "B2B auto parts marketplace",
    "wholesale auto parts Nigeria",
    "auto parts supplier",
    "automotive distributor Nigeria",
    // Brand
    "EDMICH",
    "AutoPlux",
    "Edmich AutoPlux",
    "autoplux app",
    "download autoplux",
  ],

  authors: [{ name: "EDMICH AutoPlux", url: "https://www.edmich.com" }],
  creator: "EDMICH AutoPlux",
  publisher: "EDMICH AutoPlux",

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo (1).png", type: "image/png", sizes: "32x32" },
      { url: "/logo 192.png", type: "image/png", sizes: "192x192" },
      { url: "/logo 512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/logo (1).png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
  },

  manifest: "/manifest.json",

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EDMICH AutoPlux",
  },

  openGraph: {
    type: "website",
    locale: "en_NG",
    alternateLocale: ["en_US", "en_GB"],
    url: "https://www.edmich.com",
    siteName: "EDMICH AutoPlux",
    title: "EDMICH AutoPlux - Africa's Leading B2B Automotive Platform",
    description:
      "Connect with 500+ verified suppliers, 350+ certified mechanics, and smart logistics. Source genuine auto parts, manage services, and scale your automotive business across Nigeria and Africa.",
    images: [
      {
        url: "/logo (1).png",
        width: 1200,
        height: 630,
        alt: "EDMICH AutoPlux - B2B Automotive Platform",
        type: "image/png",
      },
      {
        url: "/og image.png",
        width: 1200,
        height: 1200,
        alt: "EDMICH AutoPlux Logo",
        type: "image/png",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    site: "@edmichservices",
    creator: "@edmichservices",
    title: "EDMICH AutoPlux - Africa's Leading B2B Automotive Platform",
    description:
      "Transform your automotive business. 500+ verified suppliers, 350+ mechanics, smart logistics - all in one platform.",
    images: ["/twitter.png"],
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

  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "your-google-verification-code",
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || "your-yandex-verification-code",
  },

  category: "technology",
  classification: "B2B Automotive Platform",

  alternates: {
    canonical: "https://www.edmich.com",
    languages: {
      "en-NG": "https://www.edmich.com",
      "en-US": "https://www.edmich.com/en-us",
    },
  },

  other: {
    "msapplication-TileColor": "#2563eb",
    "msapplication-config": "/browserconfig.xml",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "theme-color": "#2563eb",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "EDMICH AutoPlux",
  description:
    "Africa's leading B2B automotive platform connecting suppliers, mechanics, and logistics",
  url: "https://www.edmich.com",
  logo: "https://www.edmich.com/logo (1).png",
  image: "https://www.edmich.com/og image.png",
  foundingDate: "2024",
  founders: [
    {
      "@type": "Person",
      name: "Edeh Michael",
    },
  ],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Lagos",
    addressCountry: "NG",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+234-902-557-9441",
    contactType: "Customer Service",
    availableLanguage: ["English"],
  },
  sameAs: [
    "https://play.google.com/store/apps/details?id=com.edmich.app",
    "https://twitter.com/edmichservices",
    "https://facebook.com/edmichautoplux",
    "https://linkedin.com/company/edmichservices",
    "https://instagram.com/edmichservices",
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    reviewCount: "350",
  },
};

const mobileAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "MobileApplication",
  name: "AutoPlux - Auto Parts & Mechanics",
  alternateName: "EDMICH AutoPlux",
  description: "Buy genuine auto parts, book certified mechanics, and track deliveries. Africa's #1 B2B automotive marketplace with 500+ verified suppliers across Nigeria. Download free on Google Play.",
  operatingSystem: "Android",
  applicationCategory: "BusinessApplication",
  url: "https://www.edmich.com",
  installUrl: "https://play.google.com/store/apps/details?id=com.edmich.app",
  downloadUrl: "https://play.google.com/store/apps/details?id=com.edmich.app",
  image: "https://www.edmich.com/logo 512.png",
  screenshot: "https://www.edmich.com/twitter.png",
  author: {
    "@type": "Organization",
    name: "EDMICH AutoPlux",
    url: "https://www.edmich.com",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    reviewCount: "350",
    bestRating: "5",
    worstRating: "1",
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "NGN",
    availability: "https://schema.org/InStock",
  },
  softwareVersion: "1.0",
  fileSize: "25MB",
  contentRating: "Everyone",
  inLanguage: "en",
  countriesSupported: "NG",
};

const autoPartsServiceJsonLd = {
  "@context": "https://schema.org",
  "@type": "AutoPartsStore",
  name: "EDMICH AutoPlux",
  description: "Buy genuine auto parts online in Nigeria. 500+ verified suppliers, 50,000+ spare parts for Toyota, Honda, Mercedes, BMW, Lexus, Hyundai, Kia, and more.",
  url: "https://www.edmich.com",
  image: "https://www.edmich.com/logo 512.png",
  telephone: "+234-902-557-9441",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Lagos",
    addressRegion: "Lagos",
    addressCountry: "NG",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "6.5244",
    longitude: "3.3792",
  },
  areaServed: [
    { "@type": "Country", name: "Nigeria" },
    { "@type": "City", name: "Lagos" },
    { "@type": "City", name: "Abuja" },
    { "@type": "City", name: "Port Harcourt" },
    { "@type": "City", name: "Kano" },
    { "@type": "City", name: "Ibadan" },
  ],
  priceRange: "₦₦",
  openingHours: "Mo-Sa 08:00-18:00",
  sameAs: [
    "https://play.google.com/store/apps/details?id=com.edmich.app",
    "https://twitter.com/edmichservices",
    "https://facebook.com/edmichautoplux",
    "https://instagram.com/edmichservices",
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    reviewCount: "350",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Auto Parts Catalog",
    itemListElement: [
      { "@type": "OfferCatalog", name: "Engine Parts" },
      { "@type": "OfferCatalog", name: "Brake Systems" },
      { "@type": "OfferCatalog", name: "Suspension Parts" },
      { "@type": "OfferCatalog", name: "Electrical Components" },
      { "@type": "OfferCatalog", name: "Body Parts" },
      { "@type": "OfferCatalog", name: "Transmission Parts" },
      { "@type": "OfferCatalog", name: "Oil & Filters" },
      { "@type": "OfferCatalog", name: "Tires & Wheels" },
    ],
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "EDMICH AutoPlux",
  url: "https://www.edmich.com",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://www.edmich.com/shop?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(mobileAppJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(autoPartsServiceJsonLd) }}
        />

        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* DNS Prefetch for performance */}
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />

        {/* Google Play Store App Install Banner */}
        <meta name="google-play-app" content="app-id=com.edmich.app" />

        {/* App Links for Deep Linking */}
        <meta property="al:android:url" content="edmich://" />
        <meta property="al:android:app_name" content="AutoPlux" />
        <meta property="al:android:package" content="com.edmich.app" />
        <meta property="al:web:url" content="https://www.edmich.com" />

        {/* PWA Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="EDMICH AutoPlux" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="application-name" content="AutoPlux" />
      </head>

      <body
        className={`${inter.className} bg-white text-gray-900 antialiased`}
        suppressHydrationWarning
      >
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX');
          `}
        </Script>

        {/* Meta Pixel (Facebook) */}
        <Script id="facebook-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', 'YOUR_PIXEL_ID');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=YOUR_PIXEL_ID&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>

        {/* Main App */}
        <ClientProvider>
          {children}
          {/* Push Notification Registration (must be inside SessionProvider) */}
          <PushNotificationManager />
        </ClientProvider>

        {/* PWA Install Prompt */}
        <PWAInstaller />

        {/* Accessibility: Skip to main content */}
        <Link
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg"
        >
          Skip to main content
        </Link>
      </body>
    </html>
  );
}

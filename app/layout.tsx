import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "PainelAds | Gerencie seu Catálogo",
  description: "Plataforma avançada para gestão e sincronização de anúncios.",
  verification: {
    google: ["L7qEPRifPpo2dvzMX6Zrlo5lCW8ohzbKZFvt_gA-KIw", "QoVqg9w_wlotiyZcUjN1l04M-SYXq4aJHcjoiwW6x0I"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="google-site-verification" content="L7qEPRifPpo2dvzMX6Zrlo5lCW8ohzbKZFvt_gA-KIw" />
        <meta name="google-site-verification" content="QoVqg9w_wlotiyZcUjN1l04M-SYXq4aJHcjoiwW6x0I" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-18351203132"
          strategy="afterInteractive"
        />
        <Script id="google-ads-tag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'AW-18351203132');
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}


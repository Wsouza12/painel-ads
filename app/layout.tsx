import type { Metadata } from "next";
import localFont from "next/font/local";
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
    google: "QoVqg9w_wIotiyZcUjN1I84M-SYXq4aJHcjo1wW6x8I",
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
        <meta name="google-site-verification" content="QoVqg9w_wIotiyZcUjN1I84M-SYXq4aJHcjo1wW6x8I" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

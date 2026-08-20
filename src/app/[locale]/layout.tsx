import type { Metadata } from "next";
import { gilroy } from "@/fonts/gilroy";
import { belwe } from "@/fonts/belwe";
import "../globals.css";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import {NextIntlClientProvider} from 'next-intl';
import {getMessages, setRequestLocale} from 'next-intl/server';
import {routing} from '@/i18n/routing';
import {notFound} from 'next/navigation';
import { fetchFooter } from "@/lib/api";

export const metadata: Metadata = {
  metadataBase: new URL("https://the9thway.com"),
  title: "THE9THWAY AGENCY | Premium Branding & Marketing",
  description: "Award-winning creative strategy & digital design. We build fearless brands.",
  openGraph: {
    title: "THE9THWAY AGENCY | Premium Branding & Marketing",
    description: "Award-winning creative strategy & digital design. We build fearless brands.",
    url: "https://the9thway.com",
    siteName: "THE9THWAY AGENCY",
    images: [
      {
        url: "/og-image.jpg", // The user can drop an og-image.jpg into public/ later
        width: 1200,
        height: 630,
        alt: "THE9THWAY AGENCY",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "THE9THWAY AGENCY | Premium Branding & Marketing",
    description: "Award-winning creative strategy & digital design. We build fearless brands.",
    images: ["/og-image.jpg"],
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}>) {
  const {locale} = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  
  const footerData = await fetchFooter(locale);

  return (
    <html lang={locale} className="scroll-smooth" suppressHydrationWarning>
      <body className={`${gilroy.variable} ${belwe.variable} font-sans bg-[#0B0B0C] text-[#E4E2DF] antialiased`} suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <ScrollProgressBar />
          <Navbar />
          <SmoothScrollProvider>
            {children}
            <Footer data={footerData} locale={locale} />
          </SmoothScrollProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

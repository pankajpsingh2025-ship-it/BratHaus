import type { Metadata, Viewport } from "next";
import { Host_Grotesk, Geist_Mono, Newsreader } from "next/font/google";
import "./globals.css";
import { site } from "@/content/site";
import SmoothScroll from "@/components/chrome/SmoothScroll";
import Header from "@/components/chrome/Header";
import Footer from "@/components/chrome/Footer";
import Curtain from "@/components/chrome/Curtain";
import Cursor from "@/components/chrome/Cursor";
import Preloader from "@/components/chrome/Preloader";
import Stage from "@/components/three/Stage";
import JsonLd from "@/components/ui/JsonLd";
import { orgLd } from "@/lib/jsonld";

// Headings: Newsreader 400 (an editorial text serif; one static cut, so it's light to load). Text and UI:
// Host Grotesk 400/500. Small labels: Geist Mono 400.
const serif = Newsreader({ subsets: ["latin"], weight: ["400"], variable: "--font-serif", display: "swap" });
const host = Host_Grotesk({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-host", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], weight: ["400"], variable: "--font-geist-mono", display: "swap", preload: false });

export const metadata: Metadata = {
  metadataBase: new URL(site.siteUrl),
  title: { default: "Paid Ads, Websites, AI Agents & Software for UK Businesses | BratHaus", template: "%s | BratHaus" },
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: "BratHaus", locale: "en_GB" },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/favicon.svg" },
};
export const viewport: Viewport = { themeColor: "#0e0e0d", colorScheme: "dark" };

// Before first paint: a first visit (per session) that starts on the home page plays the preloader,
// unless reduced motion, Save-Data or ?3d=off. Deep links go straight to their content.
const preScript = `try{var d=document.documentElement,n=navigator.connection;if(location.pathname==="/"&&!sessionStorage.getItem("bh-pre")&&!matchMedia("(prefers-reduced-motion: reduce)").matches&&!(n&&n.saveData)&&!/[?&]3d=off/.test(location.search)&&!/[?&]intro=0/.test(location.search))d.classList.add("is-preloading")}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB" className={`${serif.variable} ${host.variable} ${mono.variable}`} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: preScript }} /></head>
      <body>
        <SmoothScroll>
          <Stage>
            <Header bookingUrl={site.bookingUrl} />
            <main id="main">{children}</main>
            <Footer bookingUrl={site.bookingUrl} />
          </Stage>
          <Curtain />
          <Preloader />
          <Cursor />
        </SmoothScroll>
        {/* ANALYTICS: no trackers are installed. If the owner adds one, add a cookie banner too. */}
        <JsonLd data={orgLd()} />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site";
import { services } from "@/content/services";
import { faq } from "@/content/faq";
import { media } from "@/lib/media";
import { faqLd } from "@/lib/jsonld";
import JsonLd from "@/components/ui/JsonLd";
import PageHero from "@/components/sections/PageHero";
import ServiceChapter from "@/components/services/ServiceChapter";
import JourneyLine from "@/components/services/JourneyLine";
import ProcessTray from "@/components/sections/ProcessTray";
import Faq from "@/components/sections/Faq";
import ClosingForm from "@/components/sections/ClosingForm";
import s from "./services.module.css";

export const metadata: Metadata = {
  title: "Services: Paid Ads, Websites, AI Agents & Software",
  description: "Four services, one system: paid ads that bring the right people in, websites that win them over, AI agents that answer and book, and software that keeps it all organised. Fixed quote after a 20-minute call.",
  alternates: { canonical: "/services" },
};

const exampleMedia = {
  ad: media.has("/images/example-ad.webp"),
  adVideo: media.has("/video/example-ad.mp4"),
  hero: media.has("/images/example-site-hero.webp"),
  cut: media.has("/images/example-site-cut.webp"),
  colour: media.has("/images/example-site-colour.webp"),
};
const servicesFaq = faq.filter((f) => f.services);

// Services explains itself: the journey line in the hero, then each service with its moment from the
// story played once on real device UI (no 3D on this page), the process, the FAQ and the form.
export default function Services() {
  return (
    <>
      <PageHero lines={["Four services.", "One system."]} meta="Services" lead="Paid ads bring the right people in. A website wins them over. An AI agent answers and books. Software keeps it all organised. One team builds all four, to work together."
        media={<div className={s.journey}><JourneyLine /></div>}>
        <nav aria-label="The four services" className={s.jump}>
          {services.map((x) => <Link key={x.id} className="tlink" href={`#${x.id}`}><span className="mono accent">{String(x.order).padStart(2, "0")}</span> {x.title}</Link>)}
        </nav>
      </PageHero>
      {services.map((x, i) => <ServiceChapter key={x.id} service={x} media={exampleMedia} flip={i % 2 === 1} />)}
      <ProcessTray id="services-process" bookingUrl={site.bookingUrl} />
      <Faq items={servicesFaq} id="services-faq" />
      <ClosingForm bookingUrl={site.bookingUrl} id="services-closing" />
      <JsonLd data={faqLd(servicesFaq)} />
    </>
  );
}

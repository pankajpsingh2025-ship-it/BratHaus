import type { Metadata } from "next";
import Image from "next/image";
import { site } from "@/content/site";
import { team } from "@/content/team";
import PageHero from "@/components/sections/PageHero";
import Sheet from "@/components/sections/Sheet";
import StudioBeats from "@/components/sections/StudioBeats";
import ProcessTray from "@/components/sections/ProcessTray";
import Reveal from "@/components/ui/Reveal";
import { LogoSlot } from "@/components/three/slots";
import s from "./studio.module.css";

export const metadata: Metadata = {
  title: "Studio",
  description: "BratHaus is a small UK studio. We run the ads, build the website and set up the AI agents and software, so your customers never fall through the gaps.",
  alternates: { canonical: "/studio" },
};

// The Studio tells one story: a night hero with the 3D mark, then ivory all the way down (three
// beats, how a project runs, what you can count on, the CTA), then the night footer.
export default function StudioPage() {
  // real people only: shown once a published person with a photo exists
  const founder = team.find((p) => p.published && p.name && p.photo);
  const book = site.bookingUrl ? { href: site.bookingUrl, target: "_blank", rel: "noopener" } : { href: "/contact" };
  const promises = [site.promises.reply, site.promises.call, site.promises.quote, "You own everything we build"];
  return (
    <>
      <PageHero title="One studio for the whole journey." meta="The studio" tall
        lead="BratHaus is a small UK studio. We run the ads, build the website and set up the AI agents and software, so your customers never fall through the gaps."
        media={<div className={s.logo}><LogoSlot className={s.logoSlot} fit={0.9} /></div>} />

      <StudioBeats />

      <ProcessTray id="how-we-work" bookingUrl={site.bookingUrl} tone="light" />

      <Sheet id="count-on" className="section" innerClassName="page" thread={{ from: "left", to: "left" }} labelledBy="count-title">
        <Reveal id="count-title" className="t-h2">What you can count on.</Reveal>
        <ul className={s.promises}>
          {promises.map((p, i) => (
            <li key={p}><span className="mono accent">{String(i + 1).padStart(2, "0")}</span><p className="t-h3">{p}</p></li>
          ))}
        </ul>
        {founder && (
          <figure className={s.founder}>
            <div className="media" style={{ aspectRatio: "4 / 5" }}><Image src={founder.photo} alt={founder.name} fill sizes="(max-width: 860px) 100vw, 33vw" /></div>
            <figcaption><p className="t-h3">{founder.name}</p><p className="mono soft">{founder.role}</p></figcaption>
          </figure>
        )}
      </Sheet>

      <Sheet id="studio-cta" className={`section ${s.cta}`} innerClassName="page" labelledBy="studio-cta-title">
        <Reveal id="studio-cta-title" className="t-h2">Let&apos;s get your diary full.</Reveal>
        <div className={s.actions}>
          <a className="btn" {...book}>Book a 20-minute call <span className="arr" aria-hidden="true">→</span></a>
          <a className="tlink" href="/contact">Send a message <span className="arr" aria-hidden="true">→</span></a>
        </div>
      </Sheet>
    </>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { site } from "@/content/site";
import PageHero from "@/components/sections/PageHero";
import Sheet from "@/components/sections/Sheet";
import ContactForm from "@/components/contact/ContactForm";
import UkTime from "@/components/ui/UkTime";
import s from "./contact.module.css";

export const metadata: Metadata = {
  title: "Contact",
  description: "Tell us what you need. We reply within one working day: a 20-minute call, then a fixed quote before we start.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHero lines={["Let's get your", "diary full."]} meta="Contact" lead="Tell us what you need. We reply within one working day." />
      <Sheet id="enquiry" className="section" thread={{ from: "left", to: "left" }} label="Send an enquiry">
        <div className={`${s.split} page grid`}>
          <div className={s.side}>
            <h2 className="mono accent">What happens next</h2>
            <ol className={s.steps}>
              <li><span className="mono accent">01</span>We reply.</li>
              <li><span className="mono accent">02</span>A 20-minute call.</li>
              <li><span className="mono accent">03</span>A fixed quote.</li>
            </ol>
            <div className={s.meta}>
              <a className="tlink" href={`mailto:${site.email}`}>{site.email}</a>
              {site.bookingUrl
                ? <a className="tlink tlink--accent" href={site.bookingUrl} target="_blank" rel="noopener">Book a 20-minute call <span className="arr" aria-hidden="true">→</span></a>
                : <span className="soft">Booking link coming soon: email us and we&apos;ll find a time.</span>}
              <p className="mono soft">Based in the UK · <UkTime /></p>
            </div>
          </div>
          <div className={s.form}>
            <Suspense fallback={null}><ContactForm email={site.email} bookingUrl={site.bookingUrl} /></Suspense>
          </div>
        </div>
      </Sheet>
    </>
  );
}

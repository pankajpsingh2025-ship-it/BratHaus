import { Suspense } from "react";
import { site } from "@/content/site";
import Reveal from "@/components/ui/Reveal";
import ContactForm from "@/components/contact/ContactForm";
import Sheet from "./Sheet";
import s from "./ClosingForm.module.css";

// The last sheet: "Let's get your diary full." with the promises, and a short form that posts to the
// same contact API (and its honest fallback). Contact details as selectable text.
export default function ClosingForm({ bookingUrl, id = "closing", thread = { from: "right", to: "left" } }: { bookingUrl: string; id?: string; thread?: { from: "left" | "right"; to: "left" | "right" } | "none" }) {
  return (
    <Sheet id={id} className="section" thread={thread} labelledBy={`${id}-title`}>
      <div className={`${s.wrap} page grid`}>
        <div className={s.side}>
          <Reveal id={`${id}-title`} className="display t-section">Let&apos;s get your diary full.</Reveal>
          <ul className={`mono soft ${s.promises}`}>
            <li>{site.promises.reply}</li><li>{site.promises.call}</li><li>{site.promises.quote}</li>
          </ul>
          <p className={s.details}>
            <a className="tlink" href={`mailto:${site.email}`}>{site.email}</a><br />
            <span className="soft">Based in the UK</span>
          </p>
          {bookingUrl
            ? <a className="tlink tlink--accent" href={bookingUrl} target="_blank" rel="noopener">Prefer to talk? Book a call <span className="arr" aria-hidden="true">→</span></a>
            : <a className="tlink tlink--accent" href="/contact">Prefer to talk? Book a call <span className="arr" aria-hidden="true">→</span></a>}
        </div>
        <div className={s.form}>
          <Suspense fallback={null}><ContactForm variant="short" idPrefix={id} email={site.email} bookingUrl={bookingUrl} /></Suspense>
        </div>
      </div>
    </Sheet>
  );
}

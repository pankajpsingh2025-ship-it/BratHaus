import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import Sheet from "./Sheet";
import s from "./WaysToStart.module.css";

// Three ways in. No prices: every one gets a fixed quote after the call.
const WAYS = [
  { title: "20-minute call", text: "Free. Tell us what you need; we'll tell you straight what would help." },
  { title: "Launch", text: "Website + ads, to get the right people in and turn them into enquiries." },
  { title: "Grow", text: "AI agents + software, to answer, book and organise every customer automatically." },
];

export default function WaysToStart({ bookingUrl }: { bookingUrl: string }) {
  const book = bookingUrl ? { href: bookingUrl, target: "_blank", rel: "noopener" } : { href: "/contact" };
  return (
    <Sheet id="start" className="section" thread={{ from: "right", to: "right" }} labelledBy="start-title">
      <div className="page">
        <Reveal id="start-title" className={`display t-section ${s.title}`}>Ways to start.</Reveal>
        <ul className={s.cards}>
          {WAYS.map((w, i) => (
            <li key={w.title} className={s.card}>
              <span className="mono accent">{String(i + 1).padStart(2, "0")}</span>
              <h3 className={s.name}>{w.title}</h3>
              <p className="soft">{w.text}</p>
              <p className={`mono ${s.quote}`}>Fixed quote after the call.</p>
            </li>
          ))}
        </ul>
        <div className={s.actions}>
          <a className="btn" {...book}>Book a call <span className="arr" aria-hidden="true">→</span></a>
          <Link className="tlink" href="/contact">Send a message <span className="arr" aria-hidden="true">→</span></Link>
        </div>
      </div>
    </Sheet>
  );
}

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { services } from "@/content/services";
import { example, type ExampleMedia } from "@/content/example-business";
import DeviceFrame from "@/components/devices/DeviceFrame";
import PhoneScreens from "./ui/PhoneScreens";
import SiteStack from "./ui/SiteStack";
import TicketCard from "./ui/TicketCard";
import DashboardScreen from "./ui/DashboardScreen";
import s from "./StoryFlat.module.css";

// The story without real-time 3D (only when the 3D is "off" at startup: reduced motion, no WebGL2,
// Save-Data, ?3d=off, or a screen under 520px tall). Six calm sections in normal flow, the same words,
// and the REAL device UIs in CSS device frames: crisp at any size, never a desktop image on a phone.
export default function StoryFlat({ media, bookingUrl, h1, lead, label }: { media: ExampleMedia; bookingUrl: string; h1: string[]; lead: string; label: string }) {
  const ext = bookingUrl.startsWith("http") ? { target: "_blank", rel: "noopener" } : {};
  const visual = (id: string) => {
    if (id === "paid-ads") return (
      <div className={s.withChips}>
        <DeviceFrame kind="phone" label={`The ${example.short} ad in a social feed.`}><PhoneScreens media={media} mode="ad" active={false} /></DeviceFrame>
        <ul className={s.chips} aria-label={example.targetingLabel}>{example.targeting.map((t) => <li key={t}><i />{t}</li>)}</ul>
      </div>
    );
    if (id === "websites") return <DeviceFrame kind="browser" label={`The ${example.short} website.`}><SiteStack media={media} /></DeviceFrame>;
    if (id === "ai-agents") return (
      <div className={s.withTicket}>
        <DeviceFrame kind="phone" label={`An AI agent booking an appointment in the ${example.short} chat.`}><PhoneScreens media={media} mode="chat" /></DeviceFrame>
        <div className={`${s.ticket} device-ui`}><TicketCard /></div>
        <p className={`${s.caption} mono soft`}>{example.chat.label}</p>
      </div>
    );
    return <DeviceFrame kind="laptop" label={`The ${example.short} dashboard with the new booking.`}><DashboardScreen mode="full" /></DeviceFrame>;
  };
  return (
    <div className={`${s.flat} on-night`} data-story-flat>
      <section className={`${s.section} ${s.hero} page`} data-theme="night" aria-labelledby="flat-h1">
        <div className={s.text}>
          <p className="mono accent">{label}</p>
          <h1 id="flat-h1" className="display t-display">{h1.map((l) => <span key={l} className={s.line}>{l}</span>)}</h1>
          <p className="lead soft">{lead}</p>
          <div className={s.actions}>
            <a className="btn" href={bookingUrl} {...ext}>Book a 20-minute call <span className="arr" aria-hidden="true">→</span></a>
            <a className="tlink" href="#flat-paid-ads">Watch a customer arrive <span className="arr" aria-hidden="true">↓</span></a>
          </div>
        </div>
        <div className={s.logo}><img src="/brand/logo-3d-preview-front.webp" alt="The BratHaus mark in gold." width={1000} height={1000} /></div>
      </section>
      {services.map((x) => (
        <section key={x.id} id={`flat-${x.id}`} className={`${s.section} page`} data-theme="night" aria-labelledby={`flat-ch-${x.id}`}>
          <div className={s.text}>
            <p className="mono accent">{String(x.order).padStart(2, "0")} · {x.title}</p>
            <h2 id={`flat-ch-${x.id}`} className="t-h2">{x.chapterTitle}</h2>
            <p className="lead soft">{x.storyLine}</p>
            <Link className="tlink tlink--accent" href={`/services#${x.id}`}>{x.title} <span className="arr" aria-hidden="true">→</span></Link>
          </div>
          <div className={s.visual}>{visual(x.id)}<p className={`${s.example} mono soft`}>{example.label}</p></div>
        </section>
      ))}
      <section className={`${s.section} ${s.finale} page`} data-theme="night" aria-labelledby="flat-finale">
        <ol className={s.journey} aria-label="The journey">{["Ad", "Website", "AI agent", "Dashboard"].map((n) => <li key={n} className="mono">{n}</li>)}</ol>
        <h2 id="flat-finale" className="t-h2">One studio. From first click to booked customer.</h2>
        <div className={s.actions}>
          <a className="btn" href={bookingUrl} {...ext}>Book a 20-minute call <span className="arr" aria-hidden="true">→</span></a>
          <Link className="tlink" href="/work">See our work <span className="arr" aria-hidden="true">→</span></Link>
        </div>
      </section>
    </div>
  );
}

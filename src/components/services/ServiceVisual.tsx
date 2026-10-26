"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import type { ServiceId } from "@/content/services";
import { example, type ExampleMedia } from "@/content/example-business";
import DeviceFrame from "@/components/devices/DeviceFrame";
import PhoneScreens from "@/components/story/ui/PhoneScreens";
import SiteStack from "@/components/story/ui/SiteStack";
import TicketCard from "@/components/story/ui/TicketCard";
import DashboardScreen from "@/components/story/ui/DashboardScreen";
import { domBox } from "@/components/story/anchors";
import s from "./ServiceVisual.module.css";

// A service's moment from the home story, with no WebGL: the real device UI in a CSS device frame,
// leaning in CSS 3D. When it enters the screen it plays its moment ONCE:
//   paid ads  → the feed scrolls to the ad, then the three targeting chips appear beside it
//   websites  → the salon site's four layers settle into place
//   AI agents → the four messages arrive (typing dots before each reply), then "Booked ✓"
//   software  → Saturday 10:30 fills and the "New booking" toast appears
export default function ServiceVisual({ id, media, lean }: { id: ServiceId; media: ExampleMedia; lean: 1 | -1 }) {
  const root = useRef<HTMLDivElement>(null);
  const ui = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const el = root.current, u = ui.current; if (!el || !u) return;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const st = { trigger: el, start: "top 70%", once: true };
    const q = gsap.utils.selector(el);
    if (id === "paid-ads") {
      const phone = u.querySelector<HTMLElement>("[data-screen='phone']");
      // measured when it plays (the frame has its real size by then)
      const shift = () => { const ad = domBox(phone, "[data-ad]", 390, false); if (phone && ad) phone.style.setProperty("--feed-shift", `${ad.y - ad.h / 2 - 96}px`); };
      if (still) { shift(); gsap.set(phone, { "--feed": 1 }); return; }
      gsap.timeline({ scrollTrigger: st, onStart: shift })
        .fromTo(phone, { "--feed": 0 }, { "--feed": 1, duration: 1.4, ease: "power2.inOut" })
        .fromTo(q("[data-chip]"), { autoAlpha: 0, x: -12 }, { autoAlpha: 1, x: 0, duration: 0.7, ease: "expo.out", stagger: 0.12 }, "-=0.2");
    } else if (id === "websites") {
      if (still) return;
      gsap.fromTo(u.querySelectorAll("[data-layer]"), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: "expo.out", stagger: 0.08, scrollTrigger: st });
    } else if (id === "ai-agents") {
      const phone = u.querySelector<HTMLElement>("[data-screen='phone']");
      if (still) { gsap.set(phone, { "--msg": 4 }); return; }
      const tl = gsap.timeline({ scrollTrigger: st });
      tl.set(phone, { "--msg": 0, "--typing": 0 });
      [0, 1, 2, 3].forEach((i) => {
        if (i % 2 === 1) tl.to(phone, { "--typing": 1, duration: 0.15 }).to(phone, { "--typing": 0, duration: 0.15 }, "+=0.6");
        tl.to(phone, { "--msg": i + 1, duration: 0.5, ease: "power1.out" }, i % 2 === 1 ? "<" : "+=0.35");
      });
      tl.fromTo(q("[data-booked]"), { autoAlpha: 0, y: 20, scale: 0.96 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.8, ease: "expo.out" }, "+=0.2");
    } else {
      const dash = u.querySelector<HTMLElement>("[data-screen='dash']");
      if (still) { gsap.set(dash, { "--diary": 1, "--toast": 1, "--auto": 1 }); return; }
      gsap.timeline({ scrollTrigger: st, defaults: { ease: "power2.out" } })
        .fromTo(dash, { "--diary": 0 }, { "--diary": 1, duration: 0.9 }, 0.3)
        .fromTo(dash, { "--toast": 0 }, { "--toast": 1, duration: 0.6, ease: "expo.out" }, 0.9)
        .fromTo(dash, { "--auto": 0 }, { "--auto": 1, duration: 1, ease: "none" }, 1.2);
    }
  }, { scope: root, dependencies: [id] });

  const label = `${example.short}, the fictional example business:`;
  return (
    <div ref={root} className={`${s.visual} ${s[id.replace("-", "")] ?? ""}`}>
      {id === "paid-ads" && (
        <div className={s.adWrap}>
          <DeviceFrame kind="phone" tilt={lean} uiRef={ui} label={`${label} its ad in a social feed.`}><PhoneScreens media={media} mode="story" /></DeviceFrame>
          <ul className={s.chips} aria-label={example.targetingLabel}>{example.targeting.map((t) => <li key={t} data-chip><i />{t}</li>)}</ul>
        </div>
      )}
      {id === "websites" && <DeviceFrame kind="browser" tilt={lean} uiRef={ui} label={`${label} its website.`}><SiteStack media={media} /></DeviceFrame>}
      {id === "ai-agents" && (
        <div className={s.chatWrap}>
          <DeviceFrame kind="phone" tilt={lean} uiRef={ui} label={`${label} an AI agent booking an appointment in its chat.`}><PhoneScreens media={media} mode="chat" /></DeviceFrame>
          <div className={`${s.booked} device-ui`} data-booked><TicketCard /></div>
        </div>
      )}
      {id === "software" && <DeviceFrame kind="laptop" tilt={lean} uiRef={ui} label={`${label} its dashboard with a new booking.`}><DashboardScreen /></DeviceFrame>}
      <p className={`${s.caption} mono`}>{id === "ai-agents" ? `${example.chat.label} · ` : ""}{example.label}</p>
    </div>
  );
}

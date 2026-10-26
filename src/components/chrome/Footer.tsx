"use client";
import Link from "next/link";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { site } from "@/content/site";
import { services } from "@/content/services";
import Mark from "@/components/ui/Mark";
import s from "./Footer.module.css";

// Night again: the solid gold mark (a soft light sweeps across it once as the footer arrives) with
// "BratHaus" beside it, then the columns and the legal line.
export default function Footer({ bookingUrl }: { bookingUrl: string }) {
  const root = useRef<HTMLElement>(null);
  const sweep = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (!sweep.current || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(sweep.current, { "--sweep": "-60%" }, { "--sweep": "160%", duration: 1.8, ease: "power2.inOut", scrollTrigger: { trigger: root.current, start: "top 75%", once: true } });
  }, { scope: root });
  const book = bookingUrl ? { href: bookingUrl, target: "_blank", rel: "noopener" } : { href: "/contact" };
  return (
    <footer ref={root} className={`${s.footer} on-night`} data-theme="night">
      <div className={`${s.inner} page`}>
        <div className={s.brand}>
          <div ref={sweep} className={s.mark}><Mark className={s.markSvg} /></div>
          <p className={s.word} aria-hidden="true">BratHaus</p>
        </div>
        <div className={s.cols}>
          <nav aria-label="Pages">
            <p className="mono soft">Pages</p>
            <ul>{[{ href: "/", label: "Home" }, ...site.nav].map((n) => <li key={n.href}><Link className="tlink" href={n.href}>{n.label}</Link></li>)}</ul>
          </nav>
          <nav aria-label="Services">
            <p className="mono soft">Services</p>
            <ul>{services.map((x) => <li key={x.id}><Link className="tlink" href={`/services#${x.id}`}>{x.title}</Link></li>)}</ul>
          </nav>
          <div>
            <p className="mono soft">Contact</p>
            <ul>
              <li><a className="tlink" href={`mailto:${site.email}`}>{site.email}</a></li>
              <li><a className="tlink" {...book}>Book a call <span className="arr" aria-hidden="true">→</span></a></li>
              <li className="soft">Based in the UK</li>
              {Object.entries(site.socials).filter(([, u]) => u).map(([k, u]) => <li key={k}><a className="tlink" href={u} target="_blank" rel="noopener">{k}</a></li>)}
            </ul>
          </div>
        </div>
        <p className={`${s.legal} soft`}>
          © {site.year} BratHaus · <Link className="tlink" href="/privacy">Privacy</Link> · <Link className="tlink" href="/terms">Terms</Link> · Projects shown are concept builds for fictional brands. Marlow &amp; Finch is a fictional example.
        </p>
      </div>
    </footer>
  );
}

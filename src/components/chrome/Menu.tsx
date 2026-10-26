"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { scrollToTarget } from "@/lib/lenis";
import { site } from "@/content/site";
import { services } from "@/content/services";
import { Lockup } from "@/components/ui/Mark";
import { storyScrollY, useMenu } from "./menuStore";
import s from "./Menu.module.css";

// a moment in each chapter where its text is settled (chapters: 0.08 · 0.26 · 0.46 · 0.66 · 0.84)
const CHAPTER_AT = [0.15, 0.33, 0.56, 0.76, 0.91];

// Full-screen night overlay: the story's chapters (numbered) on the left, the pages on the right, the
// contact details at the bottom. Escape closes, focus stays inside, scroll is locked while open.
export default function Menu({ onClose, bookingUrl }: { onClose: () => void; bookingUrl: string }) {
  const { open } = useMenu();
  const pathname = usePathname();
  const root = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);
  useEffect(() => {
    const el = root.current; if (!el) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (open) {
      wasOpen.current = true;
      gsap.set(el, { visibility: "visible" });
      const tl = gsap.timeline()
        .fromTo(el, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: reduce ? 0 : 0.6, ease: "expo.inOut" })
        .from(el.querySelectorAll("[data-item]"), { autoAlpha: 0, y: 24, duration: reduce ? 0 : 0.7, stagger: 0.04, ease: "expo.out" }, "-=0.2");
      el.querySelector<HTMLElement>("[data-item] a, [data-item] button")?.focus({ preventScroll: true });
      return () => { tl.kill(); };
    } else if (wasOpen.current) {
      gsap.to(el, { clipPath: "inset(0 0 100% 0)", duration: reduce ? 0 : 0.5, ease: "expo.inOut", onComplete: () => { gsap.set(el, { visibility: "hidden" }); } });
    }
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab" || !root.current) return;
      const f = [...root.current.querySelectorAll<HTMLElement>("a, button")];
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [open, onClose]);

  const home = pathname === "/";
  const toChapter = (i: number) => {
    onClose();
    const y = storyScrollY(CHAPTER_AT[i]);
    if (y !== null) setTimeout(() => scrollToTarget(y), 350);
  };
  const book = bookingUrl ? { href: bookingUrl, target: "_blank", rel: "noopener" } : { href: "/contact" };
  return (
    <div ref={root} id="site-menu" className={`${s.menu} on-night`} role="dialog" aria-modal="true" aria-label="Menu" aria-hidden={!open} inert={!open}>
      <div className={`${s.top} page`}>
        <Link href="/" onClick={onClose} aria-label="BratHaus, home"><Lockup /></Link>
        <button type="button" className={s.close} onClick={onClose}>Close</button>
      </div>
      <div className={`${s.inner} page`}>
        <nav className={s.chapters} aria-label="The story">
          <p className="mono soft" data-item>The story</p>
          <ol>
            {services.map((x, i) => (
              <li key={x.id} data-item>
                {home
                  ? <button type="button" className={s.chapter} onClick={() => toChapter(i)}><span className="mono accent">{String(x.order).padStart(2, "0")}</span>{x.title}</button>
                  : <Link className={s.chapter} href={`/services#${x.id}`} onClick={onClose}><span className="mono accent">{String(x.order).padStart(2, "0")}</span>{x.title}</Link>}
              </li>
            ))}
            {home && (
              <li data-item><button type="button" className={s.chapter} onClick={() => toChapter(4)}><span className="mono accent">05</span>First click to booked</button></li>
            )}
          </ol>
        </nav>
        <nav className={s.pages} aria-label="Pages">
          <p className="mono soft" data-item>Pages</p>
          <ul>
            <li data-item><Link className={`${s.page} display`} href="/" onClick={onClose}>Home</Link></li>
            {site.nav.map((n) => <li key={n.href} data-item><Link className={`${s.page} display`} href={n.href} onClick={onClose}>{n.label}</Link></li>)}
          </ul>
        </nav>
        <div className={s.foot} data-item>
          <a className="tlink" href={`mailto:${site.email}`}>{site.email}</a>
          <span className="mono soft">Based in the UK · {site.promises.reply}</span>
          <a className="btn" {...book}>Book a call <span className="arr" aria-hidden="true">→</span></a>
        </div>
      </div>
    </div>
  );
}

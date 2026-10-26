"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { site } from "@/content/site";
import { Lockup } from "@/components/ui/Mark";
import { closeMenu, openMenu, useMenu } from "./menuStore";
import Menu from "./Menu";
import s from "./Header.module.css";

// Fixed, 64px (56px on phones), above everything but menus and modals. Its theme follows the section
// under the line through its middle (header[data-theme]); every colour comes from --header-bg and
// --header-fg. Fully clear only at the very top of the home hero; otherwise a blurred tint.
export default function Header({ bookingUrl }: { bookingUrl: string }) {
  const pathname = usePathname();
  const menu = useMenu();
  const [theme, setTheme] = useState<"night" | "ivory">("night");
  const [atTop, setAtTop] = useState(true);
  const btn = useRef<HTMLButtonElement>(null);
  const bar = useRef<HTMLElement>(null);

  // which section is under the header's middle line: the last themed element containing it wins
  // (later sections overlap earlier ones). Measured on scroll and resize, so it can never go stale.
  useEffect(() => {
    let raf = 0;
    const pick = () => {
      raf = 0;
      const line = (bar.current?.offsetHeight ?? 64) / 2;
      let t: "night" | "ivory" = "night";
      document.querySelectorAll<HTMLElement>("main [data-theme], footer[data-theme]").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top <= line && r.bottom > line && r.height > 0) t = el.dataset.theme === "ivory" ? "ivory" : "night";
      });
      setTheme(t);
      setAtTop(scrollY < 24);
    };
    const later = () => { if (!raf) raf = requestAnimationFrame(pick); };
    pick();
    addEventListener("scroll", later, { passive: true });
    addEventListener("resize", later);
    const mo = new MutationObserver(later);
    mo.observe(document.getElementById("main") ?? document.body, { childList: true, subtree: true });
    return () => { removeEventListener("scroll", later); removeEventListener("resize", later); mo.disconnect(); cancelAnimationFrame(raf); };
  }, [pathname]);
  useEffect(() => { document.documentElement.classList.toggle("menu-open", menu.open); }, [menu.open]);
  useEffect(() => { closeMenu(); }, [pathname]);

  const clear = theme === "night" && atTop && pathname === "/";
  const book = bookingUrl ? { href: bookingUrl, target: "_blank", rel: "noopener" } : { href: "/contact" };
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header ref={bar} className={`${s.hdr} ${theme === "ivory" ? "on-ivory" : "on-night"}`} data-theme={theme} data-clear={clear ? "" : undefined} data-chrome data-header>
        <Link href="/" className={s.brand} aria-label="BratHaus, home"><Lockup /></Link>
        <nav className={s.nav} aria-label="Main">
          {site.nav.map((n) => (
            <Link key={n.href} href={n.href} className={`${s.link} tlink`} aria-current={pathname.startsWith(n.href) ? "page" : undefined}>{n.label}</Link>
          ))}
          <a className="btn btn--small" {...book}>Book a call <span className="arr" aria-hidden="true">→</span></a>
        </nav>
        <button ref={btn} type="button" className={s.menuBtn} aria-expanded={menu.open} aria-controls="site-menu"
          onClick={() => openMenu({ chapters: pathname === "/" })}>
          Menu
        </button>
      </header>
      <Menu onClose={() => { closeMenu(); btn.current?.focus(); }} bookingUrl={bookingUrl} />
    </>
  );
}

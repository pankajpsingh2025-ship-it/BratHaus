"use client";
import Link from "next/link";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { services } from "@/content/services";
import Reveal from "@/components/ui/Reveal";
import TileArt from "./TileArt";
import Sheet from "./Sheet";
import s from "./ServiceTiles.module.css";

// "Four services. One system." Four square tiles, each demonstrating its own service. They're there
// at rest; when the grid reaches 80% of the screen they scatter in once and settle.
const ROT = [-6, 4, -3, 6];

export default function ServiceTiles() {
  const grid = useRef<HTMLUListElement>(null);
  useGSAP(() => {
    if (!grid.current || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const tiles = gsap.utils.toArray<HTMLElement>(grid.current.children);
    // only if the grid is still below the fold: never hide tiles someone is already looking at
    if (grid.current.getBoundingClientRect().top < innerHeight * 0.8) return;
    gsap.from(tiles, {
      opacity: 0, y: 60, rotation: (i) => ROT[i % 4], duration: 0.9, ease: "expo.out", stagger: 0.08, clearProps: "transform,opacity",
      scrollTrigger: { trigger: grid.current, start: "top 80%", once: true },
    });
  }, { scope: grid });
  return (
    <Sheet id="services" className="section" thread labelledBy="services-title">
      <div className={`${s.head} page grid`}>
        <Reveal id="services-title" className={`display t-section ${s.title}`}>Four services.<br />One system.</Reveal>
        <p className={`lead soft ${s.lead}`}>Each one works on its own. Together they take a stranger from first click to a booked, reminded, returning customer.</p>
      </div>
      <ul ref={grid} className={`${s.grid} page`}>
        {services.map((x) => (
          <li key={x.id} className={s.item}>
            <Link href={`/services#${x.id}`} className={s.link}>
              <span className={s.tile}><TileArt kind={x.tileAnimation} /></span>
              <span className={s.name}>{x.title}</span>
              <span className={`${s.line} soft`}>{x.tileLine}</span>
              <span className="tlink tlink--accent">Learn more <span className="arr" aria-hidden="true">→</span></span>
            </Link>
          </li>
        ))}
      </ul>
    </Sheet>
  );
}

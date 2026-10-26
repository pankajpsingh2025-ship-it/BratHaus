"use client";
import { useId, useState } from "react";
import type { Faq as Item } from "@/content/faq";
import Sheet from "./Sheet";
import s from "./Faq.module.css";

// Two columns: a sticky "Before you ask" on the left, numbered questions on the right.
export default function Faq({ items, id = "faq", thread = { from: "right", to: "left" } }: { items: Item[]; id?: string; thread?: { from: "left" | "right"; to: "left" | "right" } | "none" }) {
  const [open, setOpen] = useState<number | null>(0);
  const base = useId().replace(/:/g, "");
  return (
    <Sheet id={id} className="section" thread={thread} labelledBy={`${id}-title`}>
      <div className={`${s.wrap} page grid`}>
        <div className={s.side}>
          <h2 id={`${id}-title`} className="t-h2">Before you ask</h2>
          <p className="soft">Straight answers. Anything else, ask us on the call.</p>
        </div>
        <ol className={s.list}>
          {items.map((f, i) => {
            const on = open === i;
            return (
              <li key={f.q} className={`${s.item} ${on ? s.on : ""}`}>
                <h3>
                  <button type="button" className={s.q} aria-expanded={on} aria-controls={`${base}-${i}`} id={`${base}-q${i}`} onClick={() => setOpen(on ? null : i)}>
                    <span className={`mono ${s.n}`}>{String(i + 1).padStart(2, "0")}</span>
                    <span className={s.qText}>{f.q}</span>
                    <span className={s.icon} aria-hidden="true"><i /><i /></span>
                  </button>
                </h3>
                <div id={`${base}-${i}`} role="region" aria-labelledby={`${base}-q${i}`} className={s.a} hidden={!on}>
                  <p className="soft">{f.a}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </Sheet>
  );
}

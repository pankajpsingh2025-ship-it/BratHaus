"use client";
import { useState } from "react";
import WorkRows, { type WorkItem } from "@/components/sections/WorkRows";
import s from "./WorkIndex.module.css";

// Filter chips (only for tags a project actually has) over the alternating rows.
export default function WorkIndex({ items, tags }: { items: WorkItem[]; tags: string[] }) {
  const [tag, setTag] = useState<string>("All");
  const shown = tag === "All" ? items : items.filter((p) => p.tags.includes(tag));
  return (
    <div className="page">
      <div className={s.chips} role="group" aria-label="Filter the work">
        {["All", ...tags].map((t) => (
          <button key={t} type="button" className={`${s.chip} ${tag === t ? s.on : ""}`} aria-pressed={tag === t} onClick={() => setTag(t)}>{t}</button>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">{shown.length} {shown.length === 1 ? "project" : "projects"}</p>
      <WorkRows key={tag} items={shown} />
    </div>
  );
}

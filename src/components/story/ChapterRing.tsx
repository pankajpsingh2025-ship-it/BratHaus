"use client";
import s from "./ChapterRing.module.css";

// The chapter's number and name beside a small ring that fills with the chapter's progress; it
// updates at each chapter boundary and opens the chapter menu. Bottom-left on landscape (beside
// "Skip the story"); on portrait just the number and ring, in the device zone's top-right corner.
const C = 2 * Math.PI * 12;

export default function ChapterRing({ chapter, chapters, onOpen, compact = false }: {
  chapter: { index: number; within: number };
  chapters: { n: string; label: string }[];
  onOpen: () => void;
  compact?: boolean;
}) {
  const i = chapter.index;
  const c = chapters[Math.max(0, Math.min(chapters.length - 1, i - 1))];
  return (
    <button type="button" className={`${s.ring} ${compact ? s.compact : ""}`} data-on={i > 0 ? "" : undefined} data-ring onClick={onOpen} tabIndex={i > 0 ? 0 : -1}>
      <svg viewBox="0 0 28 28" aria-hidden="true">
        <circle cx="14" cy="14" r="12" className={s.bg} />
        <circle cx="14" cy="14" r="12" className={s.fg} style={{ strokeDasharray: C, strokeDashoffset: C * (1 - chapter.within) }} />
      </svg>
      <span className="mono">{compact ? c.n : `${c.n} · ${c.label}`}</span>
      <span className="sr-only">{compact ? ` · ${c.label}` : ""}: open the chapter menu</span>
    </button>
  );
}

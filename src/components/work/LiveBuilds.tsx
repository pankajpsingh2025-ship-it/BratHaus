"use client";
import { useState } from "react";
import VideoCard from "@/components/shared/VideoCard";
import LiveModal from "@/components/shared/LiveModal";
import type { LiveBuild } from "@/components/shared/LivePreview";
import s from "./LiveBuilds.module.css";

export type Build = { slug: string; name: string; sector: string; kind: string; line: string; demo?: string | null; video?: string | null; poster?: string | null; external?: boolean };

// Every build from src/data/builds.json that has a live demo, as cards: the video, the name, the
// label and "Try it live". The parent hides the section when there are none.
export default function LiveBuilds({ builds }: { builds: Build[] }) {
  const [live, setLive] = useState<LiveBuild | null>(null);
  return (
    <>
      <ul className={s.list}>
        {builds.map((b) => (
          <li key={b.slug} className={s.card}>
            <div className={s.media}>{b.poster && <VideoCard poster={b.poster} video={b.video} alt="" sizes="(max-width: 860px) 100vw, 50vw" cursor="TRY IT LIVE" />}</div>
            <p className="mono soft">{b.sector} · {b.kind}</p>
            <h3 className={s.name}>{b.name}</h3>
            <p className="soft">{b.line}</p>
            <div className={s.actions}>
              <button type="button" className="btn" data-cursor="TRY IT LIVE" onClick={() => setLive({ name: b.name, demo: b.demo, video: b.video, poster: b.poster, kind: b.kind, external: b.external })}>Try it live <span className="arr" aria-hidden="true">→</span></button>
              {b.demo && <a className="tlink" href={b.demo} target="_blank" rel="noopener">Open in a new tab <span aria-hidden="true">↗</span></a>}
            </div>
          </li>
        ))}
      </ul>
      <LiveModal build={live} onClose={() => setLive(null)} />
    </>
  );
}

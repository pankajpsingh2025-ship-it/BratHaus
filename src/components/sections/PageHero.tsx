import type { ReactNode } from "react";
import Reveal from "@/components/ui/Reveal";
import s from "./PageHero.module.css";

// Every inner page opens at night: a mono meta line, the serif title (each line rises from a mask),
// one line, and an optional 3D moment or image. The day sheets follow.
export default function PageHero({ title, lines, meta, lead, children, media, id = "page-title", tall = false }: {
  title?: string; lines?: string[]; meta?: string; lead?: string; children?: ReactNode; media?: ReactNode; id?: string; tall?: boolean;
}) {
  return (
    <section className={`${s.hero} ${media ? s.withMedia : ""} ${tall ? s.tall : ""} on-night`} data-theme="night" aria-labelledby={id}>
      {media && <div className={s.media}>{media}</div>}
      <div className={`${s.copy} page`}>
        {meta && <p className="mono soft">{meta}</p>}
        <Reveal as="h1" id={id} className={`display ${s.title}`} onLoad>{lines ? lines.map((l, i) => <span key={i} className={s.line}>{l}</span>) : title}</Reveal>
        {lead && <p className="lead soft measure">{lead}</p>}
        {children}
      </div>
    </section>
  );
}

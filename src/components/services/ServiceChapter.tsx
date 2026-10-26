import Link from "next/link";
import type { Service } from "@/content/services";
import type { ExampleMedia } from "@/content/example-business";
import Sheet from "@/components/sections/Sheet";
import ServiceVisual from "./ServiceVisual";
import s from "./ServiceChapter.module.css";

// One service, on the day sheet in normal flow (no pins, no 3D): the words in columns 1–5, its moment
// from the story in columns 7–12 (sides alternate; on phones the visual comes first). No prices, no
// promised results.
export default function ServiceChapter({ service: x, media, flip }: { service: Service; media: ExampleMedia; flip: boolean }) {
  return (
    <Sheet id={x.id} className={`section ${s.chapter}`} innerClassName={`${s.inner} ${flip ? s.flip : ""} page grid`} labelledBy={`${x.id}-title`}>
      <div className={s.text}>
        <p className="mono accent">{String(x.order).padStart(2, "0")} · {x.title}</p>
        <h2 id={`${x.id}-title`} className="t-h2">{x.chapterTitle}</h2>
        <p className="lead soft">{x.lead}</p>
        <div className={s.block}>
          <h3 className={`t-ui ${s.blockTitle}`}>What you get</h3>
          <ul className={s.list}>{x.whatYouGet.map((w) => <li key={w}>{w}</li>)}</ul>
        </div>
        <div className={s.block}>
          <h3 className={`t-ui ${s.blockTitle}`}>Good for</h3>
          <p>{x.goodFor}</p>
        </div>
        <Link className="btn" href={`/contact?interest=${x.interest}`}>{x.cta} <span className="arr" aria-hidden="true">→</span></Link>
      </div>
      <div className={s.visual}><ServiceVisual id={x.id} media={media} lean={flip ? 1 : -1} /></div>
    </Sheet>
  );
}

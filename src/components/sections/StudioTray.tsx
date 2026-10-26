import Image from "next/image";
import Link from "next/link";
import Mark from "@/components/ui/Mark";
import Sheet from "./Sheet";
import s from "./StudioTray.module.css";

// A night tray inside a day sheet: the studio, in a few lines. No attributed quotes, no team photos
// unless they're real.
export default function StudioTray({ desk }: { desk: string | null }) {
  return (
    <Sheet id="studio" className="section" thread={{ from: "left", to: "right" }} labelledBy="studio-title">
      <div className={`${s.tray} on-night`}>
        <div className={s.media}>
          {desk
            ? <Image src={desk} alt="The BratHaus desk." fill sizes="(max-width: 860px) 100vw, 45vw" style={{ objectFit: "cover" }} />
            : <span className="ph" aria-hidden="true"><Mark height={56} /></span>}
        </div>
        <div className={s.copy}>
          <p className="mono accent">The studio</p>
          <h2 id="studio-title" className="lead">A small UK studio that builds the whole customer journey, so you deal with one team, not four suppliers.</h2>
          <p className={`display ${s.big}`}>We don&apos;t just build websites. We fill diaries.</p>
          <Link className="tlink tlink--accent" href="/studio">About the studio <span className="arr" aria-hidden="true">→</span></Link>
        </div>
      </div>
    </Sheet>
  );
}

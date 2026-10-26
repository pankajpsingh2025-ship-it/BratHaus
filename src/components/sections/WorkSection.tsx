import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import WorkRows, { type WorkItem } from "./WorkRows";
import Sheet from "./Sheet";
import s from "./WorkSection.module.css";

// "Built by BratHaus": the three concept builds as alternating rows, then every live build.
export default function WorkSection({ items, liveCount }: { items: WorkItem[]; liveCount: number }) {
  return (
    <Sheet id="work" className="section" thread={{ from: "left", to: "left" }} labelledBy="work-title">
      <div className={`${s.head} page`}>
        <Reveal id="work-title" className="display t-section">Built by BratHaus.</Reveal>
        <p className="mono soft">Concept builds for fictional brands · every one of them live</p>
      </div>
      <div className="page"><WorkRows items={items} /></div>
      {liveCount > 0 && (
        <p className={`${s.more} page`}><Link className="tlink tlink--accent" href="/work#live">Every build, live ({liveCount}) <span className="arr" aria-hidden="true">→</span></Link></p>
      )}
    </Sheet>
  );
}

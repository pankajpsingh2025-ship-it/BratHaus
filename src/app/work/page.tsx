import type { Metadata } from "next";
import { site } from "@/content/site";
import { projects, liveBuilds, WORK_TAGS } from "@/content/projects";
import { workItem } from "@/lib/work";
import PageHero from "@/components/sections/PageHero";
import Sheet from "@/components/sections/Sheet";
import ClosingForm from "@/components/sections/ClosingForm";
import WorkIndex from "@/components/work/WorkIndex";
import LiveBuilds from "@/components/work/LiveBuilds";

export const metadata: Metadata = {
  title: "Work: Concept Builds, Every One Live",
  description: "Websites, real-time 3D and AI agents built by BratHaus as concept builds for fictional brands. Open any of them live and click around.",
  alternates: { canonical: "/work" },
};

const items = projects.map(workItem);
// a filter chip only for tags at least one project really has
const tags = WORK_TAGS.filter((t) => projects.some((p) => p.tags.includes(t)));

export default function Work() {
  return (
    <>
      <PageHero title="Work" meta="Concept builds for fictional brands · every one of them live" lead="Built in-house to show what we make. Open any of them and click around: they're real, working sites." />
      <Sheet id="all-work" className="section" thread={{ from: "left", to: "right" }} labelledBy="all-work-title">
        <h2 id="all-work-title" className="sr-only">All work</h2>
        <WorkIndex items={items} tags={[...tags]} />
      </Sheet>
      {liveBuilds.length > 0 && (
        <Sheet id="live" className="section" thread={{ from: "right", to: "left" }} labelledBy="live-title">
          <div className="page">
            <p className="mono accent">Live</p>
            <h2 id="live-title" className="display t-section" style={{ margin: "14px 0 clamp(40px, 7svh, 80px)" }}>Every build, live.</h2>
            <LiveBuilds builds={liveBuilds} />
          </div>
        </Sheet>
      )}
      <ClosingForm bookingUrl={site.bookingUrl} id="work-closing" />
    </>
  );
}

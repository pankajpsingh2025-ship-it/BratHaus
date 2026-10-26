import { site } from "@/content/site";
import { featured, liveBuilds } from "@/content/projects";
import { faq } from "@/content/faq";
import { media } from "@/lib/media";
import { workItem } from "@/lib/work";
import { faqLd } from "@/lib/jsonld";
import JsonLd from "@/components/ui/JsonLd";
import Journey from "@/components/story/Journey";
import Statement from "@/components/sections/Statement";
import ServiceTiles from "@/components/sections/ServiceTiles";
import ProcessTray from "@/components/sections/ProcessTray";
import WorkSection from "@/components/sections/WorkSection";
import StudioTray from "@/components/sections/StudioTray";
import WaysToStart from "@/components/sections/WaysToStart";
import Faq from "@/components/sections/Faq";
import ClosingForm from "@/components/sections/ClosingForm";

// Home: the story at night (one customer, four services, in 3D), then the day: calm editorial sheets
// that slide up over each other, a gold line running down their margin to the footer's mark.
const exampleMedia = {
  ad: media.has("/images/example-ad.webp"),
  adVideo: media.has("/video/example-ad.mp4"),
  hero: media.has("/images/example-site-hero.webp"),
  cut: media.has("/images/example-site-cut.webp"),
  colour: media.has("/images/example-site-colour.webp"),
};
const work = featured.map(workItem);
const desk = media.studioDesk();

export default function Home() {
  return (
    <>
      <JsonLd data={faqLd(faq)} />
      <Journey media={exampleMedia} bookingUrl={site.bookingUrl} />
      <Statement />
      <ServiceTiles />
      <ProcessTray bookingUrl={site.bookingUrl} />
      <WorkSection items={work} liveCount={liveBuilds.length} />
      <StudioTray desk={desk} />
      <WaysToStart bookingUrl={site.bookingUrl} />
      <Faq items={faq} />
      <ClosingForm bookingUrl={site.bookingUrl} />
    </>
  );
}

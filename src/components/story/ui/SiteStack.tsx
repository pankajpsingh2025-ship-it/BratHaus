import type { CSSProperties } from "react";
import type { ExampleMedia } from "@/content/example-business";
import SalonSiteDesktop, { type SiteLayer } from "./SalonSiteDesktop";

// Marlow & Finch's desktop site as one flat page: its four layers stacked (for the CSS devices).
// Each layer carries data-layer, so a page can animate them settling into place.
export default function SiteStack({ media }: { media: ExampleMedia }) {
  return (
    <div style={{ position: "relative", width: 1280, height: 800 }}>
      {([0, 1, 2, 3] as SiteLayer[]).map((i) => (
        <div key={i} data-layer={i} style={{ position: "absolute", inset: 0 } as CSSProperties}><SalonSiteDesktop layer={i} media={media} /></div>
      ))}
    </div>
  );
}

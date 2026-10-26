import { example, type ExampleMedia } from "@/content/example-business";
import Slotted from "./Slotted";
import s from "./screens.module.css";

// Marlow & Finch's desktop site as four 1280 × 800 layers that can separate in depth (the
// "exploded" moment): 0 background + nav + hero image, 1 headline, 2 service cards, 3 booking button.
// Layers 1–3 are transparent so, stacked flat, they read as one ordinary web page.
export type SiteLayer = 0 | 1 | 2 | 3;

export default function SalonSiteDesktop({ layer, media }: { layer: SiteLayer; media: ExampleMedia }) {
  if (layer === 0) {
    return (
      <div className={`${s.site} ${s.siteBg}`}>
        <div className={s.siteHero}><Slotted slot="example-site-hero" src={media.hero ? example.site.hero : null} tone="green" /></div>
        <header className={s.siteNav}><b>{example.short}</b><nav>{example.site.nav.map((n) => <span key={n}>{n}</span>)}</nav></header>
        <p className={s.siteFoot}>{example.site.location}</p>
      </div>
    );
  }
  if (layer === 1) {
    return (
      <div className={s.site}>
        <div className={s.siteHead}><h3>{example.site.headline}</h3><p>{example.site.sub}</p></div>
      </div>
    );
  }
  if (layer === 2) {
    return (
      <div className={s.site}>
        <div className={s.siteCards}>
          {example.site.services.map((x, i) => (
            <div key={x.name} className={s.siteCard}>
              <div className={s.siteThumb}>
                <Slotted slot={x.image ? x.image.split("/").pop()!.replace(".webp", "") : "treatments"} src={x.image && (i === 0 ? media.cut : media.colour) ? x.image : null} tone={i === 1 ? "blush" : "cream"} />
              </div>
              <span><b>{x.name}</b><small>{x.line}</small></span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className={s.site}>
      <span className={s.siteBtn} data-anchor="site-btn">{example.site.cta} <span aria-hidden="true">→</span></span>
    </div>
  );
}

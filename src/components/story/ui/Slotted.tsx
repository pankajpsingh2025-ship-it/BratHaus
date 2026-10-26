/* eslint-disable @next/next/no-img-element */
import AutoVideo from "@/components/shared/AutoVideo";
import s from "./screens.module.css";

// A media slot inside the example business's UI: the owner's image or video when it exists,
// otherwise a designed placeholder in Marlow & Finch's colours with the brass M&F monogram at 18%
// and a fine grain. It never prints the slot's name (the report lists the missing files instead).
// (Inside a drei <Html> screen, so a plain <img>: next/image can't optimise inside a CSS 3D layer.)
// Videos play only while on screen and `active` (the story passes whether it's showing), never with
// reduced motion.
export default function Slotted({ src, video, tone = "green", active = true }: { slot?: string; src: string | null; video?: string | null; tone?: "green" | "blush" | "cream"; active?: boolean }) {
  if (video) return <AutoVideo className={s.media} src={video} poster={src ?? undefined} active={active} />;
  if (src) return <img className={s.media} src={src} alt="" decoding="async" />;
  return (
    <div className={`${s.mph} ${s[`mph_${tone}`]}`} aria-hidden="true">
      <span className={s.mphArt}>M&amp;F</span>
    </div>
  );
}

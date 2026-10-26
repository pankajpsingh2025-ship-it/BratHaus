import { type CSSProperties, type Ref } from "react";
import { MARK_PATHS, MARK_VIEWBOX, type MarkPart } from "@/content/brand";

// The BratHaus mark, always solid (fill: currentColor), from the logo kit's three parts. `partRef`
// lets the preloader and footer animate the parts; nothing ever draws it as an outline.
export default function Mark({ size, height, className = "", title, style, partRef }: {
  size?: number; height?: number; className?: string; title?: string; style?: CSSProperties;
  partRef?: (part: MarkPart) => Ref<SVGPathElement>;
}) {
  const h = height ?? size;
  const w = h ? (h * 140) / 172 : undefined;
  return (
    <svg className={className} width={w} height={h} viewBox={MARK_VIEWBOX} fill="currentColor" style={style}
      role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      {(Object.keys(MARK_PATHS) as MarkPart[]).map((k) => <path key={k} ref={partRef?.(k)} d={MARK_PATHS[k]} data-part={k} />)}
    </svg>
  );
}

export function Lockup({ className = "" }: { className?: string }) {
  return (
    <span className={`lockup ${className}`}>
      <Mark className="lockup__mark" height={26} />
      <span className="lockup__word">BratHaus</span>
    </span>
  );
}

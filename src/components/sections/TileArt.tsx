import type { TileAnimation } from "@/content/services";
import s from "./TileArt.module.css";

// Each service tile demonstrates its own service, in a small looping drawing (CSS only, paused for
// reduced motion): targeting rings, a wireframe that fills into a page, a reply that books, a week
// that fills up.
const DOTS: [number, number][] = [[100, 92], [88, 106], [112, 110], [104, 120], [92, 84], [140, 70], [60, 128], [150, 132], [56, 72], [122, 158], [76, 160], [160, 96], [40, 104], [130, 40], [70, 44], [168, 150]];

function Rings() {
  return (
    <svg viewBox="0 0 200 200" className={`${s.art} device-ui`} aria-hidden="true">
      {[80, 56, 32].map((r, i) => <circle key={r} cx="100" cy="100" r={r} className={i === 2 ? s.ringIn : s.ring} />)}
      {DOTS.map(([x, y], i) => {
        const inner = Math.hypot(x - 100, y - 100) < 32;
        return <circle key={i} cx={x} cy={y} r={inner ? 4 : 3} className={inner ? s.dotIn : s.dot} style={{ animationDelay: `${i * 0.18}s` }} />;
      })}
    </svg>
  );
}

function Wireframe() {
  return (
    <svg viewBox="0 0 200 200" className={`${s.art} device-ui`} aria-hidden="true">
      <rect x="28" y="36" width="144" height="128" rx="8" className={s.frame} />
      <line x1="28" y1="52" x2="172" y2="52" className={s.frame} />
      {/* wire → filled, then back */}
      <rect x="40" y="64" width="68" height="10" rx="3" className={s.wire} />
      <rect x="40" y="64" width="68" height="10" rx="3" className={s.fill} />
      <rect x="40" y="80" width="52" height="6" rx="3" className={s.wire} />
      <rect x="40" y="80" width="52" height="6" rx="3" className={`${s.fill} ${s.d1}`} />
      <rect x="40" y="94" width="34" height="10" rx="4" className={s.wire} />
      <rect x="40" y="94" width="34" height="10" rx="4" className={`${s.fillAccent} ${s.d2}`} />
      <rect x="118" y="64" width="42" height="40" rx="5" className={s.wire} />
      <rect x="118" y="64" width="42" height="40" rx="5" className={`${s.fillImage} ${s.d1}`} />
      {[40, 84, 128].map((x, i) => (
        <g key={x}>
          <rect x={x} y="118" width="32" height="34" rx="4" className={s.wire} />
          <rect x={x} y="118" width="32" height="34" rx="4" className={`${s.fill} ${[s.d2, s.d3, s.d4][i]}`} />
        </g>
      ))}
    </svg>
  );
}

function Reply() {
  return (
    <svg viewBox="0 0 200 200" className={`${s.art} device-ui`} aria-hidden="true">
      <rect x="70" y="40" width="96" height="30" rx="15" className={s.bubbleThem} />
      <g className={s.typing}>
        <rect x="34" y="88" width="56" height="28" rx="14" className={s.bubbleUs} />
        {[50, 62, 74].map((x, i) => <circle key={x} cx={x} cy="102" r="3.5" className={s.typingDot} style={{ animationDelay: `${i * 0.15}s` }} />)}
      </g>
      <g className={s.reply}>
        <rect x="34" y="88" width="112" height="44" rx="16" className={s.bubbleUs} />
        <rect x="48" y="100" width="70" height="6" rx="3" className={s.lineInk} />
        <rect x="48" y="114" width="48" height="6" rx="3" className={s.lineInk} />
      </g>
      <g className={s.tick}>
        <circle cx="148" cy="156" r="16" className={s.tickBg} />
        <path d="M140 156 l6 6 l11 -12" className={s.tickMark} />
      </g>
    </svg>
  );
}

function Week() {
  const cells = Array.from({ length: 24 }, (_, i) => i);
  const fill = [3, 9, 12, 17, 6, 20];
  return (
    <svg viewBox="0 0 200 200" className={`${s.art} device-ui`} aria-hidden="true">
      {cells.map((i) => {
        const x = 30 + (i % 6) * 24, y = 52 + Math.floor(i / 6) * 26;
        const k = fill.indexOf(i);
        const last = i === 15;
        return (
          <g key={i}>
            <rect x={x} y={y} width="20" height="22" rx="4" className={s.cell} />
            {(k >= 0 || last) && <rect x={x} y={y} width="20" height="22" rx="4" className={last ? s.cellHot : s.cellOn} style={{ animationDelay: `${last ? 2.6 : k * 0.35}s` }} />}
          </g>
        );
      })}
      {["M", "T", "W", "T", "F", "S"].map((d, i) => <text key={i} x={40 + i * 24} y="42" className={s.day}>{d}</text>)}
    </svg>
  );
}

export default function TileArt({ kind }: { kind: TileAnimation }) {
  if (kind === "rings") return <Rings />;
  if (kind === "wireframe") return <Wireframe />;
  if (kind === "reply") return <Reply />;
  return <Week />;
}

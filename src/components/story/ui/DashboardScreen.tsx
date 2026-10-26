import type { CSSProperties } from "react";
import { example } from "@/content/example-business";
import s from "./screens.module.css";

// Marlow & Finch's dashboard on the laptop: diary, toast, automations, a small chart (ILLUSTRATIVE,
// no numbers on the axes). State comes in as --diary, --toast and --auto. 1280 × 800.
const d = example.dashboard;
const BARS = [38, 52, 44, 66, 58, 74, 62];

export default function DashboardScreen({ mode = "story" }: { mode?: "story" | "full" }) {
  return (
    <div className={s.dash} data-screen="dash" data-mode={mode}>
      <aside className={s.dashNav}>
        <div className={s.dashBrand}><span className={s.adAvatarSm}>{example.initials}</span>{d.title}</div>
        {d.nav.map((n, i) => <span key={n} data-on={i === 0 ? "" : undefined}>{n}</span>)}
      </aside>
      <section className={s.dashMain}>
        <div className={s.dashTitle}><h4>Diary</h4><small>This week</small></div>
        <div className={s.diary}>
          <span />
          {d.week.map((w, di) => <span key={w} data-d={di}>{w}</span>)}
          {d.hours.map((h, hi) => (
            <Row key={h} hour={h} hi={hi} />
          ))}
        </div>
      </section>
      <aside className={s.dashSide}>
        <div className={s.panel}>
          <h5>Automations</h5>
          {d.automations.map((a, i) => {
            const [what, rest] = a.split(" ✓ ");
            return <div key={a} className={s.auto} style={{ "--i": i } as CSSProperties}><b>✓</b><span>{what} · {rest}</span></div>;
          })}
        </div>
        <div className={s.panel}>
          <h5>Clients</h5>
          <div className={s.clients}>{["Sophie", "New this week", "Returning"].map((c) => <div key={c}><i />{c}</div>)}</div>
        </div>
        <div className={s.panel}>
          <h5>Reports</h5>
          <div className={s.chart} aria-hidden="true">{BARS.map((b, i) => <i key={i} style={{ height: `${b}%` }} />)}</div>
          <span className={s.illustrative}>Illustrative</span>
        </div>
      </aside>
      <div className={s.toast}><i />{d.toast}</div>
    </div>
  );
}

function Row({ hour, hi }: { hour: string; hi: number }) {
  return (
    <>
      <span data-h={hi}>{hour}</span>
      {d.week.map((_, di) => {
        const e = d.entries.find(([x, y]) => x === di && y === hi);
        const isNew = d.newBooking.day === di && d.newBooking.hour === hi;
        return (
          <div key={di} className={s.cell} data-slot={isNew ? "new" : undefined} data-d={di} data-h={hi}>
            {e && <div className={s.entry} data-entry>{e[2]}</div>}
            {isNew && <div className={s.newEntry}>{d.newBooking.label}</div>}
          </div>
        );
      })}
    </>
  );
}

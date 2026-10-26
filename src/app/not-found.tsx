import Link from "next/link";
import { LogoSlot } from "@/components/three/slots";
import s from "./not-found.module.css";

// 404: a night hero with the 3D mark.
export default function NotFound() {
  return (
    <section className={`${s.lost} on-night`} data-theme="night" aria-labelledby="lost-title">
      <div className={s.logo}><LogoSlot className={s.slot} fit={0.8} /></div>
      <div className={`${s.copy} page`}>
        <p className="mono soft">404 · Page not found</p>
        <h1 id="lost-title" className="t-display">This page didn&apos;t make it into the diary.</h1>
        <div className={s.actions}>
          <Link className="btn" href="/">Home <span className="arr" aria-hidden="true">→</span></Link>
          <Link className="tlink" href="/work">See our work <span className="arr" aria-hidden="true">→</span></Link>
        </div>
      </div>
    </section>
  );
}

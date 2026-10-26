import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { projects, projectBySlug } from "@/content/projects";
import { site } from "@/content/site";
import { media } from "@/lib/media";
import { workLd } from "@/lib/jsonld";
import JsonLd from "@/components/ui/JsonLd";
import PageHero from "@/components/sections/PageHero";
import Sheet from "@/components/sections/Sheet";
import ClipMedia from "@/components/sections/ClipMedia";
import ClosingForm from "@/components/sections/ClosingForm";
import CaseLaptop from "@/components/case/CaseLaptop";
import PhoneStrip from "@/components/case/PhoneStrip";
import AutoVideo from "@/components/shared/AutoVideo";
import s from "./case.module.css";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = projectBySlug((await params).slug);
  if (!p) return {};
  return { title: `${p.name}: concept build`, description: `${p.line} A concept build for a fictional brand by BratHaus.`, alternates: { canonical: `/work/${p.slug}` } };
}

// params are read inside Suspense so moving between case studies stays instant
export default function CasePage({ params }: { params: Promise<{ slug: string }> }) {
  return <Suspense fallback={<div className={s.wait} aria-busy="true" />}><Case params={params} /></Suspense>;
}

async function Case({ params }: { params: Promise<{ slug: string }> }) {
  const p = projectBySlug((await params).slug);
  if (!p) notFound();
  const next = projects[(projects.indexOf(p) + 1) % projects.length];
  const hero = media.workHero(p.slug) ?? p.screens[0].src;
  const loop = media.workLoop(p.slug);
  // the hero backdrop: the owner's cinematic loop when there is one, else the hero render, else the screenshot
  const film = media.workFilm(p.slug);
  const filmPoster = film && media.first(film.replace(/\.mp4$/, ".jpg"));
  const backdrop = filmPoster ?? hero;
  const meta = [...p.meta.map((m) => m.toUpperCase()), "CONCEPT BUILD"].join(" · ");
  return (
    <article>
      <div className={s.backdrop} aria-hidden="true">
        <Image src={backdrop} alt="" fill priority sizes="100vw" style={{ objectFit: "cover" }} />
        {film && <AutoVideo className={s.film} src={film} poster={filmPoster ?? undefined} />}
      </div>
      <PageHero title={p.name} meta={meta} lead={p.line} id="case-title" tall />
      <CaseLaptop build={{ name: p.name, demo: p.demo, video: p.video, poster: p.poster, kind: p.kind }} video={loop} image={hero} />

      <Sheet id="overview" className="section" thread={{ from: "left", to: "left" }} labelledBy="overview-title">
        <div className={`${s.overview} page grid`}>
          <dl className={s.meta}>
            {([["Sector", p.sector], ["Services", p.services.join(" · ")], ["Built with", p.builtWith], ["Status", p.kind]] as const).map(([k, v]) => (
              <div key={k}><dt className="mono soft">{k}</dt><dd>{v}</dd></div>
            ))}
          </dl>
          <div className={s.text}>
            <h2 id="overview-title" className="mono accent">Overview</h2>
            <p className="lead">{p.overview}</p>
          </div>
        </div>
      </Sheet>

      <Sheet id="passes" className="section" thread={{ from: "left", to: "right" }} labelledBy="passes-title">
        <div className="page">
          <h2 id="passes-title" className="display t-section">Built in clear passes.</h2>
          <ol className={s.passes}>
            {p.passes.map((x, i) => (
              <li key={x.title} className={s.pass}>
                <span className="mono accent">Pass {String(i + 1).padStart(2, "0")}</span>
                <h3 className={s.passTitle}>{x.title}</h3>
                <p className="soft">{x.text}</p>
                <ul className={s.tags}>{x.deliverables.map((d) => <li key={d} className="mono">{d}</li>)}</ul>
              </li>
            ))}
          </ol>
        </div>
      </Sheet>

      <Sheet id="screens" className="section" thread={{ from: "right", to: "right" }} labelledBy="screens-title">
        <div className="page">
          <h2 id="screens-title" className="sr-only">Screens</h2>
          <div className={s.gallery}>
            {p.screens.map((x) => (
              <figure key={x.src}>
                <ClipMedia src={x.src} alt={x.alt} />
                <figcaption className="mono soft">{x.alt.replace(/^.*?concept: /, "")}</figcaption>
              </figure>
            ))}
          </div>
          <div className={s.phones}>
            <div className={s.phonesHead}>
              <p className="mono accent">On the phone</p>
              <h2 className="display t-section">Made for the small screen.</h2>
              <p className="soft">Captured from the live build at 390 × 844.</p>
            </div>
            <PhoneStrip shots={p.mobileScreens} />
          </div>
        </div>
      </Sheet>

      <Sheet id="cro" className="section" thread={{ from: "right", to: "left" }} label="Challenge, response and outcome">
        <div className={`${s.cro} page`}>
          {([["Challenge", p.challenge], ["Response", p.response], ["Outcome", p.outcome]] as const).map(([k, v]) => (
            <div key={k}><h2 className={`display ${s.croTitle}`}>{k}</h2><p className="lead soft">{v}</p></div>
          ))}
        </div>
      </Sheet>

      <Sheet id="next" theme="night" label={`Next project: ${next.name}`}>
        <Link href={`/work/${next.slug}`} className={s.next} data-cursor="VIEW">
          <span className={s.nextMedia}>
            <Image src={media.workHero(next.slug) ?? next.screens[0].src} alt="" fill sizes="100vw" style={{ objectFit: "cover" }} />
          </span>
          <span className={`${s.nextCopy} page`}>
            <span className="mono soft">Next project · {next.sector} · Concept build</span>
            <span className={`display ${s.nextName}`}>{next.name}</span>
          </span>
        </Link>
      </Sheet>
      <ClosingForm bookingUrl={site.bookingUrl} id="case-closing" />
      <JsonLd data={workLd(p)} />
    </article>
  );
}

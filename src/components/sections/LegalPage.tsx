import type { ReactNode } from "react";
import { site } from "@/content/site";
import PageHero from "./PageHero";
import Sheet from "./Sheet";
import s from "./LegalPage.module.css";

// Privacy and Terms: a clean day template. Both are templates to be reviewed before launch, and say so.
export default function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <PageHero title={title} meta="Template, to be reviewed before launch" />
      <Sheet className="section" label={title}>
        <article className={`${s.prose} page`}>
          <p className="mono soft">Last updated {site.year}</p>
          {children}
        </article>
      </Sheet>
    </>
  );
}

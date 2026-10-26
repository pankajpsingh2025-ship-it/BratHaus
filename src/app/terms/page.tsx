import type { Metadata } from "next";
import { site } from "@/content/site";
import LegalPage from "@/components/sections/LegalPage";

export const metadata: Metadata = { title: "Terms of use", description: "The terms that apply to using the BratHaus website.", alternates: { canonical: "/terms" } };

// TEMPLATE: to be reviewed (ideally by a qualified adviser) before launch.
export default function Terms() {
  return (
    <LegalPage title="Terms of use.">

      <p>These terms apply to your use of this website, operated by {site.name} in the {site.location}. By using the site you accept them. Separate written terms apply to any project we agree to deliver for you.</p>

      <h2>The work shown here</h2>
      <p>Unless stated otherwise, the projects on this site are concept builds for fictional brands, made by us to show what we can build. They are not client work, and any names, figures or conversations in them are invented for illustration.</p>

      <h2>Using the site</h2>
      <ul>
        <li>You may view and share pages for personal or internal business use.</li>
        <li>Don&apos;t copy, resell or reuse our designs, code, text or images without written permission.</li>
        <li>Don&apos;t misuse the site: no attempts to break it, overload it or send spam through the contact form.</li>
      </ul>

      <h2>Information on the site</h2>
      <p>We keep the content accurate and up to date, but it is general information, not advice, and we don&apos;t guarantee it is complete. Prices are never quoted on this site: every project gets a fixed written quote first.</p>

      <h2>Links to other sites</h2>
      <p>Where we link to other websites we have no control over their content and aren&apos;t responsible for it.</p>

      <h2>Liability</h2>
      <p>Nothing in these terms limits liability that can&apos;t be limited by law. Otherwise, we aren&apos;t liable for any loss arising from use of this website.</p>

      <h2>Law</h2>
      <p>These terms are governed by the law of England and Wales, and the courts of England and Wales have jurisdiction.</p>

      <h2>Contact</h2>
      <p>Questions about these terms: <a href={`mailto:${site.email}`}>{site.email}</a>.</p>
    </LegalPage>
  );
}

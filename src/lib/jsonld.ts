import { site } from "@/content/site";
import type { Faq } from "@/content/faq";
import type { Project } from "@/content/projects";

export const orgLd = () => ({
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: site.name,
  url: site.siteUrl,
  email: site.email,
  description: site.description,
  areaServed: { "@type": "Country", name: "GB" },
  sameAs: Object.values(site.socials).filter(Boolean),
});
export const faqLd = (items: Faq[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
});
export const workLd = (p: Project) => ({
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  name: `${p.name} (concept build)`,
  about: p.sector,
  description: p.overview,
  creator: { "@type": "Organization", name: site.name, url: site.siteUrl },
  dateCreated: String(p.year),
  url: `${site.siteUrl}/work/${p.slug}`,
});

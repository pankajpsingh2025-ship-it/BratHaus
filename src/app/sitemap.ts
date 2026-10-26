import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { projects } from "@/content/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/work", "/services", "/studio", "/contact", "/privacy", "/terms"];
  return [
    ...pages.map((p) => ({ url: `${site.siteUrl}${p}`, changeFrequency: "monthly" as const, priority: p === "" ? 1 : p === "/privacy" || p === "/terms" ? 0.3 : 0.8 })),
    ...projects.map((p) => ({ url: `${site.siteUrl}/work/${p.slug}`, changeFrequency: "yearly" as const, priority: 0.7 })),
  ];
}

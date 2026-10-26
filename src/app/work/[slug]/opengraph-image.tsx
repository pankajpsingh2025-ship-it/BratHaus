import { ogImage, OG_SIZE } from "@/lib/og";
import { projects, projectBySlug } from "@/content/projects";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "A BratHaus concept build.";
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const p = projectBySlug((await params).slug);
  return ogImage({ title: p?.name ?? "Concept build", kicker: p ? `${p.sector} · Concept build` : "Concept build", poster: p?.poster });
}

import type { Project } from "@/content/projects";
import type { WorkItem } from "@/components/sections/WorkRows";
import { media } from "./media";

// A project, with its media resolved on the server: the owner's renders first, then screenshots.
export function workItem(p: Project): WorkItem {
  return {
    slug: p.slug, name: p.name, line: p.line, sector: p.sector, services: p.services, builtWith: p.builtWith, kind: p.kind, tags: p.tags,
    hero: media.workHero(p.slug), heroAlt: p.hero.alt, phone: media.workPhone(p.slug),
    video: media.workLoop(p.slug), demo: p.demo, poster: p.poster,
  };
}

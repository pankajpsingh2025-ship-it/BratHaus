// The case studies. Every project here is a CONCEPT BUILD for a fictional brand,
// made in-house to show what BratHaus can build. Never add clients, results,
// numbers or reviews that aren't real.
// Copy ported from the previous site's projects.js; demo/video/poster merged
// from src/data/builds.json (written by `npm run builds`).
import builds from "@/data/builds.json";

export const WORK_TAGS = ["Websites", "3D", "AI agents", "Software", "Paid ads"] as const;
export type WorkTag = (typeof WORK_TAGS)[number];
export type Pass = { title: string; text: string; deliverables: string[] };
export type Shot = { src: string; alt: string };
export type Project = {
  slug: string;
  name: string;
  sector: string;
  meta: string[];
  year: number;
  kind: "Concept build";
  /** the work-filter tags (only real ones) */
  tags: WorkTag[];
  builtWith: string;
  line: string;
  overview: string;
  services: string[];
  deliverables: string[];
  challenge: string;
  response: string;
  outcome: string;
  passes: Pass[];
  hero: Shot;
  screens: Shot[];
  mobileScreens: Shot[];
  poster: string;
  video: string | null;
  demo: string | null;
  featured: boolean;
};

type Build = { slug: string; demo?: string | null; video?: string | null; poster?: string | null };
const buildFor = (slug: string): Build | undefined => (builds.builds as Build[]).find((b) => b.slug === slug);

const base: Omit<Project, "poster" | "video" | "demo" | "mobileScreens">[] = [
  {
    slug: "wren-ashby",
    tags: ["Websites"],
    builtWith: "Vite · GSAP · Lenis",
    name: "Wren & Ashby",
    sector: "Independent estate agent, Bath",
    meta: ["Estate agent", "3D web", "2026"],
    year: 2026,
    kind: "Concept build",
    line: "An estate agency whose home page is the viewing: walk through a Georgian townhouse at dusk before you ever pick up the phone.",
    overview:
      "An estate agency whose home page is the viewing. Visitors walk through a Georgian townhouse at dusk, room by room, and understand why a small local agent is the careful choice before they ever pick up the phone.",
    services: ["Strategy", "Art direction", "Website", "3D web"],
    deliverables: ["Five-section website", "Scroll-driven 3D entrance", "Time-of-day viewer", "Valuation form"],
    challenge:
      "Independent estate agents compete with national chains that outspend them on marketing many times over. How does a small agency feel like the careful, local choice before anyone picks up the phone?",
    response:
      "Make the home page a viewing. One camera move takes you through the front door, the rooms run sideways like a walk-through, and a slider shows the house from morning to night.",
    outcome:
      "A working prototype for a fictional brand, live in this portfolio: open it and try it. No real agency has used it, so there are no client results to report.",
    passes: [
      { title: "Frame the idea", text: "Reframed the home page as a viewing, because showing people round is what a good agent does best.", deliverables: ["Positioning", "Page structure", "Art direction"] },
      { title: "Build the walk-through", text: "Scrolling pushes through the front door of the townhouse into a warm hall; the rooms run sideways, each drawn in line as you arrive.", deliverables: ["Scroll-driven entrance", "Room-by-room gallery", "Motion system"] },
      { title: "Make it useful", text: "A time-of-day slider shows how the house feels at seven in the morning and nine at night, and a valuation form validates clearly and says plainly it's a demo.", deliverables: ["Time-of-day viewer", "Valuation form", "Honest demo states"] },
    ],
    hero: { src: "/work/wren-ashby-hero.webp", alt: "A miniature Georgian townhouse facade with a green door and glowing windows on a gold plinth against black." },
    screens: [
      { src: "/work/wren-ashby-screen-1.webp", alt: "Wren & Ashby concept: the home page, a Georgian townhouse at dusk under the headline Come inside." },
      { src: "/work/wren-ashby-screen-2.webp", alt: "Wren & Ashby concept: the time-of-day section, where buyers drag the house from morning to evening." },
    ],
    featured: true,
  },
  {
    slug: "mereway",
    tags: ["Websites"],
    builtWith: "Vite · GSAP · Lenis",
    name: "Mereway",
    sector: "Home insurance",
    meta: ["Insurance", "Interaction", "2026"],
    year: 2026,
    kind: "Concept build",
    line: "A home insurer told through the weather: live rain, a dome that keeps the house dry, and claims in plain English.",
    overview:
      "A home insurer that explains itself through the weather: rain you can wipe away, a dome that keeps you dry and claims in plain English. Proof that even the least glamorous category can be unforgettable.",
    services: ["Narrative", "Website", "Interaction design"],
    deliverables: ["Interactive hero", "Wipe-to-clear claims story", "Cover explainer", "Quote form"],
    challenge:
      "Insurance is bought on price and remembered only when something goes wrong. How does an insurer make people feel covered rather than sold to, and explain claims in plain English?",
    response:
      "Build the whole story on one idea: insurance is weather, and we keep you dry. Rain splashes off a dome that follows your pointer; claims are a window you wipe clear.",
    outcome:
      "A working prototype for a fictional insurer, live in this portfolio. No real customers, so there are no client results to report.",
    passes: [
      { title: "One idea", text: "Built the whole story on one idea: insurance is weather, and we keep you dry.", deliverables: ["Concept", "Messaging", "Page structure"] },
      { title: "Make it live", text: "Rain falls across the hero and splashes off a dome that follows the visitor's pointer, keeping the house beneath it dry.", deliverables: ["Live rain hero", "Pointer interaction"] },
      { title: "Plain English", text: "Visitors wipe the fog off a window to read how claims work; cover and claims stay calm and readable, and the quote form is honest about being a demo.", deliverables: ["Wipe-to-clear section", "Claims timeline", "Quote form"] },
    ],
    hero: { src: "/work/mereway-hero.webp", alt: "A polished gold umbrella in falling rain on a dark wet floor." },
    screens: [
      { src: "/work/mereway-screen-1.webp", alt: "Mereway concept: the home page, live rain falling around a glowing dome that keeps a house dry." },
      { src: "/work/mereway-screen-2.webp", alt: "Mereway concept: the claims section, where the visitor wipes fog off the glass." },
    ],
    featured: true,
  },
  {
    slug: "aurelith",
    tags: ["Websites", "3D"],
    builtWith: "Vite · Three.js · GSAP · Lenis",
    name: "Aurelith",
    sector: "Fine jewellery atelier",
    meta: ["Jewellery", "Real-time 3D", "2026"],
    year: 2026,
    kind: "Concept build",
    line: "A jewellery atelier with a real-time 3D gold ring that follows the scroll and turns admirers into consultations.",
    overview:
      "A jewellery atelier with a real-time 3D gold ring that follows the scroll, designed to make browsing feel bespoke and to turn admirers into consultation bookings.",
    services: ["Brand world", "Website", "Real-time 3D"],
    deliverables: ["Real-time 3D ring", "Fanned collection", "Craft story", "Consultation form"],
    challenge:
      "Fine jewellery online usually means a grid of product photos. How does a small atelier feel tactile and bespoke on a screen, and turn browsing into consultation bookings?",
    response:
      "Let one object carry the brand: an 18k gold ring with a brilliant-cut diamond, rendered live, that spins in, tilts to the pointer and travels with the story.",
    outcome:
      "A working prototype for a fictional atelier, live in this portfolio. No sales or bookings, so there are no client results to report.",
    passes: [
      { title: "A motion language", text: "Set a slow, deliberate motion language: nothing bounces, everything settles.", deliverables: ["Motion principles", "Type and palette"] },
      { title: "The ring", text: "Modelled an 18k gold ring with a brilliant-cut diamond in Three.js, using real glass refraction, choreographed to travel with the scroll.", deliverables: ["Real-time 3D", "Scroll choreography"] },
      { title: "From browsing to booking", text: "A fanned collection opens on hover or keyboard focus, a gold thread draws itself through the craft story, and the consultation form is honest about being a demo.", deliverables: ["Collection", "Craft story", "Consultation form"] },
    ],
    hero: { src: "/work/aurelith-hero.webp", alt: "A gold ring with a single diamond on a black stone plinth with a soft reflection." },
    screens: [
      { src: "/work/aurelith-screen-1.webp", alt: "Aurelith concept: the landing page, a real-time 3D gold ring with a diamond in front of the wordmark." },
      { src: "/work/aurelith-screen-2.webp", alt: "Aurelith concept: the collection, four ring cards fanned like a hand of cards." },
    ],
    featured: true,
  },
  {
    slug: "oakmere",
    tags: ["Websites", "AI agents"],
    builtWith: "Vite · GSAP · Lenis",
    name: "Oakmere Dental",
    sector: "Dental clinic",
    meta: ["Dental clinic", "AI receptionist", "2026"],
    year: 2026,
    kind: "Concept build",
    line: "A clinic whose AI receptionist answers, triages and books patients in seconds, at any hour.",
    overview:
      "A dental clinic whose AI receptionist answers, triages and books patients in seconds, at any hour, then hands the morning's diary to the team.",
    services: ["AI receptionist", "Online booking", "Website"],
    deliverables: ["AI receptionist (scripted demo)", "Tap-to-book slots", "Night-shift story", "New-patient form"],
    challenge:
      "Dental practices lose patients to the phone: lines are busy at nine, closed at six, and toothache doesn't keep office hours. How does a clinic answer every patient instantly, without hiring a night shift?",
    response:
      "Put the receptionist at the centre of the home page, so the first thing a patient can do is ask. It triages, offers real slots and holds one in seconds.",
    outcome:
      "A working prototype for a fictional clinic, live in this portfolio: talk to the receptionist. No real practice has used it, so there are no client results to report.",
    passes: [
      { title: "Ask first", text: "Put the receptionist at the centre of the home page, so the first thing a patient can do is ask, not search.", deliverables: ["Page structure", "Conversation design"] },
      { title: "Triage and book", text: "Scripted it to triage: pain and breaks go to the day's emergency slots, routine visits to the next free check-up; booking is slots you tap, with a confirmation card.", deliverables: ["Triage flow", "Tap-to-book", "Confirmation"] },
      { title: "The night shift", text: "Told the story of an example night of enquiries handled while the practice was closed, and wrote every demo state honestly.", deliverables: ["Night-shift story", "Honest demo states"] },
    ],
    hero: { src: "/work/oakmere-hero.webp", alt: "A modern dental clinic reception after hours, with an oak desk and blue evening light at the window." },
    screens: [
      { src: "/work/oakmere-screen-1.webp", alt: "Oakmere Dental concept: the home page with the AI receptionist chat open beside the headline." },
      { src: "/work/oakmere-screen-2.webp", alt: "Oakmere Dental concept: an example night of enquiries handled while the practice was closed." },
    ],
    featured: false,
  },
];

export const projects: Project[] = base.map((p) => {
  const b = buildFor(p.slug);
  return {
    ...p,
    poster: b?.poster || p.screens[0].src,
    video: b?.video || null,
    demo: b?.demo || null,
    mobileScreens: [1, 2, 3, 4, 5].map((n) => ({ src: `/work/${p.slug}-mobile-${n}.webp`, alt: `${p.name} concept on a phone, screen ${n}.` })),
  };
});

export const featured = projects.filter((p) => p.featured);
export const projectBySlug = (slug: string) => projects.find((p) => p.slug === slug);
export const liveBuilds = (builds.builds as (Build & { name: string; sector: string; kind: string; line: string })[]).filter((b) => b.demo);

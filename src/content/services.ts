// The services, in the order of the home story. Add a service here and the menu, the story's
// chapter labels, the service tiles, the services page and the contact chips pick it up.
// No prices: every project gets a fixed quote after a 20-minute call. No promised results anywhere.
export type ServiceId = "paid-ads" | "websites" | "ai-agents" | "software";
export type TileAnimation = "rings" | "wireframe" | "reply" | "week";

export type Service = {
  id: ServiceId;
  order: number;
  title: string;          // "Paid ads"
  chapterTitle: string;   // the story chapter: "Seen by the right people."
  storyLine: string;      // the one sentence under the chapter title
  lead: string;           // services page and tiles
  tileLine: string;       // one line under the tile
  whatYouGet: string[];
  howItWorks: [string, string, string];
  goodFor: string;
  tileAnimation: TileAnimation;
  cta: string;            // "Talk about paid ads"
  interest: string;       // ?interest= value on /contact
};

export const services: Service[] = [
  {
    id: "paid-ads", order: 1, title: "Paid ads",
    chapterTitle: "Seen by the right people.",
    storyLine: "Google, Instagram and Facebook ads aimed at the customers who matter, with every pound tracked.",
    lead: "Campaigns aimed at the customers who matter, run from accounts you own, with every pound tracked and reported in plain English.",
    tileLine: "The right people, nearby, at the right time.",
    whatYouGet: ["Google Search & Performance Max", "Meta: Facebook & Instagram", "Landing pages", "Conversion tracking", "Monthly reports in plain English"],
    howItWorks: ["We agree who your best customers are and where they look.", "We build the campaigns, landing pages and tracking.", "We run, test and report every month, in plain English."],
    goodFor: "Businesses ready to put budget behind growth, and wanting to see where every pound goes.",
    tileAnimation: "rings", cta: "Talk about paid ads", interest: "paid-ads",
  },
  {
    id: "websites", order: 2, title: "Websites",
    chapterTitle: "Won over in seconds.",
    storyLine: "Fast, beautiful websites that make you the obvious choice, and turn visits into bookings.",
    lead: "Fast, beautiful websites that make you the obvious choice, and turn visits into bookings and enquiries.",
    tileLine: "Designed, built and found on Google.",
    whatYouGet: ["Strategy & copy", "Bespoke design", "Development", "Immersive 3D where it earns its place", "SEO foundations", "Hosting & care"],
    howItWorks: ["We plan the pages and the words around what your customers need to know.", "We design and build it, and show you as we go.", "We launch, track and look after it."],
    goodFor: "Businesses whose current site undersells them, or who don't have one yet.",
    tileAnimation: "wireframe", cta: "Talk about websites", interest: "websites",
  },
  {
    id: "ai-agents", order: 3, title: "AI agents",
    chapterTitle: "Answered at 23:47. Booked by 23:48.",
    storyLine: "AI agents that reply in seconds on your website, WhatsApp and email, qualify every enquiry and book it straight in, day or night.",
    lead: "AI agents that reply in seconds, ask the right questions and book the appointment, day or night, and hand anything unusual to you.",
    tileLine: "Replies in seconds, books it in.",
    whatYouGet: ["Website chat, WhatsApp & email assistants", "Lead qualification", "Booking & reminders", "Follow-ups & review requests", "Internal assistants trained on your documents"],
    howItWorks: ["We learn your services, prices, diary and tone of voice.", "We set up the agent where your customers already message you.", "We watch the conversations and keep improving the answers."],
    goodFor: "Busy teams who miss enquiries out of hours or between jobs.",
    tileAnimation: "reply", cta: "Talk about AI agents", interest: "ai-agents",
  },
  {
    id: "software", order: 4, title: "Software",
    chapterTitle: "Everything lands in one place.",
    storyLine: "Custom dashboards, diaries and tools that keep bookings, clients and reminders organised automatically.",
    lead: "Custom dashboards, diaries, portals and tools shaped around how your business actually works.",
    tileLine: "Bookings, clients and reminders, organised.",
    whatYouGet: ["Client portals", "Dashboards & diaries", "Booking & quoting tools", "Integrations between your existing tools"],
    howItWorks: ["We map how work moves through your business today.", "We build the tool around it, one useful piece at a time.", "We connect it to what you already use and train your team."],
    goodFor: "Teams running the business on spreadsheets, inboxes and copy-paste.",
    tileAnimation: "week", cta: "Talk about software", interest: "software",
  },
];

export const serviceById = (id: string) => services.find((s) => s.id === id);

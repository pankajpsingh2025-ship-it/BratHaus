// The home story's EXAMPLE BUSINESS. Marlow & Finch Hair Studio is FICTIONAL: it exists only to show
// the four services working together on one customer. Every string the story uses is here, so the
// owner can change the example in one place. No star ratings, reviews, review counts or customer
// numbers, ever. No street address or phone number, so it can't be mistaken for a real business.
export const example = {
  name: "Marlow & Finch Hair Studio",
  short: "Marlow & Finch",
  initials: "M&F",
  town: "Bath",
  label: "Example business · Fictional",

  colours: { green: "#23362B", cream: "#F4EFE6", brass: "#B08D57", blush: "#E9D2C6" },

  // chapter 01: the ad, in a generic social feed (no real platform branding)
  ad: {
    sponsored: "Sponsored",
    line: "Autumn colour, booked in a minute.",
    cta: "Book now",
    image: "/images/example-ad.webp",
    video: "/video/example-ad.mp4",
  },
  targeting: ["Within 5 miles of Bath", "Interested in hair & beauty", "Weekday evenings"],
  targetingLabel: "Example targeting",

  // chapter 02: the salon's own website
  site: {
    nav: ["Services", "Stylists", "Book"],
    headline: "Hair that feels like you.",
    sub: "Cuts, colour and care in the heart of Bath.",
    cta: "Book online",
    hero: "/images/example-site-hero.webp",
    services: [
      { name: "Cut", line: "Precision cuts and restyles", image: "/images/example-site-cut.webp" },
      { name: "Colour", line: "Balayage, gloss and full colour", image: "/images/example-site-colour.webp" },
      { name: "Treatments", line: "Bond repair and scalp care", image: null as string | null },
    ],
    location: "Bath",
  },

  // chapter 03: the AI agent on the salon's website chat
  chat: {
    header: "Marlow & Finch · Assistant",
    label: "Example conversation",
    messages: [
      { from: "customer" as const, time: "23:47", text: "Hi! Have you got anything Saturday for a cut and colour?" },
      { from: "agent" as const, time: "23:47", text: "Hi Sophie! Saturday I can do 10:30 with Jess or 14:15 with Amir. Which suits you?" },
      { from: "customer" as const, time: "23:48", text: "10:30 please" },
      { from: "agent" as const, time: "23:48", text: "Done ✓ Cut and colour with Jess, Saturday 10:30. Confirmation sent to your phone." },
    ],
  },
  booking: { status: "Booked ✓", day: "Saturday", time: "10:30", service: "Cut & colour", with: "with Jess" },

  // chapter 04: the salon's dashboard
  dashboard: {
    title: "Marlow & Finch",
    nav: ["Diary", "Clients", "Messages", "Reports"],
    week: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    hours: ["09:00", "10:30", "12:00", "13:30", "15:00", "16:30"],
    // a few existing (fictional) diary entries, as [day index, hour index, label]
    entries: [[0, 1, "Cut · Amir"], [1, 3, "Colour · Jess"], [2, 0, "Gloss · Jess"], [3, 4, "Cut · Amir"], [4, 2, "Treatment · Jess"], [5, 4, "Cut · Amir"]] as [number, number, string][],
    newBooking: { day: 5, hour: 1, label: "Sophie · Cut & colour · Jess · via AI agent" },
    toast: "New booking from your AI agent",
    automations: ["Reminder · Friday 10:30 ✓ scheduled", "Review request · after visit ✓ scheduled"],
  },
};

export type ExampleMedia = { ad: boolean; adVideo: boolean; hero: boolean; cut: boolean; colour: boolean };

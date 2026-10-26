// Everything about the studio that the owner may want to change lives here.
export const site = {
  name: "BratHaus",
  tagline: "Websites that win. Automations that work.",
  description:
    "BratHaus is a UK studio. We run your ads, build your website, and set up AI agents and software that answer, book and organise every customer.",
  // The owner's promises (to confirm). Keep them only while they're true.
  promises: {
    reply: "Reply within one working day",
    call: "20-minute call",
    quote: "Fixed quote before we start",
  },
  email: process.env.CONTACT_TO_EMAIL || "hello@brathaus.example",
  bookingUrl: process.env.NEXT_PUBLIC_BOOKING_URL || "",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://brathaus.co.uk",
  location: "United Kingdom",
  year: 2026,
  // Empty strings are hidden.
  socials: { instagram: "", linkedin: "", x: "" } as Record<string, string>,
  nav: [
    { href: "/work", label: "Work" },
    { href: "/services", label: "Services" },
    { href: "/studio", label: "Studio" },
    { href: "/contact", label: "Contact" },
  ],
};

export const hasBooking = () => Boolean(site.bookingUrl);

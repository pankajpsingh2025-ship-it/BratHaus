// Honest answers. The owner should confirm anything marked PLACEHOLDER before launch.
export type Faq = { q: string; a: string; services?: boolean };
export const faq: Faq[] = [
  { q: "What does it cost?", a: "Every project gets a fixed quote after a 20-minute call. The price depends on what you need: the pages, the features, the integrations or the campaigns. You'll know the full cost before we start, and there are no surprise invoices.", services: true },
  // PLACEHOLDER: owner to confirm typical timescales before launch.
  { q: "How long does it take?", a: "It depends on the scope, so we agree a timeline with your fixed quote and keep you updated at every stage. A website moves faster than custom software. (Typical timescales to be confirmed.)", services: true },
  { q: "What is an AI agent, exactly?", a: "Software that handles the repetitive parts of winning work: replying to enquiries in seconds, asking the right questions, booking appointments into your diary, sending reminders and following up. You stay in control, and anything unusual is handed to a person.", services: true },
  { q: "Who pays for the ads?", a: "You do, directly. Campaigns run from your own Google and Meta ad accounts, which you own, so the spend goes straight to the platforms and you can see every pound. We manage them, and our fee for that is separate and agreed up front.", services: true },
  { q: "Do I own my website and data?", a: "Yes. The site, the content, your customer data, the code we write for you and the domain are yours. If you ever move on, we hand everything over." },
  { q: "Can you work with my existing tools?", a: "Usually, yes. We connect to the calendars, inboxes, messaging apps, CRMs and booking or payment tools most businesses already use, and we'll tell you plainly on the first call if anything won't fit." },
  { q: "Can we start small?", a: "Absolutely. Many businesses start with a website or one agent and add the rest once it's working. Everything is built to grow with you." },
];

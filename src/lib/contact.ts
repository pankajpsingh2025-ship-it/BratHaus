import { z } from "zod";

// One schema for the form and the API, so the browser and the server agree.
export const NEEDS = ["Paid ads", "Website", "AI agents", "Software", "Not sure"] as const;
export const TIMELINES = ["ASAP", "Within a month", "1–3 months", "Just exploring"] as const;
export const BUDGETS = ["Under £2k", "£2k–£5k", "£5k–£10k", "£10k+", "Not sure yet"] as const;
// ?interest= values from links across the site, mapped to the chips they pre-select.
export const INTEREST: Record<string, (typeof NEEDS)[number][]> = {
  "ai-agents": ["AI agents"],
  websites: ["Website"],
  software: ["Software"],
  "paid-ads": ["Paid ads"],
  // older links
  automation: ["AI agents"],
  search: ["Paid ads"],
  grow: ["Website", "Paid ads"],
};

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please tell us your name.").max(100),
  email: z.string().trim().email("Please enter a valid email address.").max(200),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  business: z.string().trim().max(120).optional().or(z.literal("")),
  website: z.string().trim().max(200).optional().or(z.literal("")),
  needs: z.array(z.enum(NEEDS)).max(NEEDS.length).default([]),
  timeline: z.enum(TIMELINES).optional().or(z.literal("")),
  budget: z.enum(BUDGETS).optional().or(z.literal("")),
  message: z.string().trim().min(30, "A little more detail helps: at least 30 characters.").max(4000),
  consent: z.literal(true, { error: "Please agree so we can reply to you." }),
  // Honeypot: real people never see or fill this.
  fax: z.string().max(0).optional().or(z.literal("")),
});
export type ContactInput = z.infer<typeof contactSchema>;

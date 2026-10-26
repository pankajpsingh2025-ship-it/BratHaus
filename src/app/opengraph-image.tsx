import { ogImage, OG_SIZE } from "@/lib/og";

export const alt = "BratHaus: websites that win, automations that work.";
export const size = OG_SIZE;
export const contentType = "image/png";
export default function Image() {
  return ogImage({ title: "Websites that win.", em: "Automations that work.", kicker: "Paid ads · Websites · AI agents · Software" });
}

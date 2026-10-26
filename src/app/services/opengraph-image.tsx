import { ogImage, OG_SIZE } from "@/lib/og";

export const alt = "BratHaus services: paid ads, websites, AI agents and software.";
export const size = OG_SIZE;
export const contentType = "image/png";
export default function Image() {
  return ogImage({ title: "Four services.", em: "One system.", kicker: "Paid ads · Websites · AI agents · Software" });
}

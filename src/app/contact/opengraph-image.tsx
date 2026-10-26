import { ogImage, OG_SIZE } from "@/lib/og";

export const alt = "Contact BratHaus.";
export const size = OG_SIZE;
export const contentType = "image/png";
export default function Image() {
  return ogImage({ title: "Let's get your", em: "diary full.", kicker: "Contact" });
}

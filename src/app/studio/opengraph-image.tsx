import { ogImage, OG_SIZE } from "@/lib/og";

export const alt = "The BratHaus studio.";
export const size = OG_SIZE;
export const contentType = "image/png";
export default function Image() {
  return ogImage({ title: "The studio.", em: "One team, the whole journey.", kicker: "Who we are" });
}

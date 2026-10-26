import { ogImage, OG_SIZE } from "@/lib/og";

export const alt = "BratHaus work: concept builds for fictional brands.";
export const size = OG_SIZE;
export const contentType = "image/png";
export default function Image() {
  return ogImage({ title: "Work.", em: "Every build, live.", kicker: "Concept builds for fictional brands" });
}

"use client";
import dynamic from "next/dynamic";
import { useStoryHost } from "@/lib/storyHost";

const StoryScene = dynamic(() => import("@/components/story/StoryScene"), { ssr: false });

// Inside the canvas: the home story, once requested, stays mounted for the rest of the visit.
export default function StoryHost() {
  const h = useStoryHost();
  if (!h.mounted) return null;
  return <StoryScene visible={h.visible} />;
}

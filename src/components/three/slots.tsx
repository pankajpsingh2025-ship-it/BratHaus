"use client";
// Framed 3D moments for the inner pages: each a fixed-size Slot (still first) whose WebGL View is
// code-split and loaded only near the screen. The home story is the main scene, not a slot.
import dynamic from "next/dynamic";
import type { CSSProperties, ReactNode } from "react";
import type { ServiceId } from "@/content/services";
import type { ExampleMedia } from "@/content/example-business";
import Slot from "./Slot";

type Base = { className?: string; style?: CSSProperties; fallback?: ReactNode; poster?: string | null; label?: string };

const MomentScene = dynamic(() => import("./moments/StoryMoment"), { ssr: false });
// A service's key moment from the story, held at a fixed point (Services page).
export function ServiceSlot({ id, media, className, poster, fallback, label }: Base & { id: ServiceId | "constellation"; media: ExampleMedia }) {
  return (
    <Slot className={className} poster={poster} fallback={fallback} label={label}>
      <MomentScene id={id} media={media} />
    </Slot>
  );
}

const LaptopScene = dynamic(() => import("./moments/Laptop"), { ssr: false });
// The case-study laptop: its lid opens with scroll and the project plays on its screen.
export function LaptopSlot({ video, image, sectionSel, className, fallback, poster, label }: Base & { video: string | null; image: string; sectionSel?: string }) {
  return <Slot className={className} poster={poster} fallback={fallback} label={label} margin="100% 0px"><LaptopScene video={video} image={image} sectionSel={sectionSel} /></Slot>;
}

const EmptyChatScene = dynamic(() => import("./moments/EmptyChat"), { ssr: false });
// The 404: the phone with an empty chat.
export function EmptyChatSlot({ className, fallback, label }: Base) {
  return <Slot className={className} fallback={fallback} label={label}><EmptyChatScene /></Slot>;
}

const LogoScene = dynamic(() => import("./moments/Logo"), { ssr: false });
// The 3D logo (Studio hero, 404). With the 3D off: the rendered preview, as an image, in the same box.
export function LogoSlot({ className, label = "The BratHaus mark in gold.", fit }: Base & { fit?: number }) {
  return (
    <Slot className={className} label={label} margin="100% 0px" poster="/brand/logo-3d-preview-front.webp">
      <LogoScene fit={fit} />
    </Slot>
  );
}

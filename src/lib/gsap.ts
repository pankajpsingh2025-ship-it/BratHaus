"use client";
// GSAP is registered once, here. Every scroll and timeline animation on the site goes through it.
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
  gsap.defaults({ ease: "expo.out", duration: 0.8 });
  // phone address bars showing/hiding must not re-lay out every trigger
  ScrollTrigger.config({ ignoreMobileResize: true });
}

export const EXPO = "expo.out";
export { gsap, ScrollTrigger, SplitText, useGSAP };

export const reducedMotion = () => typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

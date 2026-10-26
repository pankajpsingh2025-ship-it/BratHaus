"use client";
import { useRef, type RefObject } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";

// The Statement's words: solid ink, each word brightening from 25% to 100% opacity as the section
// moves from "top 75%" to "center 45%" (scrubbed, word by word). Without JS or with reduced motion
// it's simply solid.
export default function WordFill({ as = "h2", text, className = "", id, trigger }: { as?: "h2" | "p"; text: string; className?: string; id?: string; trigger?: string }) {
  const el = useRef<HTMLElement>(null);
  useGSAP(() => {
    const node = el.current; if (!node || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const split = SplitText.create(node, {
      type: "words", aria: "auto", autoSplit: true,
      onSplit(self) {
        const host = ((trigger && document.querySelector(trigger)) || node) as HTMLElement;
        return gsap.fromTo(self.words, { opacity: 0.25 }, { opacity: 1, ease: "none", stagger: 0.1, scrollTrigger: { trigger: host, start: "top 75%", end: "center 45%", scrub: 0.6 } });
      },
    });
    return () => split.revert();
  }, { scope: el, dependencies: [text, trigger] });
  const Tag = as as "h2";
  return <Tag ref={el as RefObject<HTMLHeadingElement>} id={id} className={className}>{text}</Tag>;
}

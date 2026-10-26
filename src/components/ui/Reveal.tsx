"use client";
import { useRef, type CSSProperties, type ReactNode, type RefObject } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";

// Section and page headings: always solid ink. Each line rises out of a mask once, when the heading
// reaches 85% of the screen (or on load for page titles). Without JS it's simply there.
type Props = {
  as?: "h1" | "h2" | "h3" | "p";
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  id?: string;
  /** play on load (page titles) instead of on scroll */
  onLoad?: boolean;
  delay?: number;
};

export default function Reveal({ as = "h2", children, className = "", style, id, onLoad = false, delay = 0 }: Props) {
  const el = useRef<HTMLElement>(null);
  useGSAP(() => {
    const node = el.current; if (!node || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const split = SplitText.create(node, {
      type: "lines", mask: "lines", linesClass: "reveal-line", aria: "auto", autoSplit: true,
      onSplit(self) {
        return gsap.from(self.lines, {
          yPercent: 100, duration: 0.8, ease: "expo.out", stagger: 0.08, delay,
          ...(onLoad ? {} : { scrollTrigger: { trigger: node, start: "top 85%", once: true } }),
        });
      },
    });
    return () => split.revert();
  }, { scope: el, dependencies: [onLoad, delay] });
  const Tag = as as "h2";
  return <Tag ref={el as RefObject<HTMLHeadingElement>} id={id} className={className} style={style}>{children}</Tag>;
}

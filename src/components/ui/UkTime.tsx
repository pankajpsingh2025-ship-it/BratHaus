"use client";
import { useSyncExternalStore } from "react";
import { ukTime } from "@/lib/time";

const subscribe = (cb: () => void) => { const id = setInterval(cb, 15000); return () => clearInterval(id); };
// Live UK time (Europe/London, GMT or BST). Never the visitor's location.
export default function UkTime() {
  const t = useSyncExternalStore(subscribe, () => ukTime(), () => "--:-- GMT");
  return <time>{t}</time>;
}

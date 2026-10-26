"use client";
import { useEffect, useRef } from "react";
import LivePreview, { type LiveBuild } from "./LivePreview";

// A native modal dialog: focus moves in, Escape closes, focus returns to the opener.
export default function LiveModal({ build, onClose }: { build: LiveBuild | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const d = ref.current; if (!d) return;
    if (build && !d.open) { opener.current = document.activeElement as HTMLElement; d.showModal(); }
    if (!build && d.open) d.close();
  }, [build]);
  useEffect(() => {
    const d = ref.current; if (!d) return;
    const on = () => { onClose(); opener.current?.focus(); };
    d.addEventListener("close", on);
    return () => d.removeEventListener("close", on);
  }, [onClose]);
  return (
    <dialog ref={ref} className="lmodal" aria-label={build ? `${build.name}, live` : "Live preview"} onClick={(e) => { if (e.target === ref.current) ref.current?.close(); }}>
      {build && (
        <div className="lmodal__inner">
          <div className="lmodal__head">
            <p className="meta">Live · {build.kind || "Concept build"}</p>
            <h2 className="lmodal__title">{build.name}</h2>
            <button type="button" className="lmodal__close" onClick={() => ref.current?.close()} autoFocus>Close</button>
          </div>
          <LivePreview build={build} autoLive />
        </div>
      )}
    </dialog>
  );
}

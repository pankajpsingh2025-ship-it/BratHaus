"use client";
import { PerspectiveCamera, View } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useContext, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { SlotCtx, useSlot } from "../Slot";
import { useInView } from "./hooks";
import Lights from "./Lights";

// Tells the Slot to fade its still image out once the 3D has drawn a frame.
function ReadyOnFirstFrame() {
  const { ready } = useSlot();
  const n = useRef(0);
  useFrame(() => { if (++n.current === 3) ready(); });
  return null;
}

// Compile this View's shaders off the main thread (KHR_parallel_shader_compile) before its
// first frame, instead of stalling the page when it appears.
function Warm({ onDone }: { onDone: () => void }) {
  const gl = useThree((s) => s.gl), scene = useThree((s) => s.scene), camera = useThree((s) => s.camera);
  const pending = useRef(true);
  useLayoutEffect(() => {
    let alive = true;
    // three polls readiness with setTimeout, which Chrome can starve during continuous
    // scrolling; never wait more than 700ms (anything left compiles on the first draw).
    const cap = new Promise((r) => setTimeout(r, 700));
    Promise.race([gl.compileAsync(scene, camera).catch(() => {}), cap]).finally(() => { pending.current = false; if (alive) onDone(); });
    return () => { alive = false; };
  }, [gl, scene, camera, onDone]);
  // While hidden nothing is drawn, so nothing flushes the GL queue and the parallel compile can
  // stall (seen with ANGLE/Metal). Flush each frame until it's done.
  useFrame(() => { if (pending.current) gl.getContext().flush(); });
  return null;
}

// Every moment's View: its own camera and lights, filling the Slot box.
export default function ViewFrame({ children, camera = [0, 0, 9], fov = 35, lights = true, spot }: {
  children: ReactNode; camera?: [number, number, number]; fov?: number; lights?: boolean; spot?: number;
}) {
  // The View's children render inside the canvas's React tree, so the Slot context is
  // provided again on that side.
  const ctx = useContext(SlotCtx);
  const [compiled, setCompiled] = useState(false);
  const done = useRef(() => setCompiled(true)).current;
  return (
    <View className="slot__view" visible={compiled}>
      <SlotCtx.Provider value={ctx ? { ...ctx, shown: compiled } : ctx}>
        <PerspectiveCamera makeDefault position={camera} fov={fov} near={0.1} far={200} />
        {lights && <Lights spot={spot} />}
        {children}
        <Warm onDone={done} />
        {compiled && <ReadyOnFirstFrame />}
      </SlotCtx.Provider>
    </View>
  );
}

// True while this moment's box is on screen: per-frame work is skipped otherwise.
export function useActive() {
  const { el } = useSlot();
  return useInView(el, "0px");
}

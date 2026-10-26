"use client";
import { useThree } from "@react-three/fiber";
import { useLayoutEffect } from "react";
import { sharedEnv } from "./env";

// The shared light-former environment plus one warm key light from the top right.
export default function Lights({ spot = 30, ambient = 0.12 }: { spot?: number; ambient?: number }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene); // inside a View this is the View's own scene
  useLayoutEffect(() => { const prev = scene.environment; scene.environment = sharedEnv(gl); return () => { scene.environment = prev; }; }, [gl, scene]);
  return (
    <>
      <ambientLight intensity={ambient} />
      <spotLight color="#FFE6C4" intensity={spot} angle={0.55} penumbra={1} position={[5, 6, 5]} decay={0} />
    </>
  );
}

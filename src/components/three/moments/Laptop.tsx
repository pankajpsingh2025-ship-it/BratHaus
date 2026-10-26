"use client";
import { ContactShadows, RoundedBox } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { easing } from "maath";
import { useEffect, useMemo, useRef } from "react";
import { BoxGeometry, Color, InstancedMesh, MathUtils, MeshBasicMaterial, MeshStandardMaterial, Object3D, SRGBColorSpace, TextureLoader, Vector3, VideoTexture, type Group, type Texture } from "three";
import { useSlot } from "../Slot";
import ViewFrame, { useActive } from "../kit/ViewFrame";
import { mats } from "../kit/materials";
import { readProgress, usePointer } from "../kit/hooks";
import { imgUrl } from "../kit/img";

const deg = MathUtils.degToRad;
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (x: number) => x * x * (3 - 2 * x);
const W = 3.4, D = 2.3, LID_H = 2.2;
const HINGE = new Vector3(0, 0.06, -D / 2 + 0.02);
const LOOK = new Vector3(0, 0.35, -0.35);
const CAM_A = new Vector3(0, 2.7, 7.8), CAM_B = new Vector3(-2.0, 1.3, 6.4);

function Keys() {
  const ref = useRef<InstancedMesh>(null);
  const geo = useMemo(() => new BoxGeometry(0.18, 0.02, 0.18), []);
  const keyMat = useMemo(() => new MeshStandardMaterial({ color: "#0c0c0c", roughness: 0.7, metalness: 0.2 }), []);
  useEffect(() => {
    const m = ref.current; if (!m) return;
    const o = new Object3D(); let k = 0;
    for (let r = 0; r < 5; r++) for (let c = 0; c < 13; c++) { o.position.set((c - 6) * 0.22, 0.07, -0.78 + r * 0.22); o.updateMatrix(); m.setMatrixAt(k++, o.matrix); }
    m.instanceMatrix.needsUpdate = true;
  }, []);
  return <instancedMesh ref={ref} args={[geo, keyMat, 65]} />;
}

function Scene({ video, image, sectionSel }: { video: string | null; image: string; sectionSel: string }) {
  const { el, lite } = useSlot();
  const active = useActive();
  const pointer = usePointer();
  const camera = useThree((s) => s.camera);
  const lid = useRef<Group>(null), rig = useRef<Group>(null);
  const screen = useMemo(() => new MeshBasicMaterial({ color: new Color(0, 0, 0), toneMapped: false }), []);
  const vid = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    let tex: Texture | null = null, alive = true;
    if (video) {
      const v = document.createElement("video");
      Object.assign(v, { src: video, muted: true, loop: true, playsInline: true, crossOrigin: "anonymous", preload: "auto" });
      vid.current = v;
      v.addEventListener("loadeddata", () => { if (!alive) return; tex = new VideoTexture(v); tex.colorSpace = SRGBColorSpace; screen.map = tex; screen.needsUpdate = true; }, { once: true });
    } else {
      new TextureLoader().load(imgUrl(image, 1200), (t) => { if (!alive) return t.dispose(); t.colorSpace = SRGBColorSpace; tex = t; screen.map = t; screen.needsUpdate = true; });
    }
    return () => { alive = false; tex?.dispose(); vid.current?.pause(); vid.current = null; };
  }, [video, image, screen]);
  const section = useRef<Element | null>(null);
  const t0 = useRef<number | null>(null);
  const p = useRef(0);
  const cam = useMemo(() => new Vector3(), []);
  useFrame((state, dt) => {
    if (!active.current || !lid.current || !rig.current) return;
    // pinned on desktop; on phones and low-power devices it opens over 1.2s as it comes into view
    let goal: number;
    if (lite) { t0.current ??= state.clock.elapsedTime; goal = clamp01((state.clock.elapsedTime - t0.current) / 1.2); }
    else { section.current ||= el.current?.closest(sectionSel) ?? null; goal = readProgress(section.current, "pin"); }
    easing.damp(p, "current", goal, 0.15, dt);
    const open = smooth(clamp01(p.current / 0.5));
    lid.current.rotation.x = MathUtils.lerp(deg(90), deg(-8), open);
    screen.color.setScalar(open);
    const v = vid.current;
    if (v) { if (p.current > 0.3 && v.paused) v.play().catch(() => {}); if (p.current < 0.25 && !v.paused) v.pause(); }
    const orbit = smooth(clamp01((p.current - 0.4) / 0.6));
    cam.lerpVectors(CAM_A, CAM_B, orbit);
    camera.position.set(cam.x + pointer.current.x * 0.25, cam.y + pointer.current.y * 0.15, cam.z);
    camera.lookAt(LOOK);
    rig.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.25) * deg(3);
  });
  return (
    <group ref={rig} position-y={-0.6}>
      {/* base */}
      <RoundedBox args={[W, 0.12, D]} radius={0.05} smoothness={4} material={mats.alu} />
      <mesh position={[0, 0.061, -0.34]} rotation-x={-Math.PI / 2} material={mats.aluDark}><planeGeometry args={[3.0, 1.18]} /></mesh>
      <Keys />
      <RoundedBox args={[1.1, 0.004, 0.68]} radius={0.002} position={[0, 0.062, 0.68]} material={mats.aluDark} />
      {/* lid, hinged at its bottom edge */}
      <group ref={lid} position={HINGE} rotation-x={deg(90)}>
        <RoundedBox args={[W, LID_H, 0.07]} radius={0.05} smoothness={4} position-y={LID_H / 2} material={mats.alu} />
        <mesh position={[0, LID_H / 2, 0.036]} material={mats.black}><planeGeometry args={[W - 0.08, LID_H - 0.08]} /></mesh>
        <mesh position={[0, LID_H / 2 + 0.02, 0.037]} material={screen}><planeGeometry args={[W - 0.24, LID_H - 0.26]} /></mesh>
      </group>
      <ContactShadows position-y={-0.065} opacity={0.5} blur={2.5} far={3} scale={9} resolution={lite ? 256 : 512} frames={lite ? 1 : Infinity} />
    </group>
  );
}

export default function Laptop({ video, image, sectionSel = ".claptop" }: { video: string | null; image: string; sectionSel?: string }) {
  return <ViewFrame camera={[0, 2.7, 7.8]} fov={35} spot={14}><Scene video={video} image={image} sectionSel={sectionSel} /></ViewFrame>;
}

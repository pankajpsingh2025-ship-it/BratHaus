"use client";
import { Billboard, Line, RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { Color, MeshBasicMaterial, MeshStandardMaterial, type Group } from "three";
import type { ServiceId } from "@/content/services";
import { example, type ExampleMedia } from "@/content/example-business";
import { PhoneBody } from "@/components/story/Phone";
import { LaptopBody } from "@/components/story/Laptop";
import Screen from "@/components/story/Screen";
import PhoneScreens from "@/components/story/ui/PhoneScreens";
import SalonSiteDesktop, { type SiteLayer } from "@/components/story/ui/SalonSiteDesktop";
import DashboardScreen from "@/components/story/ui/DashboardScreen";
import { glass, measure } from "@/components/story/GlassChips";
import { textTexture } from "@/components/story/textTexture";
import { BROWSER } from "@/components/story/parts";
import ViewFrame, { useActive } from "../kit/ViewFrame";
import { useSlot } from "../Slot";

// The Services page's night bands: each service's key moment from the home story, held still and
// breathing gently (no scroll needed). Same devices, same screens, framed for a box.
const TAU = Math.PI * 2;

function useFonts() {
  const [ok, setOk] = useState(false);
  useEffect(() => { let on = true; document.fonts.ready.then(() => { if (on) setOk(true); }); return () => { on = false; }; }, []);
  return ok;
}

// A glass label: a chip (pill) or a chat bubble, its text drawn into the glass.
function GlassLabel({ text, lite, bubble = false, agent = true, position, scale = 1 }: { text: string; lite: boolean; bubble?: boolean; agent?: boolean; position: [number, number, number]; scale?: number }) {
  const fonts = useFonts();
  const made = useMemo(() => {
    if (!fonts) return null;
    const size = bubble ? 17 : 15;
    const maxW = bubble ? 440 : 600;
    const words = text.split(" ");
    let line = "", lines = 0, widest = 0;
    for (const w of words) { const t = line ? `${line} ${w}` : w; if (measure(t, size, 500) > maxW - 40 && line) { widest = Math.max(widest, measure(line, size, 500)); lines++; line = w; } else line = t; }
    if (line) { widest = Math.max(widest, measure(line, size, 500)); lines++; }
    const w = Math.ceil(Math.min(maxW, widest + 40)), h = bubble ? Math.ceil(lines * size * 1.32 + 30) : 50;
    const tex = textTexture(text, { w, h, size, weight: 500, color: "#F3EEE6", padX: 20, align: bubble && !agent ? "right" : "left" });
    return { w: w / 400, h: h / 400, tex, glass: glass(lite, bubble && !agent ? "#2f4a3a" : "#3a3732"), text: new MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, depthWrite: false }) };
  }, [fonts, text, lite, bubble, agent]);
  useEffect(() => () => { made?.tex.dispose(); made?.glass.dispose(); made?.text.dispose(); }, [made]);
  if (!made) return null;
  return (
    <group position={position} scale={scale}>
      <RoundedBox args={[made.w, made.h, bubble ? 0.05 : 0.04]} radius={bubble ? 0.06 : made.h / 2 - 0.002} smoothness={6} material={made.glass} />
      <mesh position={[0, 0, bubble ? 0.027 : 0.022]} material={made.text}><planeGeometry args={[made.w, made.h]} /></mesh>
    </group>
  );
}

function Float({ children, amp = 0.04, turn = 4, base = [0, 0, 0] as [number, number, number] }: { children: React.ReactNode; amp?: number; turn?: number; base?: [number, number, number] }) {
  const g = useRef<Group>(null);
  const active = useActive();
  useFrame((st) => {
    if (!g.current || !active.current) return;
    const t = st.clock.elapsedTime;
    g.current.position.y = Math.sin((t / 5) * TAU) * amp;
    g.current.rotation.y = base[1] + Math.sin((t / 8) * TAU) * (turn * Math.PI / 180);
  });
  return <group ref={g} rotation={base}>{children}</group>;
}

function Ads({ media, lite }: { media: ExampleMedia; lite: boolean }) {
  return (
    <group>
      <Float base={[0.05, -0.2, 0.03]}>
        <PhoneBody portal={false}><PhoneScreens media={media} mode="ad" /></PhoneBody>
      </Float>
      <GlassLabel text={`●  ${example.targeting[0]}`} lite={lite} position={[-0.42, 0.55, 0.45]} scale={0.85} />
      <GlassLabel text={`●  ${example.targeting[1]}`} lite={lite} position={[0.46, 0.12, 0.55]} scale={0.85} />
      <GlassLabel text={`●  ${example.targeting[2]}`} lite={lite} position={[-0.38, -0.45, 0.6]} scale={0.85} />
    </group>
  );
}

const panel = new MeshStandardMaterial({ color: "#1B1A18", roughness: 0.6, metalness: 0.2 });
const rim = new MeshStandardMaterial({ color: "#4a4741", roughness: 0.5, metalness: 0.3 });
function Web({ media, lite }: { media: ExampleMedia; lite: boolean }) {
  const layers = useRef<(Group | null)[]>([]);
  const active = useActive();
  const depth = lite ? [0, 0.14, 0.28, 0.28] : [0, 0.14, 0.28, 0.42];
  const g = useRef<Group>(null);
  useFrame((st) => {
    if (!active.current) return;
    // breathing apart and together
    const k = (Math.sin(st.clock.elapsedTime * 0.7) + 1) / 2;
    const e = k * k * (3 - 2 * k);
    layers.current.forEach((l, i) => { if (l) l.position.z = 0.017 + depth[i] * e; });
    if (g.current) g.current.rotation.y = 0.16 + e * 0.32;
  });
  const B = BROWSER;
  return (
    <group ref={g}>
      <RoundedBox args={[B.w + 0.016, B.h + 0.016, B.d * 0.6]} radius={0.048} smoothness={4} position={[0, 0, -0.008]} material={rim} />
      <RoundedBox args={[B.w, B.h, B.d]} radius={0.04} smoothness={4} material={panel} />
      {([0, 1, 2, 3] as SiteLayer[]).map((i) => (
        <group key={i} ref={(el) => { layers.current[i] = el; }} position={[0, -B.bar / 2 + 0.005, 0.017]}>
          <Screen cssW={B.cssW} cssH={B.cssH} worldW={B.screenW} radius={i === 0 ? 0.02 : 0} portal={false}><SalonSiteDesktop layer={i} media={media} /></Screen>
        </group>
      ))}
    </group>
  );
}

function Agents({ media, lite }: { media: ExampleMedia; lite: boolean }) {
  const m = example.chat.messages;
  return (
    <group>
      <Float base={[0, 0.25, 0]} amp={0.03}>
        <group position={[-0.45, 0, 0]}><PhoneBody portal={false}><PhoneScreens media={media} mode="chat" /></PhoneBody></group>
      </Float>
      <GlassLabel bubble agent={false} text={m[0].text} lite={lite} position={[0.62, 0.52, 0.35]} scale={0.62} />
      <GlassLabel bubble text={m[1].text} lite={lite} position={[0.72, 0.18, 0.6]} scale={0.62} />
      <GlassLabel bubble text={m[3].text} lite={lite} position={[0.64, -0.2, 0.85]} scale={0.62} />
    </group>
  );
}

function Software() {
  const open = useRef(1);
  const dash = useRef<HTMLDivElement>(null);
  const active = useActive();
  useFrame((st) => {
    if (!active.current) return;
    // the Saturday slot fills, holds, and empties again
    const t = (st.clock.elapsedTime % 6) / 6;
    const d = t < 0.15 ? 0 : t < 0.4 ? (t - 0.15) / 0.25 : t < 0.85 ? 1 : 1 - (t - 0.85) / 0.15;
    const root = dash.current?.firstElementChild as HTMLElement | null;
    if (root) { root.style.setProperty("--diary", d.toFixed(3)); root.style.setProperty("--auto", Math.min(1, d * 1.2).toFixed(3)); root.style.setProperty("--toast", (t > 0.42 && t < 0.8 ? 1 : 0).toString()); }
  });
  return (
    <Float base={[0.32, -0.42, 0]} amp={0.02} turn={2}>
      <group position={[0, -0.75, 0]}>
        <LaptopBody open={open} portal={false}><div ref={dash}><DashboardScreen /></div></LaptopBody>
      </group>
    </Float>
  );
}

const nodeMat = new MeshBasicMaterial({ color: new Color("#FFD9A0").multiplyScalar(2.2), toneMapped: false });
const haloMat = new MeshBasicMaterial({ color: "#D4AF7C", transparent: true, opacity: 0.12, depthWrite: false });
const NODES: [number, number, number][] = [[-2.1, -0.3, 0], [-0.7, 0.6, -0.4], [0.7, -0.2, 0.3], [2.1, 0.5, -0.2]];
function Constellation() {
  const g = useRef<Group>(null);
  const active = useActive();
  useFrame((st) => { if (g.current && active.current) g.current.rotation.y = Math.sin(st.clock.elapsedTime * 0.2) * 0.35; });
  return (
    <group ref={g}>
      <Line points={NODES} color="#FFD9A0" lineWidth={1.4} transparent opacity={0.85} />
      {NODES.map((p, i) => (
        <group key={i} position={p}>
          <mesh material={nodeMat}><sphereGeometry args={[0.1, 24, 12]} /></mesh>
          <Billboard><mesh material={haloMat}><circleGeometry args={[0.32, 32]} /></mesh></Billboard>
        </group>
      ))}
    </group>
  );
}

function Moment({ id, media }: { id: ServiceId | "constellation"; media: ExampleMedia }) {
  const { lite } = useSlot();
  if (id === "paid-ads") return <Ads media={media} lite={lite} />;
  if (id === "websites") return <Web media={media} lite={lite} />;
  if (id === "ai-agents") return <Agents media={media} lite={lite} />;
  if (id === "software") return <Software />;
  return <Constellation />;
}

const CAMERA: Record<string, [number, number, number]> = {
  "paid-ads": [0, 0, 4.6], websites: [0, 0, 6.6], "ai-agents": [0.1, 0, 5], software: [0, 1.4, 7.2], constellation: [0, 0, 6.5],
};

export default function StoryMoment({ id, media }: { id: ServiceId | "constellation"; media: ExampleMedia }) {
  return (
    <ViewFrame camera={CAMERA[id]} fov={30} spot={30}>
      <Moment id={id} media={media} />
    </ViewFrame>
  );
}

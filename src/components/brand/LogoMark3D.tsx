"use client";
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Box3, ExtrudeGeometry, MeshPhysicalMaterial, PMREMGenerator, Vector3, type ExtrudeGeometryOptions, type Group, type Mesh, type SpotLight, type Texture, type WebGLRenderer } from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { easing } from "maath";
import { gsap } from "@/lib/gsap";
import { MARK_PATHS } from "@/content/brand";
import { pointer } from "@/lib/pointer";
import { useQuality } from "@/components/three/quality";

// The BratHaus mark in 3D (fix brief F5.1): the logo kit's three parts extruded with a soft bevel,
// champagne-gold physical metal lit by a procedural studio environment (no HDR download), a warm
// key whose highlight glides across the faces, and a cool rim. The parts assemble on load (main from
// below, the pill from the right, the dot from the front), then the mark turns gently and follows
// the pointer a little. `exit` (0–1) turns it edge-on and lifts it away (the home story's start).
// The environment map goes on the logo's own material only, so it never relights anything else.

// one environment texture per renderer, shared by every logo
const envs = new WeakMap<WebGLRenderer, Texture>();
function envFor(gl: WebGLRenderer) {
  let t = envs.get(gl);
  if (!t) {
    const pmrem = new PMREMGenerator(gl);
    t = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    envs.set(gl, t);
  }
  return t;
}

const geoCache = new Map<string, ExtrudeGeometry[]>();
function geometries(lite: boolean) {
  const key = lite ? "lite" : "full";
  const hit = geoCache.get(key);
  if (hit) return hit;
  const opts: ExtrudeGeometryOptions = { depth: 26, bevelEnabled: true, bevelThickness: 3, bevelSize: 2.4, bevelOffset: -2.4, bevelSegments: lite ? 8 : 12, curveSegments: lite ? 48 : 72 };
  const svg = `<svg viewBox="0 0 200 200">${Object.values(MARK_PATHS).map((d) => `<path d="${d}"/>`).join("")}</svg>`;
  const parsed = new SVGLoader().parse(svg).paths.map((p) => new ExtrudeGeometry(SVGLoader.createShapes(p), opts));
  const box = new Box3();
  parsed.forEach((g) => { g.computeBoundingBox(); box.union(g.boundingBox!); });
  const c = box.getCenter(new Vector3());
  parsed.forEach((g) => g.translate(-c.x, -c.y, -c.z));
  geoCache.set(key, parsed);
  return parsed;                                         // [main, pill, dot]
}

const REST = { rx: 0.14, ry: -0.45 };
// part start offsets, in SVG units inside the y-flipped group: main from below, pill from the right, dot from the front
const FROM = [new Vector3(0, 40, 0), new Vector3(60, 0, 0), new Vector3(0, 0, 90)];

export default function LogoMark3D({ fit = 1, exit, lights = true, delay = 0.15 }: { fit?: number; exit?: { current: number }; lights?: boolean; delay?: number }) {
  const quality = useQuality();
  const lite = quality === "lite";
  const gl = useThree((s) => s.gl);
  const geos = useMemo(() => geometries(lite), [lite]);
  const material = useMemo(() => new MeshPhysicalMaterial({ color: "#CFA56B", metalness: 1, roughness: 0.3, clearcoat: 0.35, clearcoatRoughness: 0.25, envMapIntensity: 1.25, envMap: envFor(gl) }), [gl]);
  useEffect(() => () => material.dispose(), [material]);

  const still = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = useRef<Group>(null);
  const parts = useRef<(Mesh | null)[]>([]);
  const key = useRef<SpotLight>(null);
  const intro = useRef({ p: still ? 1 : 0 });
  useEffect(() => {
    if (still) return;
    const tw = gsap.to(intro.current, { p: 1, duration: 1.4, ease: "expo.out", delay });
    return () => { tw.kill(); };
  }, [still, delay]);

  useFrame((state, dt) => {
    const g = root.current; if (!g) return;
    const t = still ? 0 : state.clock.elapsedTime;
    const p = intro.current.p;
    parts.current.forEach((m, i) => {
      if (!m) return;
      const k = gsap.utils.clamp(0, 1, (p - i * 0.12) / (1 - 0.24));
      m.position.copy(FROM[i]).multiplyScalar(1 - k);
    });
    const x = exit?.current ?? 0;
    const ry = REST.ry + (still ? 0 : Math.sin(t * 0.35) * 0.16 + pointer.x * 0.12) + x * Math.PI * 0.5;   // edge-on as it exits
    const rx = REST.rx + (still ? 0 : Math.sin(t * 0.27) * 0.04 - pointer.y * 0.08);
    easing.dampE(g.rotation, [rx, ry, 0], 0.25, dt);
    g.position.y = x * 1.2;
    g.visible = x < 0.98;
    if (key.current) {
      key.current.position.x = 4 + Math.sin(t * 0.4) * 2.5;   // the moving glint
      key.current.intensity = 60 * (1 - x);                   // its light leaves with it (shared scenes)
    }
  });

  const k = 0.0136 * fit;
  return (
    <>
      {lights && (
        <>
          <ambientLight intensity={0.08} />
          <spotLight ref={key} color="#FFE2BC" intensity={60} distance={30} angle={0.5} penumbra={1} position={[4, 5, 6]} />
          <directionalLight color="#9FB0A0" intensity={0.6} position={[-6, 2, -4]} />
        </>
      )}
      <group ref={root}>
        <group scale={[k, -k, k]}>{/* SVG is y-down: flip */}
          {geos.map((g, i) => <mesh key={i} ref={(m) => { parts.current[i] = m; }} geometry={g} material={material} />)}
        </group>
      </group>
    </>
  );
}

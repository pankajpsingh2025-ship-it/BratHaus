"use client";
import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import { AdditiveBlending, BufferAttribute, BufferGeometry, CatmullRomCurve3, Color, DynamicDrawUsage, MeshBasicMaterial, Shape, ShapeGeometry, ShaderMaterial, Vector3 } from "three";
import { MARK_CONTOURS, resample } from "@/lib/logo";
import { rig } from "@/lib/rig";
import { ANCHORS, threadAnchors } from "./anchors";

// The gold thread: the customer's path. A thin camera-facing ribbon (it reads as a 0.006 tube) along a
// Catmull-Rom curve through anchors on the devices' EDGES, with a light pulse travelling along it.
// It is depth-tested and its control points sit 0.3 behind the devices, so it passes behind them and
// never across a screen. In the last 6% it morphs into the BratHaus mark's outline (the thread and
// the mark sampled at the same point count, then interpolated), the pill and the dot draw in, and
// the mark fills.
const M = 240;          // samples along the visible thread
const R = 0.006;        // the brief's tube radius

function ribbon(n: number) {
  const g = new BufferGeometry();
  const pos = new BufferAttribute(new Float32Array((n + 1) * 2 * 3), 3); pos.setUsage(DynamicDrawUsage);
  const u = new Float32Array((n + 1) * 2), v = new Float32Array((n + 1) * 2);
  const idx: number[] = [];
  for (let i = 0; i <= n; i++) {
    u[i * 2] = u[i * 2 + 1] = i / n; v[i * 2] = -1; v[i * 2 + 1] = 1;
    if (i < n) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  }
  g.setAttribute("position", pos);
  g.setAttribute("aU", new BufferAttribute(u, 1));
  g.setAttribute("aV", new BufferAttribute(v, 1));
  g.setIndex(idx);
  g.boundingSphere = null;
  return g;
}

function material(glow: boolean) {
  return new ShaderMaterial({
    transparent: true, depthWrite: false, depthTest: true, blending: AdditiveBlending, toneMapped: false,
    uniforms: { uColor: { value: new Color("#FFD9A0") }, uOpacity: { value: 1 }, uPulse: { value: 0 }, uDraw: { value: 1 }, uGlow: { value: glow ? 1 : 0 }, uFade: { value: 0.04 } },
    vertexShader: /* glsl */ `
      attribute float aU; attribute float aV; varying float vU; varying float vV;
      void main() { vU = aU; vV = aV; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uOpacity; uniform float uPulse; uniform float uDraw; uniform float uGlow; uniform float uFade;
      varying float vU; varying float vV;
      void main() {
        if (vU > uDraw) discard;
        float edge = 1.0 - abs(vV);
        float p = exp(-pow((vU - uPulse) / 0.06, 2.0));
        float a = uGlow > 0.5 ? edge * edge * (0.12 + p * 0.3) : smoothstep(0.0, 0.5, edge) * (0.85 + p * 0.15);
        // the tail fades in
        a *= smoothstep(0.0, uFade, vU);
        gl_FragColor = vec4(uColor * (1.0 + p * 2.2), a * uOpacity);
      }`,
  });
}

// the mark's grid: x 34–166, y 18–186 (centre 100, 102)
const MARK_H = 168, MX = 100, MY = 102;
const fill = new MeshBasicMaterial({ color: "#D9B47C", transparent: true, opacity: 0, depthWrite: false, toneMapped: false });
const markFill = (() => {
  const shapes = MARK_CONTOURS.map((c) => { const s = new Shape(); c.forEach(([x, y], i) => (i ? s.lineTo(x - MX, MY - y) : s.moveTo(x - MX, MY - y))); return s; });
  return new ShapeGeometry(shapes, 4);
})();

export default function Thread({ tall, nodes, logo }: { tall: boolean; nodes: Vector3[]; logo: { x: number; y: number; z: number; h: number } }) {
  const t = useMemo(() => {
    const anchors = Array.from({ length: ANCHORS }, () => new Vector3());
    const pts = Array.from({ length: ANCHORS * 2 - 1 }, () => new Vector3());
    const curve = new CatmullRomCurve3(pts, false, "centripetal");
    const core = ribbon(M), glow = ribbon(M);
    const mCore = material(false), mGlow = material(true);
    // the mark's contours, resampled once (in its 200-unit grid)
    const outer = resample(MARK_CONTOURS[0], M + 1);
    const pill = resample(MARK_CONTOURS[1], 97), dot = resample(MARK_CONTOURS[2], 65);
    const pillG = ribbon(96), dotG = ribbon(64);
    const mPill = material(false), mDot = material(false);
    return {
      anchors, pts, curve, core, glow, mCore, mGlow, outer, pill, dot, pillG, dotG, mPill, mDot,
      samples: Array.from({ length: M + 1 }, () => new Vector3()),
      pillPts: Array.from({ length: 97 }, () => new Vector3()), dotPts: Array.from({ length: 65 }, () => new Vector3()),
      a: new Vector3(), tan: new Vector3(), view: new Vector3(), side: new Vector3(), lift: new Vector3(),
    };
  }, []);

  useFrame((state) => {
    const { camera, clock } = state;
    const route = rig.thread.route;
    const visible = route > 0.001 && rig.thread.o > 0.001;
    t.mCore.uniforms.uOpacity.value = t.mGlow.uniforms.uOpacity.value = visible ? rig.thread.o : 0;
    const logoP = rig.nodes.logo;
    fill.opacity = visible ? Math.max(0, (logoP - 0.6) / 0.4) * 0.9 : 0;
    if (!visible) { t.mPill.uniforms.uOpacity.value = t.mDot.uniforms.uOpacity.value = 0; return; }

    // 1. anchors on the device edges, with a control point between each pair: up a little, and 0.3
    //    BEHIND the devices, so the curve goes round the back of them
    threadAnchors(t.anchors, tall, nodes);
    const back = 1 - rig.nodes.p;
    for (let i = 0; i < ANCHORS; i++) {
      t.pts[i * 2].copy(t.anchors[i]);
      if (i < ANCHORS - 1) {
        const A = t.anchors[i], B = t.anchors[i + 1], d = A.distanceTo(B);
        t.pts[i * 2 + 1].addVectors(A, B).multiplyScalar(0.5).add(t.lift.set(0, d * 0.08, -0.3 * back));
      }
    }
    // 2. sample the stretch the customer is on: the latest ~1.2 anchors (the whole path in the finale)
    const span = (k: number) => Math.min(1, Math.max(0, (k * 2) / (t.pts.length - 1)));
    const tEnd = span(route);
    const tail = Math.max(0, route - (tall ? 0.8 : 1.2)) * back;
    const tStart = span(tail);
    for (let i = 0; i <= M; i++) t.curve.getPoint(tStart + (i / M) * (tEnd - tStart), t.samples[i]);
    // the tail end fades in (unless the line starts at the very beginning, off-screen)
    t.mCore.uniforms.uFade.value = t.mGlow.uniforms.uFade.value = tail > 0 ? 0.35 : 0.04;

    // 3. the finale: morph into the mark, centred in the device zone
    const le = logoP * logoP * (3 - 2 * logoP);
    const H = logo.h / MARK_H;
    if (le > 0) {
      for (let i = 0; i <= M; i++) {
        const [x, y] = t.outer[i];
        t.a.set(logo.x + (x - MX) * H, logo.y - (y - MY) * H, logo.z);
        t.samples[i].lerp(t.a, le);
      }
    }

    // 4. build the ribbons, a constant on-screen width wherever they are
    const thin = tall ? 0.7 : 1;
    const width = (dist: number) => R * thin * Math.max(1, dist / 6);
    const write = (geo: BufferGeometry, samples: Vector3[], n: number, w: number) => {
      const arr = (geo.attributes.position as BufferAttribute).array as Float32Array;
      for (let i = 0; i <= n; i++) {
        const p = samples[i];
        t.tan.subVectors(samples[Math.min(n, i + 1)], samples[Math.max(0, i - 1)]).normalize();
        t.view.subVectors(camera.position, p);
        const hw = width(t.view.length()) * w;
        t.side.crossVectors(t.tan, t.view).normalize().multiplyScalar(hw);
        arr[i * 6] = p.x - t.side.x; arr[i * 6 + 1] = p.y - t.side.y; arr[i * 6 + 2] = p.z - t.side.z;
        arr[i * 6 + 3] = p.x + t.side.x; arr[i * 6 + 4] = p.y + t.side.y; arr[i * 6 + 5] = p.z + t.side.z;
      }
      geo.attributes.position.needsUpdate = true;
      geo.computeBoundingSphere();
    };
    write(t.core, t.samples, M, 1);
    write(t.glow, t.samples, M, 7);
    const pulse = (clock.elapsedTime * 0.28) % 1;
    t.mCore.uniforms.uPulse.value = t.mGlow.uniforms.uPulse.value = pulse;

    // the pill and the dot draw in during the last part of the morph
    const extra = Math.max(0, (logoP - 0.35) / 0.65);
    t.mPill.uniforms.uOpacity.value = t.mDot.uniforms.uOpacity.value = extra > 0 ? rig.thread.o : 0;
    t.mPill.uniforms.uDraw.value = t.mDot.uniforms.uDraw.value = extra;
    if (extra > 0) {
      const place = (src: [number, number][], out: Vector3[]) => src.forEach(([x, y], i) => out[i].set(logo.x + (x - MX) * H, logo.y - (y - MY) * H, logo.z));
      place(t.pill, t.pillPts); place(t.dot, t.dotPts);
      write(t.pillG, t.pillPts, t.pill.length - 1, 1);
      write(t.dotG, t.dotPts, t.dot.length - 1, 1);
    }
  });

  return (
    <group>
      <mesh geometry={markFill} material={fill} position={[logo.x, logo.y, logo.z - 0.01]} scale={[logo.h / MARK_H, logo.h / MARK_H, 1]} frustumCulled={false} />
      <mesh geometry={t.glow} material={t.mGlow} frustumCulled={false} />
      <mesh geometry={t.core} material={t.mCore} frustumCulled={false} />
      <mesh geometry={t.pillG} material={t.mPill} frustumCulled={false} />
      <mesh geometry={t.dotG} material={t.mDot} frustumCulled={false} />
    </group>
  );
}

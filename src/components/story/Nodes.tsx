"use client";
import { Billboard } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, DynamicDrawUsage, MeshBasicMaterial, ShaderMaterial, Vector3, type Group } from "three";
import { rig } from "@/lib/rig";

// The finale's constellation: four glowing nodes in an arc across the device zone (a 2×2 diamond on
// portrait), AD · WEBSITE · AI AGENT · DASHBOARD (their labels are DOM), joined by dotted particle
// lines that drift along each link.
const core = new MeshBasicMaterial({ color: new Color("#FFD9A0").multiplyScalar(2.2), toneMapped: false, transparent: true });
const halo = new ShaderMaterial({
  transparent: true, depthWrite: false, blending: AdditiveBlending, toneMapped: false,
  uniforms: { uOpacity: { value: 0 }, uColor: { value: new Color("#FFD9A0") } },
  vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
  fragmentShader: "uniform float uOpacity; uniform vec3 uColor; varying vec2 vUv; void main(){ float d = length(vUv - 0.5) * 2.0; float a = pow(max(0.0, 1.0 - d), 2.2); gl_FragColor = vec4(uColor, a * uOpacity * 0.55); }",
});
const PER = 36; // dots per link

export default function Nodes({ nodes }: { nodes: Vector3[] }) {
  const groups = useRef<(Group | null)[]>([]);
  const v = useMemo(() => ({ n: nodes }), [nodes]);
  const dots = useMemo(() => {
    const g = new BufferGeometry();
    const p = new BufferAttribute(new Float32Array(PER * 3 * 3), 3); p.setUsage(DynamicDrawUsage);
    g.setAttribute("position", p);
    const m = new ShaderMaterial({
      transparent: true, depthWrite: false, blending: AdditiveBlending, toneMapped: false,
      uniforms: { uOpacity: { value: 0 }, uPx: { value: 900 } },
      vertexShader: "uniform float uPx; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); gl_Position = projectionMatrix * mv; gl_PointSize = 0.035 * uPx / -mv.z; }",
      fragmentShader: "uniform float uOpacity; void main(){ float d = length(gl_PointCoord - 0.5); gl_FragColor = vec4(1.0, 0.86, 0.63, smoothstep(0.5, 0.1, d) * uOpacity * 0.8); }",
    });
    return { g, m };
  }, []);
  useFrame((st) => {
    const p = rig.nodes.p;
    const e = p * p * (3 - 2 * p);
    const fade = 1 - rig.nodes.logo;
    core.opacity = e * fade;
    halo.uniforms.uOpacity.value = e * fade;
    dots.m.uniforms.uOpacity.value = e * (1 - rig.nodes.logo);
    dots.m.uniforms.uPx.value = st.size.height * st.viewport.dpr;
    if (e < 0.001) { groups.current.forEach((g) => { if (g) g.visible = false; }); return; }
    groups.current.forEach((g, i) => { if (!g) return; g.visible = true; g.position.copy(v.n[i]); g.scale.setScalar(0.3 + e * 0.7); });
    // dotted links, drifting from each node to the next
    const arr = (dots.g.attributes.position as BufferAttribute).array as Float32Array;
    const t = st.clock.elapsedTime * 0.12;
    for (let s = 0; s < 3; s++) {
      const A = v.n[s], B = v.n[s + 1];
      for (let k = 0; k < PER; k++) {
        const f = (k / PER + t) % 1, o = (s * PER + k) * 3;
        arr[o] = A.x + (B.x - A.x) * f; arr[o + 1] = A.y + (B.y - A.y) * f; arr[o + 2] = A.z + (B.z - A.z) * f;
      }
    }
    dots.g.attributes.position.needsUpdate = true;
    dots.g.computeBoundingSphere();
  });
  return (
    <group>
      {[0, 1, 2, 3].map((i) => (
        <group key={i} ref={(el) => { groups.current[i] = el; }} visible={false}>
          <mesh material={core}><sphereGeometry args={[0.12, 32, 16]} /></mesh>
          <Billboard><mesh material={halo}><planeGeometry args={[1.3, 1.3]} /></mesh></Billboard>
        </group>
      ))}
      <points geometry={dots.g} material={dots.m} frustumCulled={false} />
    </group>
  );
}

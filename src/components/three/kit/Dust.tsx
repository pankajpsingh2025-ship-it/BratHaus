"use client";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, ShaderMaterial } from "three";

// Fine ivory dust drifting slowly upwards through a box (all motion in the shader).
export default function Dust({ count = 600, box = [8, 6, 4], size = 0.012, opacity = 0.5, color = "#F7F1E6" }: { count?: number; box?: [number, number, number]; size?: number; opacity?: number; color?: string }) {
  // keyed on the values, not the array (callers pass it inline), and old buffers are freed
  const [bx, by, bz] = box;
  const geo = useMemo(() => {
    const g = new BufferGeometry();
    const p = new Float32Array(count * 3), s = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * bx; p[i * 3 + 1] = (Math.random() - 0.5) * by; p[i * 3 + 2] = (Math.random() - 0.5) * bz;
      s[i] = 0.4 + Math.random() * 0.6;
    }
    g.setAttribute("position", new BufferAttribute(p, 3));
    g.setAttribute("aSeed", new BufferAttribute(s, 1));
    return g;
  }, [count, bx, by, bz]);
  useEffect(() => () => geo.dispose(), [geo]);
  const mat = useMemo(() => new ShaderMaterial({
    transparent: true, depthWrite: false, blending: AdditiveBlending, toneMapped: false,
    uniforms: { uTime: { value: 0 }, uSize: { value: size }, uH: { value: by }, uOpacity: { value: opacity }, uColor: { value: new Color(color) }, uPx: { value: 1000 } },
    vertexShader: /* glsl */ `
      attribute float aSeed; uniform float uTime; uniform float uSize; uniform float uH; uniform float uPx; varying float vA;
      void main() {
        vec3 p = position;
        p.y = mod(p.y + uH * 0.5 + uTime * 0.06 * aSeed, uH) - uH * 0.5;
        p.x += sin(uTime * 0.3 * aSeed + position.z * 3.0) * 0.08;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = uSize * uPx * aSeed / -mv.z;
        vA = aSeed * smoothstep(uH * 0.5, uH * 0.3, abs(p.y));
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uOpacity; varying float vA;
      void main() { float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d); gl_FragColor = vec4(uColor, a * vA * uOpacity); }`,
  }), [size, by, opacity, color]);
  useEffect(() => () => mat.dispose(), [mat]);
  useFrame((s, dt) => { mat.uniforms.uTime.value += Math.min(dt, 0.05); mat.uniforms.uPx.value = s.size.height * s.viewport.dpr; });
  return <points geometry={geo} material={mat} />;
}

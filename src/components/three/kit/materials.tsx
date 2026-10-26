"use client";
import { MeshTransmissionMaterial } from "@react-three/drei";
import { Color, MeshBasicMaterial, MeshPhysicalMaterial, MeshStandardMaterial } from "three";

// The BratHaus material set: champagne gold, clear glass, ivory and gold glow, olive.
// Shared instances, so every moment reuses the same GPU programs.
export const mats = {
  gold: new MeshPhysicalMaterial({ color: "#D4AF7C", metalness: 1, roughness: 0.22, clearcoat: 0.4, clearcoatRoughness: 0.2, envMapIntensity: 1.4 }),
  goldBright: new MeshPhysicalMaterial({ color: "#F1D7A8", metalness: 1, roughness: 0.12, clearcoat: 0.4, clearcoatRoughness: 0.2, envMapIntensity: 1.4 }),
  glassLite: new MeshPhysicalMaterial({ color: "#F7F1E6", transmission: 1, thickness: 0.3, roughness: 0.08, ior: 1.45, metalness: 0, envMapIntensity: 1.2, transparent: true, opacity: 0.85 }),
  ivoryGlow: new MeshBasicMaterial({ color: "#F7F1E6", toneMapped: false }),
  goldGlow: new MeshBasicMaterial({ color: new Color("#FFD9A0").multiplyScalar(2), toneMapped: false }),
  olive: new MeshStandardMaterial({ color: "#6B7F5B", roughness: 0.35, metalness: 0.2 }),
  alu: new MeshPhysicalMaterial({ color: "#2A2A2A", metalness: 1, roughness: 0.35, envMapIntensity: 1.1 }),
  aluDark: new MeshStandardMaterial({ color: "#151515", metalness: 0.6, roughness: 0.6 }),
  black: new MeshBasicMaterial({ color: "#050505" }),
};

// Glass: real refraction (MeshTransmissionMaterial) on capable machines, a lighter
// physical transmission material on phones and low-power devices.
export function Glass({ lite }: { lite: boolean }) {
  if (lite) return <primitive object={mats.glassLite} attach="material" />;
  return (
    <MeshTransmissionMaterial samples={6} resolution={512} thickness={0.35} roughness={0.04} ior={1.45}
      chromaticAberration={0.04} anisotropy={0.1} distortion={0.05} distortionScale={0.2} temporalDistortion={0.05}
      color="#F7F1E6" backside={false} envMapIntensity={1.3} />
  );
}

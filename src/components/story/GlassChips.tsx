"use client";
import { MeshPhysicalMaterial } from "three";
import { fontFamily } from "./textTexture";

// Smoked glass for the Services page's labels (the home story's chips are flat DOM now): real
// transmission on capable machines (it refracts whatever floats behind), a plain smoked panel on lite.
export function glass(lite: boolean, tint = "#3a3732") {
  return lite
    ? new MeshPhysicalMaterial({ color: tint === "#3a3732" ? "#24221f" : "#1f3328", roughness: 0.4, metalness: 0, transparent: true, opacity: 0.88, envMapIntensity: 0.4 })
    : new MeshPhysicalMaterial({ color: tint, transmission: 0.9, thickness: 0.05, roughness: 0.15, ior: 1.4, metalness: 0, envMapIntensity: 0.35, specularIntensity: 0.4, transparent: true, opacity: 1 });
}
let measureCtx: CanvasRenderingContext2D | null = null;
export function measure(text: string, size: number, weight: number) {
  if (!measureCtx) measureCtx = document.createElement("canvas").getContext("2d");
  measureCtx!.font = `${weight} ${size}px ${fontFamily()}`;
  return measureCtx!.measureText(text).width;
}


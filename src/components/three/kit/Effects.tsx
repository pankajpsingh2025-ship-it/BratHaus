"use client";
import { Bloom, EffectComposer, Noise, ToneMapping, Vignette } from "@react-three/postprocessing";
import { useThree } from "@react-three/fiber";
import { BlendFunction, ToneMappingMode } from "postprocessing";
import { useLayoutEffect } from "react";
import { HalfFloatType, NoToneMapping } from "three";

// Postprocessing for the home story: a soft bloom on the gold, a light vignette and film noise,
// ACES tone mapping at the end of the chain. Lite: a light bloom only.
// The canvas stays transparent (the hero headline and the screens' DOM show through it).
export default function Effects({ lite, enabled = true }: { lite: boolean; enabled?: boolean }) {
  const gl = useThree((s) => s.gl);
  // tone mapping happens in the effect chain, so the renderer must not apply it twice
  useLayoutEffect(() => { if (!enabled) return; const prev = gl.toneMapping; gl.toneMapping = NoToneMapping; return () => { gl.toneMapping = prev; }; }, [gl, enabled]);
  if (lite) {
    return (
      <EffectComposer multisampling={0} enabled={enabled} frameBufferType={HalfFloatType}>
        <Bloom mipmapBlur luminanceThreshold={0.9} intensity={0.4} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
    );
  }
  return (
    <EffectComposer multisampling={4} enabled={enabled} frameBufferType={HalfFloatType}>
      <Bloom mipmapBlur luminanceThreshold={0.9} intensity={0.6} />
      <Vignette offset={0.25} darkness={0.6} />
      <Noise opacity={0.025} blendFunction={BlendFunction.OVERLAY} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}

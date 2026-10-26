"use client";
import { Color, DoubleSide, Mesh, MeshBasicMaterial, PMREMGenerator, PlaneGeometry, Scene, type Texture, type WebGLRenderer } from "three";

// The studio environment: three soft light-formers (no HDR downloads), baked ONCE with PMREM and
// shared by the story and every View. A tall ivory strip on the left, a warm strip on the right
// and a softbox overhead: clean reflections on the glass, the titanium frame and the aluminium.
let env: Texture | null = null;
export function sharedEnv(gl: WebGLRenderer) {
  if (env) return env;
  const scene = new Scene();
  const former = (w: number, h: number, color: string, intensity: number, pos: [number, number, number]) => {
    const m = new Mesh(new PlaneGeometry(w, h), new MeshBasicMaterial({ color: new Color(color).multiplyScalar(intensity), side: DoubleSide, toneMapped: false }));
    m.position.set(...pos); m.lookAt(0, 0, 0); scene.add(m);
  };
  former(1.2, 9, "#F3EEE6", 2, [-5, 0.5, 2]);    // tall soft ivory strip, left
  former(1.2, 7, "#FFD9A8", 2.5, [5, 0.5, 1.5]);  // warm strip, right
  former(5, 3, "#FFFFFF", 1.5, [0, 6, 0.5]);      // softbox, top
  const pm = new PMREMGenerator(gl);
  env = pm.fromScene(scene, 0.02).texture;
  pm.dispose();
  scene.traverse((o) => { if (o instanceof Mesh) { o.geometry.dispose(); (o.material as MeshBasicMaterial).dispose(); } });
  return env;
}

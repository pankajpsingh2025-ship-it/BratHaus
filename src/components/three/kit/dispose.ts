"use client";
import { Material, Mesh, Points, LineSegments, Texture, type Object3D } from "three";

// Free everything under a scene graph when it unmounts, except shared, cached resources.
// (R3F disposes what it created from JSX, but not geometries/materials passed in as props.)
export function disposeTree(root: Object3D, keep: Set<unknown>) {
  const seen = new Set<unknown>();
  const freeMaterial = (m: Material) => {
    if (keep.has(m) || seen.has(m)) return;
    seen.add(m);
    for (const v of Object.values(m)) if (v instanceof Texture && !keep.has(v)) v.dispose();
    const u = (m as Material & { uniforms?: Record<string, { value: unknown }> }).uniforms;
    if (u) for (const k in u) { const v = u[k]?.value; if (v instanceof Texture && !keep.has(v)) v.dispose(); }
    m.dispose();
  };
  root.traverse((o) => {
    if (o instanceof Mesh || o instanceof Points || o instanceof LineSegments) {
      if (!keep.has(o.geometry) && !seen.has(o.geometry)) { seen.add(o.geometry); o.geometry.dispose(); }
      (Array.isArray(o.material) ? o.material : [o.material]).forEach(freeMaterial);
    }
  });
}

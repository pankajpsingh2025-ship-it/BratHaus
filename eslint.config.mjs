import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // React Three Fiber scenes mutate three.js objects every frame (materials, uniforms, geometry)
  // and seed particles with Math.random once. That's the R3F model, so the React Compiler's
  // purity/immutability rules are switched off for the 3D scene folder only.
  {
    files: ["src/components/three/**", "src/components/story/**"],
    ignores: ["src/components/story/Journey.tsx", "src/components/story/ChapterRing.tsx", "src/components/story/StoryStills.tsx", "src/components/story/ui/**"],
    rules: { "react-hooks/immutability": "off", "react-hooks/purity": "off", "react-hooks/refs": "off", "react-hooks/use-memo": "off" },
  },
  globalIgnores(["_previous-version/**", "_reports/**", "demos/**", "public/**"]),
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;

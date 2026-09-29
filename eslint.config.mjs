import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    // WebGL scenes mutate Three.js objects (uniforms, materials, cameras) inside
    // useFrame — the intended React Three Fiber pattern, not React state.
    files: ["src/components/**/*Scene.tsx"],
    rules: { "react-hooks/immutability": "off" },
  },
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts"] },
];

export default config;

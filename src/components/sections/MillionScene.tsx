"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { MotionValue } from "framer-motion";
import { gaussian, mulberry32 } from "@/lib/utils";

export const clusters = [
  { label: "Creators", tint: "#d69574", pos: [-9, 4, -2] },
  { label: "Entrepreneurs", tint: "#c4a877", pos: [8, 5.5, -4] },
  { label: "Students", tint: "#8fa3f2", pos: [-2, -7, 3] },
  { label: "Professionals", tint: "#9db2c6", pos: [11, -3, 2] },
  { label: "Founders", tint: "#f3f1eb", pos: [0.5, 1.2, 6] },
  { label: "Organizations", tint: "#a3ae7c", pos: [-11, -4, -5] },
  { label: "Communities", tint: "#e8b68c", pos: [3, 8, -9] },
] as const;

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uReveal;
  uniform vec3 uTints[7];
  attribute float aCluster;
  attribute float aSeed;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    float dist = -mv.z;
    gl_PointSize = clamp(uPixelRatio * 28.0 / dist, 1.0, 3.2 * uPixelRatio);
    int idx = int(floor(aCluster * 255.0 + 0.5));
    vec3 tint = idx < 7 ? uTints[idx] : vec3(0.85, 0.86, 0.9);
    vColor = mix(vec3(0.9, 0.9, 0.92), tint, 0.55);
    float twinkle = 0.75 + 0.25 * sin(uTime * (0.6 + aSeed * 1.6) + aSeed * 60.0);
    float born = smoothstep(aSeed * 0.9, aSeed * 0.9 + 0.1, uReveal);
    vAlpha = twinkle * born * smoothstep(0.4, 3.0, dist);
  }
`;

const fragment = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = dot(c, c);
    if (d > 0.25) discard;
    gl_FragColor = vec4(vColor, vAlpha * 0.32);
  }
`;

function buildCloud(count: number) {
  const rand = mulberry32(1_000_000);
  const pos = new Float32Array(count * 3);
  const cluster = new Uint8Array(count);
  const seed = new Float32Array(count);
  const centers = clusters.map((c) => c.pos);
  for (let i = 0; i < count; i++) {
    const r = rand();
    let x: number, y: number, z: number, k: number;
    if (r < 0.72) {
      // a cluster: a soft core with loose spiral arms
      k = i % centers.length;
      const [cx, cy, cz] = centers[k];
      const arm = rand() < 0.45;
      if (arm) {
        const t = rand() * 3.4;
        const a = t * 1.9 + (k * 1.3) + (rand() < 0.5 ? Math.PI : 0);
        const spread = 0.35 + t * 0.22;
        x = cx + Math.cos(a) * t * 1.15 + gaussian(rand) * spread;
        y = cy + gaussian(rand) * spread * 0.7;
        z = cz + Math.sin(a) * t * 1.15 + gaussian(rand) * spread;
      } else {
        const s = 1.05;
        x = cx + gaussian(rand) * s;
        y = cy + gaussian(rand) * s;
        z = cz + gaussian(rand) * s;
      }
    } else if (r < 0.88) {
      // filaments between clusters: conversations crossing groups
      const a = Math.floor(rand() * centers.length);
      let b = Math.floor(rand() * centers.length);
      if (b === a) b = (b + 1) % centers.length;
      const t = rand();
      const ca = centers[a];
      const cb = centers[b];
      const bow = Math.sin(t * Math.PI) * 2.2;
      x = ca[0] + (cb[0] - ca[0]) * t + gaussian(rand) * 0.35;
      y = ca[1] + (cb[1] - ca[1]) * t + gaussian(rand) * 0.35 + bow;
      z = ca[2] + (cb[2] - ca[2]) * t + gaussian(rand) * 0.35;
      k = t < 0.5 ? a : b;
    } else {
      // the wider field
      const gx = gaussian(rand), gy = gaussian(rand), gz = gaussian(rand);
      const l = Math.hypot(gx, gy, gz) || 1;
      const rr = 8 + Math.pow(rand(), 0.6) * 22;
      x = (gx / l) * rr;
      y = (gy / l) * rr * 0.7;
      z = (gz / l) * rr;
      k = 7;
    }
    pos[i * 3] = x;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = z;
    cluster[i] = k;
    seed[i] = rand();
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("aCluster", new THREE.BufferAttribute(cluster, 1, true));
  g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 60);
  return g;
}

function Cloud({ count, progress, reduced }: { count: number; progress: MotionValue<number>; reduced: boolean }) {
  const dpr = useThree((s) => s.viewport.dpr);
  const camera = useThree((s) => s.camera);
  const group = useRef<THREE.Group>(null);
  const geometry = useMemo(() => buildCloud(count), [count]);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uPixelRatio: { value: 1 },
          uReveal: { value: 0 },
          uTints: { value: clusters.map((c) => new THREE.Color(c.tint)) },
        },
      }),
    [],
  );
  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
  }, [geometry, material]);

  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);

  useFrame((_, dt) => {
    const p = progress.get();
    material.uniforms.uTime.value += dt;
    material.uniforms.uPixelRatio.value = dpr;
    material.uniforms.uReveal.value = Math.min(1, 0.15 + p * 3);
    // Scroll drives the journey: far above the network, then into it.
    const zoom = THREE.MathUtils.smoothstep(p, 0.42, 0.92);
    const z = THREE.MathUtils.lerp(62, 17, zoom);
    const y = THREE.MathUtils.lerp(10, 2.5, zoom);
    camera.position.set(Math.sin(p * 1.2) * 6 * zoom, y, z);
    camera.lookAt(0, 0, 0);
    if (group.current && !reduced) group.current.rotation.y += dt * 0.02;
    const labels = THREE.MathUtils.smoothstep(p, 0.62, 0.78);
    labelRefs.current.forEach((el) => {
      if (el) el.style.opacity = String(labels);
    });
  });

  return (
    <group ref={group}>
      <points geometry={geometry} material={material} frustumCulled={false} />
      {clusters.map((c, i) => (
        <Html
          key={c.label}
          position={[c.pos[0], c.pos[1] - 2.6, c.pos[2]]}
          center
          zIndexRange={[9, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div
            ref={(el) => void (labelRefs.current[i] = el)}
            className="flex items-center gap-2 whitespace-nowrap rounded-full border border-white/15 bg-obsidian/70 px-3 py-1.5 opacity-0 backdrop-blur-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: c.tint }} />
            <span className="label-sm text-paper">{c.label}</span>
          </div>
        </Html>
      ))}
    </group>
  );
}

export default function MillionScene({
  count,
  progress,
  active,
  reduced,
}: {
  count: number;
  progress: MotionValue<number>;
  active: boolean;
  reduced: boolean;
}) {
  return (
    <Canvas
      aria-hidden
      dpr={[1, 1.5]}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 10, 62], fov: 50, near: 0.1, far: 200 }}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0 }}
    >
      <Cloud count={count} progress={progress} reduced={reduced} />
    </Canvas>
  );
}

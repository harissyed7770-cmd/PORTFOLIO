"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { gaussian, mulberry32 } from "@/lib/utils";
import {
  constellationEdges,
  constellationPosition,
  constellations,
  type GenesisState,
  type GenesisTargets,
} from "./model";

export interface GenesisQuality {
  particles: number;
  field: number;
  hubs: number;
}

interface SceneProps {
  stateRef: React.RefObject<GenesisState>;
  targetsRef: React.RefObject<GenesisTargets>;
  quality: GenesisQuality;
  active: boolean;
}

const CAMERA_Z = 10;
const FOV = 50;
const NETWORK_RADIUS = 7.2;

/** World-space size of the frame at z = 0 for the resting camera. */
function useFrameSize() {
  const size = useThree((s) => s.size);
  const vh = 2 * CAMERA_Z * Math.tan(THREE.MathUtils.degToRad(FOV / 2));
  const aspect = size.width / Math.max(1, size.height);
  return { vw: vh * aspect, vh, aspect };
}

const particleVertex = /* glsl */ `
  uniform float uMorph;
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uOpacity;
  uniform float uRot;
  attribute vec3 aP0;
  attribute vec3 aP1;
  attribute vec3 aP2;
  attribute vec3 aB;
  attribute vec3 aP3;
  attribute vec3 aP4;
  attribute vec4 aRnd;
  attribute vec3 aTint;
  attribute float aBridge;
  varying float vAlpha;
  varying vec3 vColor;

  float stage(float m, float k, float r) {
    float t = clamp((m - k) * 1.7 - r * 0.7, 0.0, 1.0);
    return t * t * (3.0 - 2.0 * t);
  }
  vec3 rotY(vec3 p, float a) {
    float c = cos(a); float s = sin(a);
    return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
  }

  void main() {
    float r = aRnd.x;
    vec3 p2 = aP2;
    if (aBridge > 0.5) {
      p2 = mix(aP2, aB, fract(uTime * 0.05 * (0.4 + aRnd.y) + aRnd.z));
    }
    vec3 p4 = rotY(aP4, uRot);
    float s1 = stage(uMorph, 0.0, r);
    float s2 = stage(uMorph, 1.0, r);
    float s3 = stage(uMorph, 2.0, r);
    float s4 = stage(uMorph, 3.0, r);
    vec3 p = mix(aP0, aP1, s1);
    p = mix(p, p2, s2);
    p = mix(p, aP3, s3);
    p = mix(p, p4, s4);

    float textHold = s3 * (1.0 - s4);
    float drift = mix(0.09, 0.012, textHold);
    p += drift * vec3(
      sin(uTime * 0.55 + aRnd.y * 6.2831),
      cos(uTime * 0.45 + aRnd.z * 6.2831),
      sin(uTime * 0.35 + aRnd.w * 6.2831)
    );

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float size = uSize * (0.55 + aRnd.w * 0.9) * mix(1.0, 0.78, textHold);
    gl_PointSize = min(size * uPixelRatio * (${CAMERA_Z.toFixed(1)} / max(0.5, -mv.z)), 7.0 * uPixelRatio);

    float born = smoothstep(0.0, 0.12, uMorph);
    vAlpha = uOpacity * born * (0.35 + 0.65 * aRnd.y) * mix(1.0, 1.25, textHold) * smoothstep(1.5, 5.0, -mv.z);
    vec3 white = vec3(0.95, 0.945, 0.925);
    vColor = mix(white, aTint, s2 * (1.0 - s3) * 0.8 + s4 * 0.22);
  }
`;

const particleFragment = /* glsl */ `
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float a = pow(smoothstep(0.5, 0.0, d), 1.7);
    gl_FragColor = vec4(vColor, a * vAlpha);
  }
`;

const fieldVertex = /* glsl */ `
  uniform float uPixelRatio;
  uniform float uTime;
  attribute float aRnd;
  varying float vA;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = min((0.8 + aRnd * 1.3) * uPixelRatio * (${CAMERA_Z.toFixed(1)} / max(0.5, -mv.z)), 3.0 * uPixelRatio);
    vA = (0.25 + 0.75 * aRnd) * (0.75 + 0.25 * sin(uTime * 0.8 + aRnd * 40.0)) * smoothstep(2.0, 6.0, -mv.z);
  }
`;

const fieldFragment = /* glsl */ `
  uniform float uOpacity;
  varying float vA;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    if (length(c) > 0.5) discard;
    gl_FragColor = vec4(0.86, 0.87, 0.9, vA * uOpacity);
  }
`;

function spherePoint(rand: () => number, radius: number, inner = 0.55) {
  const x = gaussian(rand);
  const y = gaussian(rand);
  const z = gaussian(rand);
  const len = Math.hypot(x, y, z) || 1;
  const r = radius * (inner + (1 - inner) * Math.cbrt(rand()));
  return [(x / len) * r, (y / len) * r * 0.78, (z / len) * r] as const;
}

function Particles({ stateRef, targetsRef, count }: { stateRef: SceneProps["stateRef"]; targetsRef: SceneProps["targetsRef"]; count: number }) {
  const { vw, vh, aspect } = useFrameSize();
  const dpr = useThree((s) => s.viewport.dpr);
  const textVersion = useRef(-1);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const rand = mulberry32(11);
    const p0 = new Float32Array(count * 3);
    const p4 = new Float32Array(count * 3);
    const rnd = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      const [x, y, z] = spherePoint(rand, 0.06, 0);
      p0.set([x, y, z], i * 3);
      p4.set(spherePoint(rand, NETWORK_RADIUS), i * 3);
      rnd.set([rand(), rand(), rand(), rand()], i * 4);
    }
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute("aP0", new THREE.BufferAttribute(p0, 3));
    g.setAttribute("aP1", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute("aP2", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute("aB", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute("aP3", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute("aP4", new THREE.BufferAttribute(p4, 3));
    g.setAttribute("aRnd", new THREE.BufferAttribute(rnd, 4));
    g.setAttribute("aTint", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute("aBridge", new THREE.BufferAttribute(new Float32Array(count), 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 50);
    return g;
  }, [count]);

  // Layout that depends on the frame: cloud, constellations, bridges.
  useEffect(() => {
    const rand = mulberry32(23);
    const p1 = geometry.getAttribute("aP1") as THREE.BufferAttribute;
    const p2 = geometry.getAttribute("aP2") as THREE.BufferAttribute;
    const pb = geometry.getAttribute("aB") as THREE.BufferAttribute;
    const p3 = geometry.getAttribute("aP3") as THREE.BufferAttribute;
    const tint = geometry.getAttribute("aTint") as THREE.BufferAttribute;
    const bridge = geometry.getAttribute("aBridge") as THREE.BufferAttribute;
    const cloudR = 0.44 * Math.min(vw, vh * 1.1);
    const centers = constellations.map((_, i) => {
      const p = constellationPosition(i, aspect);
      return new THREE.Vector3(p.x * vw, p.y * vh, 0);
    });
    const tints = constellations.map((c) => new THREE.Color(c.tint));
    const weights = constellations.map((c) => c.weight);
    const total = weights.reduce((a, b) => a + b, 0);
    const sigma = 0.034 * Math.min(vh, vw * 1.4);

    for (let i = 0; i < count; i++) {
      const [cx, cy, cz] = spherePoint(rand, cloudR, 0);
      p1.setXYZ(i, cx, cy * 1.1, cz * 0.6);

      if (rand() < 0.16) {
        const [a, b] = constellationEdges[Math.floor(rand() * constellationEdges.length)];
        p2.setXYZ(i, centers[a].x, centers[a].y, 0);
        pb.setXYZ(i, centers[b].x, centers[b].y, 0);
        bridge.setX(i, 1);
        const c = tints[a].clone().lerp(tints[b], 0.5);
        tint.setXYZ(i, c.r, c.g, c.b);
      } else {
        let pick = rand() * total;
        let k = 0;
        while (pick > weights[k] && k < weights.length - 1) pick -= weights[k++];
        const s = sigma * (k === 0 ? 1.5 : 1);
        const gx = Math.max(-2.4, Math.min(2.4, gaussian(rand)));
        const gy = Math.max(-2.4, Math.min(2.4, gaussian(rand)));
        p2.setXYZ(i, centers[k].x + gx * s, centers[k].y + gy * s, gaussian(rand) * s * 0.6);
        bridge.setX(i, 0);
        tint.setXYZ(i, tints[k].r, tints[k].g, tints[k].b);
      }
      // Fallback text target until real glyph targets arrive.
      const a = rand() * Math.PI * 2;
      p3.setXYZ(i, Math.cos(a) * vh * 0.18, Math.sin(a) * vh * 0.05, 0);
    }
    [p1, p2, pb, p3, tint, bridge].forEach((a) => (a.needsUpdate = true));
    textVersion.current = -1;
  }, [geometry, vw, vh, aspect, count]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: particleVertex,
        fragmentShader: particleFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uMorph: { value: 0 },
          uTime: { value: 0 },
          uSize: { value: 2.5 },
          uPixelRatio: { value: 1 },
          uOpacity: { value: 1 },
          uRot: { value: 0 },
        },
      }),
    [],
  );

  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
  }, [geometry, material]);

  useFrame((_, delta) => {
    const s = stateRef.current;
    const t = targetsRef.current;
    if (!s) return;
    if (t?.text && t.version !== textVersion.current) {
      const p3 = geometry.getAttribute("aP3") as THREE.BufferAttribute;
      const rand = mulberry32(5);
      for (let i = 0; i < count; i++) {
        p3.setXYZ(i, t.text[i * 2] * vw, t.text[i * 2 + 1] * vh, (rand() - 0.5) * 0.06);
      }
      p3.needsUpdate = true;
      textVersion.current = t.version;
    }
    const u = material.uniforms;
    u.uMorph.value = s.morph;
    u.uTime.value += delta;
    u.uOpacity.value = s.opacity;
    u.uPixelRatio.value = dpr;
    u.uSize.value = vw < 8 ? 2.1 : 2.5;
    u.uRot.value += delta * 0.035 * Math.max(0, Math.min(1, s.morph - 3));
  });

  return <points geometry={geometry} material={material} frustumCulled={false} />;
}

function ConstellationLines({ stateRef }: { stateRef: SceneProps["stateRef"] }) {
  const { vw, vh, aspect } = useFrameSize();
  const ref = useRef<THREE.LineSegments>(null);
  const geometry = useMemo(() => {
    const pos = new Float32Array(constellationEdges.length * 6);
    constellationEdges.forEach(([a, b], i) => {
      const pa = constellationPosition(a, aspect);
      const pb = constellationPosition(b, aspect);
      pos.set([pa.x * vw, pa.y * vh, 0, pb.x * vw, pb.y * vh, 0], i * 6);
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [vw, vh, aspect]);
  const material = useMemo(
    () => new THREE.LineBasicMaterial({ color: "#dfe1e5", transparent: true, opacity: 0, depthWrite: false }),
    [],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame(() => {
    material.opacity = (stateRef.current?.lines ?? 0) * 0.2;
    if (ref.current) ref.current.visible = material.opacity > 0.001;
  });
  return <lineSegments ref={ref} geometry={geometry} material={material} />;
}

function Network({ stateRef, quality }: { stateRef: SceneProps["stateRef"]; quality: GenesisQuality }) {
  const dpr = useThree((s) => s.viewport.dpr);
  const group = useRef<THREE.Group>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const fieldRef = useRef<THREE.Points>(null);

  // Relationships between hub particles (the first `hubs` particles share
  // their network positions with the Particles component: same seed & order).
  const lineGeometry = useMemo(() => {
    const rand = mulberry32(11);
    const hubs: number[] = [];
    for (let i = 0; i < quality.hubs; i++) {
      spherePoint(rand, 0.06, 0);
      const p = spherePoint(rand, NETWORK_RADIUS);
      hubs.push(p[0], p[1], p[2]);
      rand(); rand(); rand(); rand();
    }
    const n = quality.hubs;
    const segs: number[] = [];
    for (let i = 0; i < n; i++) {
      let best1 = -1, best2 = -1, d1 = Infinity, d2 = Infinity;
      for (let j = 0; j < n; j++) {
        if (i === j) continue;
        const dx = hubs[i * 3] - hubs[j * 3];
        const dy = hubs[i * 3 + 1] - hubs[j * 3 + 1];
        const dz = hubs[i * 3 + 2] - hubs[j * 3 + 2];
        const d = dx * dx + dy * dy + dz * dz;
        if (d < d1) { d2 = d1; best2 = best1; d1 = d; best1 = j; }
        else if (d < d2) { d2 = d; best2 = j; }
      }
      for (const j of [best1, best2]) {
        if (j < 0 || j < i) continue;
        segs.push(hubs[i * 3], hubs[i * 3 + 1], hubs[i * 3 + 2], hubs[j * 3], hubs[j * 3 + 1], hubs[j * 3 + 2]);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(segs), 3));
    return g;
  }, [quality.hubs]);

  const fieldGeometry = useMemo(() => {
    const rand = mulberry32(97);
    const pos = new Float32Array(quality.field * 3);
    const rnd = new Float32Array(quality.field);
    for (let i = 0; i < quality.field; i++) {
      pos.set(spherePoint(rand, NETWORK_RADIUS * 1.35, 0.35), i * 3);
      rnd[i] = rand();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aRnd", new THREE.BufferAttribute(rnd, 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 50);
    return g;
  }, [quality.field]);

  const lineMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: "#cfd3da",
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );
  const fieldMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: fieldVertex,
        fragmentShader: fieldFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uOpacity: { value: 0 }, uPixelRatio: { value: 1 }, uTime: { value: 0 } },
      }),
    [],
  );

  useEffect(() => () => {
    lineGeometry.dispose();
    fieldGeometry.dispose();
  }, [lineGeometry, fieldGeometry]);

  const rot = useRef(0);
  useFrame((_, delta) => {
    const s = stateRef.current;
    if (!s || !group.current) return;
    rot.current += delta * 0.035 * Math.max(0, Math.min(1, s.morph - 3));
    group.current.rotation.y = rot.current;
    lineMaterial.opacity = s.netLines * 0.09 * s.opacity;
    fieldMaterial.uniforms.uOpacity.value = s.field * 0.5 * s.opacity;
    fieldMaterial.uniforms.uPixelRatio.value = dpr;
    fieldMaterial.uniforms.uTime.value += delta;
    if (linesRef.current) linesRef.current.visible = lineMaterial.opacity > 0.001;
    if (fieldRef.current) fieldRef.current.visible = fieldMaterial.uniforms.uOpacity.value > 0.001;
  });

  return (
    <group ref={group}>
      <lineSegments ref={linesRef} geometry={lineGeometry} material={lineMaterial} frustumCulled={false} />
      <points ref={fieldRef} geometry={fieldGeometry} material={fieldMaterial} frustumCulled={false} />
    </group>
  );
}

function CameraRig({ stateRef }: { stateRef: SceneProps["stateRef"] }) {
  const camera = useThree((s) => s.camera);
  const pointer = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = e.clientX / window.innerWidth - 0.5;
      pointer.current.y = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
  useFrame(() => {
    const s = stateRef.current;
    if (!s) return;
    const settled = Math.max(0, Math.min(1, s.morph - 3));
    const tx = pointer.current.x * 0.6 * settled;
    const ty = -pointer.current.y * 0.4 * settled;
    camera.position.x += (tx - camera.position.x) * 0.04;
    camera.position.y += (ty - camera.position.y) * 0.04;
    camera.position.z = CAMERA_Z - s.warp * 8.5;
    camera.lookAt(0, 0, -s.warp * 12);
  });
  return null;
}

export default function GenesisScene({ stateRef, targetsRef, quality, active }: SceneProps) {
  return (
    <Canvas
      aria-hidden
      dpr={[1, 1.75]}
      frameloop={active ? "always" : "never"}
      camera={{ position: [0, 0, CAMERA_Z], fov: FOV, near: 0.1, far: 120 }}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0 }}
    >
      <CameraRig stateRef={stateRef} />
      <Network stateRef={stateRef} quality={quality} />
      <ConstellationLines stateRef={stateRef} />
      <Particles stateRef={stateRef} targetsRef={targetsRef} count={quality.particles} />
    </Canvas>
  );
}

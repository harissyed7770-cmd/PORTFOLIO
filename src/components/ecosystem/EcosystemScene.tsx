"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Billboard, Html, OrbitControls, QuadraticBezierLine } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { person, type ThemeId, type World } from "@/content/ecosystem";
import { gaussian, mulberry32 } from "@/lib/utils";
import { placeWorlds, placedLinks, type PlacedWorld } from "./layout";

export interface EcosystemSceneProps {
  selected: string | null;
  hovered: string | null;
  lens: ThemeId | null;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
  engaged: boolean;
  touch: boolean;
  zoomSignal: { n: number; dir: 1 | -1 };
  resetSignal: number;
  active: boolean;
  reduced: boolean;
}

const DEFAULT_CAMERA = new THREE.Vector3(0, 7.2, 15.5);
const ORIGIN = new THREE.Vector3(0, 0, 0);

let glowTexture: THREE.Texture | null = null;
function getGlowTexture() {
  if (glowTexture) return glowTexture;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.25, "rgba(255,255,255,0.45)");
  g.addColorStop(0.6, "rgba(255,255,255,0.08)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  glowTexture = new THREE.CanvasTexture(c);
  return glowTexture;
}

function Glow({ color, scale, opacity }: { color: string; scale: number; opacity: number }) {
  const tex = useMemo(() => getGlowTexture(), []);
  return (
    <sprite scale={[scale, scale, 1]}>
      <spriteMaterial map={tex} color={color} transparent opacity={opacity} depthWrite={false} blending={THREE.AdditiveBlending} />
    </sprite>
  );
}

const scanVertex = /* glsl */ `
  varying vec3 vPos;
  varying vec3 vNormal;
  void main() {
    vPos = position;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const scanFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec3 vPos;
  varying vec3 vNormal;
  void main() {
    float band = smoothstep(0.35, 0.5, abs(fract(vPos.y * 9.0 - uTime * 0.6) - 0.5) * 2.0);
    float rim = pow(1.0 - abs(vNormal.z), 2.0);
    vec3 col = mix(uColor * 0.35, vec3(0.96), band * 0.55) + rim * uColor * 0.8;
    gl_FragColor = vec4(col, uOpacity);
  }
`;

function ScanSphere({ color, opacity }: { color: string; opacity: number }) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: scanVertex,
        fragmentShader: scanFragment,
        transparent: true,
        uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color(color) }, uOpacity: { value: 1 } },
      }),
    [color],
  );
  useFrame((_, dt) => {
    mat.uniforms.uTime.value += dt;
    mat.uniforms.uOpacity.value = opacity;
  });
  return (
    <mesh material={mat}>
      <sphereGeometry args={[0.4, 48, 32]} />
    </mesh>
  );
}

function HaloRings({ color, opacity }: { color: string; opacity: number }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  useFrame(({ clock }) => {
    refs.current.forEach((m, i) => {
      if (!m) return;
      const t = (clock.elapsedTime * 0.35 + i / 3) % 1;
      m.scale.setScalar(1 + t * 1.8);
      (m.material as THREE.MeshBasicMaterial).opacity = (1 - t) * 0.55 * opacity;
    });
  });
  return (
    <Billboard>
      {[0, 1, 2].map((i) => (
        <mesh key={i} ref={(el) => void (refs.current[i] = el)}>
          <ringGeometry args={[0.42, 0.435, 64]} />
          <meshBasicMaterial color={color} transparent depthWrite={false} />
        </mesh>
      ))}
    </Billboard>
  );
}

function DialTicks({ color, opacity }: { color: string; opacity: number }) {
  const hand = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (hand.current) hand.current.rotation.z -= dt * 0.8;
  });
  return (
    <Billboard>
      {Array.from({ length: 24 }, (_, i) => {
        const a = (i / 24) * Math.PI * 2;
        const long = i % 6 === 0;
        const r = 0.6;
        return (
          <mesh key={i} position={[Math.cos(a) * r, Math.sin(a) * r, 0]} rotation={[0, 0, a]}>
            <planeGeometry args={[long ? 0.12 : 0.06, 0.012]} />
            <meshBasicMaterial color={color} transparent opacity={(long ? 0.95 : 0.5) * opacity} depthWrite={false} />
          </mesh>
        );
      })}
      <group ref={hand}>
        <mesh position={[0.3, 0, 0]}>
          <planeGeometry args={[0.6, 0.01]} />
          <meshBasicMaterial color="#f3f1eb" transparent opacity={0.8 * opacity} depthWrite={false} />
        </mesh>
      </group>
    </Billboard>
  );
}

function Community({ color, opacity }: { color: string; opacity: number }) {
  const members = useMemo(() => {
    const rand = mulberry32(8);
    return Array.from({ length: 16 }, (_, i) => {
      const y = 1 - (i / 15) * 2;
      const r = Math.sqrt(1 - y * y);
      const a = i * 2.39996;
      const s = 0.36 + rand() * 0.08;
      return { p: [Math.cos(a) * r * s, y * s, Math.sin(a) * r * s] as [number, number, number], size: 0.05 + rand() * 0.05 };
    });
  }, []);
  return (
    <group>
      {members.map((m, i) => (
        <mesh key={i} position={m.p}>
          <sphereGeometry args={[m.size, 12, 12]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} transparent opacity={opacity} />
        </mesh>
      ))}
      <mesh>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial color="#fff4e8" transparent opacity={opacity} />
      </mesh>
    </group>
  );
}

function Satellites({ color, opacity, count = 6, radius = 0.62 }: { color: string; opacity: number; count?: number; radius?: number }) {
  const g = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (g.current) g.current.rotation.y += dt * 0.5;
  });
  return (
    <group ref={g} rotation={[0.5, 0, 0.2]}>
      {Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * radius, 0, Math.sin(a) * radius]}>
            <sphereGeometry args={[0.045, 10, 10]} />
            <meshBasicMaterial color={color} transparent opacity={opacity} />
          </mesh>
        );
      })}
    </group>
  );
}

function Plots({ opacity }: { opacity: number }) {
  return (
    <group rotation={[0.35, 0, 0]}>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.68, 0, Math.sin(a) * 0.68]} rotation={[0, -a, 0]}>
            <boxGeometry args={[0.1, 0.02 + (i % 3) * 0.05, 0.14]} />
            <meshStandardMaterial color="#d8cbb2" transparent opacity={opacity} />
          </mesh>
        );
      })}
    </group>
  );
}

function PlanetBody({ world, opacity }: { world: World; opacity: number }) {
  const c = world.accent;
  switch (world.form) {
    case "lattice":
      return (
        <>
          <mesh>
            <icosahedronGeometry args={[0.46, 1]} />
            <meshBasicMaterial color={c} wireframe transparent opacity={0.85 * opacity} />
          </mesh>
          <mesh>
            <icosahedronGeometry args={[0.2, 0]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={opacity} />
          </mesh>
        </>
      );
    case "faceted":
      return (
        <mesh>
          <octahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial color={c} flatShading metalness={0.55} roughness={0.28} emissive={c} emissiveIntensity={0.12} transparent opacity={opacity} />
        </mesh>
      );
    case "ringed":
      return (
        <>
          <mesh>
            <sphereGeometry args={[0.34, 48, 32]} />
            <meshStandardMaterial color={c} roughness={0.45} emissive={c} emissiveIntensity={0.15} transparent opacity={opacity} />
          </mesh>
          <mesh rotation={[1.2, 0.2, 0]}>
            <torusGeometry args={[0.62, 0.008, 8, 128]} />
            <meshBasicMaterial color="#f3f1eb" transparent opacity={0.8 * opacity} />
          </mesh>
          <mesh rotation={[1.9, -0.3, 0]}>
            <torusGeometry args={[0.74, 0.005, 8, 128]} />
            <meshBasicMaterial color={c} transparent opacity={0.6 * opacity} />
          </mesh>
        </>
      );
    case "halo":
      return (
        <>
          <mesh>
            <sphereGeometry args={[0.36, 48, 32]} />
            <meshStandardMaterial color={c} roughness={0.5} emissive={c} emissiveIntensity={0.2} transparent opacity={opacity} />
          </mesh>
          <HaloRings color={c} opacity={opacity} />
        </>
      );
    case "globe":
      return (
        <>
          <mesh>
            <sphereGeometry args={[0.4, 48, 32]} />
            <meshStandardMaterial color="#f3f1eb" roughness={0.8} transparent opacity={0.95 * opacity} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.415, 14, 9]} />
            <meshBasicMaterial color={c} wireframe transparent opacity={0.7 * opacity} />
          </mesh>
        </>
      );
    case "dial":
      return (
        <>
          <mesh>
            <sphereGeometry args={[0.32, 48, 32]} />
            <meshStandardMaterial color={c} roughness={0.4} emissive={c} emissiveIntensity={0.18} transparent opacity={opacity} />
          </mesh>
          <DialTicks color={c} opacity={opacity} />
        </>
      );
    case "scan":
      return <ScanSphere color={c} opacity={opacity} />;
    case "community":
      return <Community color={c} opacity={opacity} />;
    case "bloom":
      return (
        <>
          <mesh>
            <sphereGeometry args={[0.3, 40, 24]} />
            <meshStandardMaterial color={c} roughness={0.6} emissive={c} emissiveIntensity={0.25} transparent opacity={opacity} />
          </mesh>
          <Satellites color={c} opacity={opacity} />
        </>
      );
    case "terrain":
      return (
        <>
          <mesh>
            <dodecahedronGeometry args={[0.42, 0]} />
            <meshStandardMaterial color={c} flatShading roughness={0.85} transparent opacity={opacity} />
          </mesh>
          <Plots opacity={opacity} />
        </>
      );
  }
}

function Planet({
  placed,
  lit,
  selected,
  hovered,
  onSelect,
  onHover,
  reduced,
}: {
  placed: PlacedWorld;
  lit: boolean;
  selected: boolean;
  hovered: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  reduced: boolean;
}) {
  const g = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const seed = useMemo(() => placed.position[0] * 3.1 + placed.position[2], [placed]);
  const opacity = lit ? 1 : 0.16;
  useFrame(({ clock }, dt) => {
    if (!g.current || !body.current) return;
    if (!reduced) {
      g.current.position.y = placed.position[1] + Math.sin(clock.elapsedTime * 0.6 + seed) * 0.12;
      body.current.rotation.y += dt * 0.25;
    }
    const target = selected ? 1.35 : hovered ? 1.18 : 1;
    const s = body.current.scale.x + (target - body.current.scale.x) * Math.min(1, dt * 6);
    body.current.scale.setScalar(s);
  });
  const w = placed.world;
  return (
    <group ref={g} position={placed.position}>
      <Glow color={w.accent} scale={selected ? 3.4 : 2.4} opacity={(selected || hovered ? 0.55 : 0.3) * opacity} />
      <group ref={body}>
        <PlanetBody world={w} opacity={opacity} />
      </group>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelect(w.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(w.id);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          onHover(null);
          document.body.style.cursor = "";
        }}
      >
        <sphereGeometry args={[0.85, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>
      <Html center position={[0, -0.95, 0]} zIndexRange={[9, 0]} style={{ pointerEvents: "none" }}>
        <div
          className="flex flex-col items-center gap-1 whitespace-nowrap transition-opacity duration-500"
          style={{ opacity: lit ? 1 : 0.2 }}
        >
          <span className="label-sm" style={{ color: w.accent }}>
            {w.mark}
          </span>
          <span className={`text-[13px] font-medium tracking-tight ${selected || hovered ? "text-white" : "text-platinum"}`}>{w.name}</span>
        </div>
      </Html>
    </group>
  );
}

function Core({ reduced }: { reduced: boolean }) {
  const shell = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const rand = mulberry32(3);
    const n = 900;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const x = gaussian(rand), y = gaussian(rand), z = gaussian(rand);
      const l = Math.hypot(x, y, z) || 1;
      const r = 0.75 + rand() * 0.9;
      pos.set([(x / l) * r, (y / l) * r * 0.9, (z / l) * r], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  useFrame((_, dt) => {
    if (shell.current && !reduced) shell.current.rotation.y += dt * 0.12;
  });
  return (
    <group>
      <Glow color="#ffffff" scale={4.2} opacity={0.5} />
      <mesh>
        <sphereGeometry args={[0.46, 48, 32]} />
        <meshBasicMaterial color="#f7f6f2" />
      </mesh>
      <points ref={shell} geometry={geo}>
        <pointsMaterial size={0.025} color="#e8e9ec" transparent opacity={0.7} depthWrite={false} sizeAttenuation />
      </points>
      <Html center position={[0, -1.05, 0]} zIndexRange={[9, 0]} style={{ pointerEvents: "none" }}>
        <div className="flex flex-col items-center gap-1 whitespace-nowrap">
          <span className="label-sm text-ash">Core</span>
          <span className="display text-[17px] text-paper">{person.name}</span>
        </div>
      </Html>
    </group>
  );
}

function Pulses({ placed, litIds, reduced }: { placed: PlacedWorld[]; litIds: Set<string>; reduced: boolean }) {
  const curves = useMemo(
    () =>
      placed.map((p) => {
        const end = new THREE.Vector3(...p.position);
        const mid = end.clone().multiplyScalar(0.5).add(new THREE.Vector3(0, 1.4, 0));
        return new THREE.QuadraticBezierCurve3(ORIGIN.clone(), mid, end);
      }),
    [placed],
  );
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  useFrame(({ clock }) => {
    refs.current.forEach((m, i) => {
      if (!m) return;
      const t = reduced ? 0.5 : (clock.elapsedTime * 0.12 + i * 0.37) % 1;
      m.position.copy(curves[i].getPoint(t));
      const lit = litIds.has(placed[i].world.id);
      (m.material as THREE.MeshBasicMaterial).opacity = (lit ? 0.9 : 0.1) * Math.sin(t * Math.PI);
    });
  });
  return (
    <>
      {placed.map((p, i) => (
        <mesh key={p.world.id} ref={(el) => void (refs.current[i] = el)}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshBasicMaterial color={p.world.accent} transparent depthWrite={false} />
        </mesh>
      ))}
    </>
  );
}

function Stars() {
  const geo = useMemo(() => {
    const rand = mulberry32(17);
    const n = 2600;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const x = gaussian(rand), y = gaussian(rand), z = gaussian(rand);
      const l = Math.hypot(x, y, z) || 1;
      const r = 40 + rand() * 40;
      pos.set([(x / l) * r, (y / l) * r, (z / l) * r], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  return (
    <points geometry={geo}>
      <pointsMaterial size={1.2} sizeAttenuation={false} color="#8a8e98" transparent opacity={0.5} depthWrite={false} />
    </points>
  );
}

function Director({
  selectedPos,
  zoomSignal,
  resetSignal,
}: {
  selectedPos: [number, number, number] | null;
  zoomSignal: EcosystemSceneProps["zoomSignal"];
  resetSignal: number;
}) {
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null;
  const camera = useThree((s) => s.camera);
  const goal = useRef<{ pos: THREE.Vector3; target: THREE.Vector3 } | null>(null);

  useEffect(() => {
    if (selectedPos) {
      const target = new THREE.Vector3(...selectedPos);
      const out = target.clone().setY(0).normalize();
      const pos = target.clone().add(out.multiplyScalar(4.2)).add(new THREE.Vector3(0, 1.3, 0));
      goal.current = { pos, target };
    } else {
      goal.current = { pos: DEFAULT_CAMERA.clone(), target: ORIGIN.clone() };
    }
  }, [selectedPos, resetSignal]);

  const look = useRef(ORIGIN.clone());

  useEffect(() => {
    if (!zoomSignal.n) return;
    const target = controls ? controls.target.clone() : look.current.clone();
    const dir = camera.position.clone().sub(target);
    const len = THREE.MathUtils.clamp(dir.length() * (zoomSignal.dir > 0 ? 0.78 : 1.28), 3, 26);
    goal.current = { pos: target.clone().add(dir.setLength(len)), target };
  }, [zoomSignal, controls, camera]);

  useEffect(() => {
    if (!controls) return;
    controls.target.copy(look.current);
    const cancel = () => (goal.current = null);
    controls.addEventListener("start", cancel);
    return () => controls.removeEventListener("start", cancel);
  }, [controls]);

  useFrame((_, dt) => {
    if (!goal.current) return;
    const k = 1 - Math.pow(0.02, dt);
    camera.position.lerp(goal.current.pos, k);
    look.current.lerp(goal.current.target, k);
    if (controls) {
      controls.target.copy(look.current);
      controls.update();
    } else {
      camera.lookAt(look.current);
    }
    if (camera.position.distanceTo(goal.current.pos) < 0.02 && look.current.distanceTo(goal.current.target) < 0.02) {
      goal.current = null;
    }
  });
  return null;
}

function Scene(props: EcosystemSceneProps) {
  const { selected, hovered, lens, onSelect, onHover, engaged, touch, zoomSignal, resetSignal, reduced } = props;
  const placed = useMemo(() => placeWorlds(), []);
  const byId = useMemo(() => Object.fromEntries(placed.map((p) => [p.world.id, p])), [placed]);

  const focus = hovered ?? selected;
  const litIds = useMemo(() => {
    if (lens) return new Set(placed.filter((p) => p.world.themes.includes(lens)).map((p) => p.world.id));
    if (focus) {
      const s = new Set([focus]);
      placedLinks.forEach((l) => {
        if (l.a === focus) s.add(l.b);
        if (l.b === focus) s.add(l.a);
      });
      return s;
    }
    return new Set(placed.map((p) => p.world.id));
  }, [lens, focus, placed]);

  const selectedPos = selected ? byId[selected]?.position ?? null : null;
  const controlsEnabled = !touch || engaged;

  return (
    <>
      <color attach="background" args={["#06070a"]} />
      <fog attach="fog" args={["#06070a", 18, 42]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[6, 8, 5]} intensity={1.6} color="#fff6ea" />
      <directionalLight position={[-8, -3, -6]} intensity={0.5} color="#9db2c6" />
      <pointLight position={[0, 0, 0]} intensity={18} distance={14} color="#ffffff" />

      <Stars />
      <Core reduced={reduced} />

      {placed.map((p) => {
        const lit = litIds.has(p.world.id);
        const mid: [number, number, number] = [p.position[0] * 0.5, p.position[1] * 0.5 + 1.4, p.position[2] * 0.5];
        return (
          <QuadraticBezierLine
            key={`core-${p.world.id}`}
            start={[0, 0, 0]}
            end={p.position}
            mid={mid}
            color={p.world.accent}
            lineWidth={lit ? 1.2 : 0.6}
            transparent
            opacity={lit ? 0.45 : 0.06}
            depthWrite={false}
          />
        );
      })}

      {placedLinks.map((l) => {
        const a = byId[l.a];
        const b = byId[l.b];
        if (!a || !b) return null;
        const onLens = lens ? l.themes.includes(lens) : false;
        const onFocus = focus ? l.a === focus || l.b === focus : false;
        const strong = onLens || onFocus;
        const mid: [number, number, number] = [
          (a.position[0] + b.position[0]) * 0.35,
          (a.position[1] + b.position[1]) * 0.5 - 0.6,
          (a.position[2] + b.position[2]) * 0.35,
        ];
        return (
          <QuadraticBezierLine
            key={`${l.a}-${l.b}`}
            start={a.position}
            end={b.position}
            mid={mid}
            color={strong ? "#f3f1eb" : "#7d818b"}
            lineWidth={strong ? 1.1 : 0.5}
            dashed={!strong}
            dashSize={0.18}
            gapSize={0.14}
            transparent
            opacity={strong ? 0.6 : lens || focus ? 0.03 : 0.12}
            depthWrite={false}
          />
        );
      })}

      <Pulses placed={placed} litIds={litIds} reduced={reduced} />

      {placed.map((p) => (
        <Planet
          key={p.world.id}
          placed={p}
          lit={litIds.has(p.world.id)}
          selected={selected === p.world.id}
          hovered={hovered === p.world.id}
          onSelect={onSelect}
          onHover={onHover}
          reduced={reduced}
        />
      ))}

      {controlsEnabled && (
        <OrbitControls
          makeDefault
          enablePan={false}
          enableZoom={engaged}
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.55}
          minDistance={3}
          maxDistance={26}
          autoRotate={!reduced && !selected && !hovered}
          autoRotateSpeed={0.35}
          minPolarAngle={0.25}
          maxPolarAngle={Math.PI - 0.35}
        />
      )}
      <Director selectedPos={selectedPos} zoomSignal={zoomSignal} resetSignal={resetSignal} />
    </>
  );
}

export default function EcosystemScene(props: EcosystemSceneProps) {
  return (
    <Canvas
      aria-hidden
      dpr={[1, 1.75]}
      frameloop={props.active ? "always" : "never"}
      camera={{ position: DEFAULT_CAMERA.toArray(), fov: 45, near: 0.1, far: 200 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      onPointerMissed={() => props.onSelect(null)}
      style={{ position: "absolute", inset: 0, touchAction: props.touch && !props.engaged ? "pan-y" : "none" }}
    >
      <Scene {...props} />
    </Canvas>
  );
}

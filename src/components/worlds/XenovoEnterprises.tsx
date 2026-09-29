"use client";

import { useRef } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { worldById } from "@/content/ecosystem";
import { useMotionNumber, useSectionProgress } from "@/components/ui/primitives";
import { clamp, cn, lerp } from "@/lib/utils";
import { WorldShell } from "./WorldShell";

const world = worldById["xenovo-enterprises"];
const BRASS = world.accent;

const stages = [
  { name: "Idea", line: "It starts as a single point." },
  { name: "Experiment", line: "Tested, broken, tested again." },
  { name: "Product", line: "It takes a shape people can use." },
  { name: "Business", line: "It learns to sustain itself." },
  { name: "Ecosystem", line: "It connects to everything else." },
];

const N = 48;

/** Polygon (N points) describing the core form at each stage. */
function coreShape(stage: number): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 - Math.PI / 2;
    let r: number;
    switch (stage) {
      case 0:
        r = 7;
        break;
      case 1:
        r = i % 2 === 0 ? 74 : 44 + (i % 6) * 4;
        break;
      case 2: {
        // rounded square
        const c = Math.cos(a);
        const s = Math.sin(a);
        const k = 4;
        r = 86 / Math.pow(Math.pow(Math.abs(c), k) + Math.pow(Math.abs(s), k), 1 / k);
        break;
      }
      case 3: {
        const c = Math.cos(a);
        const s = Math.sin(a);
        const k = 8;
        r = 34 / Math.pow(Math.pow(Math.abs(c), k) + Math.pow(Math.abs(s), k), 1 / k);
        break;
      }
      default:
        r = 26;
    }
    pts.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  return pts;
}

const shapes = [0, 1, 2, 3, 4].map(coreShape);

function stageValue(p: number) {
  // Five stages, each holds then transitions into the next.
  const t = clamp((p - 0.04) / 0.86) * 4;
  const i = Math.floor(t);
  const f = t - i;
  const eased = f < 0.45 ? 0 : (f - 0.45) / 0.55;
  const smooth = eased * eased * (3 - 2 * eased);
  return Math.min(4, i + smooth);
}

function pathFor(s: number) {
  const i = Math.min(3, Math.floor(s));
  const f = s - i;
  const a = shapes[i];
  const b = shapes[Math.min(4, i + 1)];
  let d = "";
  for (let k = 0; k < N; k++) {
    const x = lerp(a[k][0], b[k][0], f);
    const y = lerp(a[k][1], b[k][1], f);
    d += `${k === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return d + "Z";
}

/** Eight satellites: fragments in the experiment, units in the business, nodes in the ecosystem. */
function satelliteState(i: number, s: number) {
  const gridCells = [
    [-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1],
  ];
  const ringA = (i / 8) * Math.PI * 2 - Math.PI / 2;
  const orbitA = (i / 3) * Math.PI * 2;
  const states = [
    { x: 0, y: 0, size: 0, round: 1, o: 0 },
    i < 3 ? { x: Math.cos(orbitA) * 118, y: Math.sin(orbitA) * 118, size: 12, round: 0.2, o: 0.9 } : { x: 0, y: 0, size: 0, round: 1, o: 0 },
    { x: 0, y: 0, size: 0, round: 0.3, o: 0 },
    { x: gridCells[i][0] * 80, y: gridCells[i][1] * 80, size: 68, round: 0.14, o: 1 },
    { x: Math.cos(ringA) * 150, y: Math.sin(ringA) * 150, size: 30, round: 1, o: 1 },
  ];
  const k = Math.min(3, Math.floor(s));
  const f = s - k;
  const a = states[k];
  const b = states[Math.min(4, k + 1)];
  return {
    x: lerp(a.x, b.x, f),
    y: lerp(a.y, b.y, f),
    size: lerp(a.size, b.size, f),
    round: lerp(a.round, b.round, f),
    o: lerp(a.o, b.o, f),
  };
}

function Engine({ s }: { s: number }) {
  const lineOpacity = clamp(s - 3);
  const spin = s > 0.5 && s < 2 ? (s - 0.5) * 50 : 0;
  return (
    <svg viewBox="-220 -220 440 440" className="h-full w-full overflow-visible" aria-hidden>
      <defs>
        <radialGradient id="xe-glow">
          <stop offset="0%" stopColor={BRASS} stopOpacity="0.35" />
          <stop offset="100%" stopColor={BRASS} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle r="200" fill="url(#xe-glow)" opacity={0.6} />
      {/* experiment orbit */}
      <circle r="118" fill="none" stroke={BRASS} strokeOpacity={0.4 * clamp(1 - Math.abs(s - 1) * 1.5)} strokeDasharray="2 8" />
      {/* ecosystem connections */}
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
        const b = ((i + 1) / 8) * Math.PI * 2 - Math.PI / 2;
        return (
          <g key={i} opacity={lineOpacity}>
            <line x1={0} y1={0} x2={Math.cos(a) * 150} y2={Math.sin(a) * 150} stroke="#f3f1eb" strokeOpacity={0.35} />
            <line x1={Math.cos(a) * 150} y1={Math.sin(a) * 150} x2={Math.cos(b) * 150} y2={Math.sin(b) * 150} stroke={BRASS} strokeOpacity={0.45} />
          </g>
        );
      })}
      {Array.from({ length: 8 }, (_, i) => {
        const st = satelliteState(i, s);
        if (st.size < 0.5) return null;
        return (
          <rect
            key={i}
            x={st.x - st.size / 2}
            y={st.y - st.size / 2}
            width={st.size}
            height={st.size}
            rx={(st.size / 2) * st.round}
            fill={s > 2.5 ? "#f3f1eb" : "none"}
            fillOpacity={s > 3.5 ? 0.95 : 0.08}
            stroke={BRASS}
            strokeOpacity={st.o}
            opacity={st.o}
            transform={`rotate(${spin} 0 0)`}
          />
        );
      })}
      <path
        d={pathFor(s)}
        fill={s < 0.5 ? "#ffffff" : s < 1.6 ? "none" : "#f3f1eb"}
        stroke={s < 1.6 ? BRASS : "none"}
        strokeWidth={1.2}
        transform={`rotate(${spin * 0.6})`}
      />
      {s < 0.6 && <circle r="22" fill="none" stroke="#fff" strokeOpacity={0.25 * (1 - s)} />}
    </svg>
  );
}

function useStage(p: MotionValue<number>) {
  const sv = useTransform(p, stageValue);
  return useMotionNumber(sv, 100);
}

function StageText({ s }: { s: number }) {
  const current = Math.round(s);
  return (
    <>
      <div className="relative h-[clamp(4rem,9vw,8.5rem)] overflow-hidden">
        {stages.map((st, i) => (
          <motion.p
            key={st.name}
            aria-hidden={i !== current}
            className="display-wide absolute inset-0 whitespace-nowrap text-[clamp(2.6rem,6.2vw,6.4rem)]"
            style={{ color: i === 4 ? "#f3f1eb" : undefined }}
            animate={{ y: i === current ? "0%" : i < current ? "-110%" : "110%", opacity: i === current ? 1 : 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            {st.name}
          </motion.p>
        ))}
      </div>
      <p className="editorial mt-4 min-h-[2.6em] max-w-sm text-[clamp(1.2rem,1.8vw,1.6rem)] italic text-mist" aria-live="polite">
        {stages[current].line}
      </p>
      <ol className="mt-10 grid grid-cols-5 gap-2" aria-label="Stages">
        {stages.map((st, i) => (
          <li key={st.name} className="flex flex-col gap-2">
            <span className="relative h-px w-full bg-white/15">
              <span
                className="absolute inset-y-0 left-0 bg-[var(--accent)] transition-[width] duration-300"
                style={{ width: `${clamp(s - i + 1) * 100}%` }}
              />
            </span>
            <span className={cn("label-sm transition-colors", i <= current ? "text-paper" : "text-ash")}>
              {String(i + 1).padStart(2, "0")} <span className="hidden sm:inline">{st.name}</span>
            </span>
          </li>
        ))}
      </ol>
    </>
  );
}

function EngineFigure({ s }: { s: number }) {
  return (
    <div className="pointer-events-none absolute right-[4%] top-1/2 hidden aspect-square w-[min(44vw,560px)] -translate-y-1/2 md:block">
      <Engine s={s} />
    </div>
  );
}

function MobileEngine({ s }: { s: number }) {
  return (
    <div className="mx-auto mt-6 aspect-square w-[72vw] max-w-[320px] md:hidden">
      <Engine s={s} />
    </div>
  );
}

export function XenovoEnterprises() {
  const ref = useRef<HTMLDivElement>(null);
  const p = useSectionProgress(ref);
  const s = useStage(p);
  return (
    <WorldShell world={world} className="bg-obsidian" coordinates={["Technology", "Venture & business layer", "The Enterprise Engine"]}>
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,rgba(196,168,119,0.08),transparent_60%)]" />
      <div ref={ref} className="relative h-[320vh]">
        <div className="gutter sticky top-0 flex h-[100svh] flex-col justify-center pt-[var(--hud-h)]">
          <div className="relative z-10 max-w-3xl">
            <p className="label-sm" style={{ color: BRASS }}>
              Xenovo Enterprises
            </p>
            <h2 id="xenovo-enterprises-title" className="display mt-3 text-[clamp(1.6rem,3vw,2.6rem)] text-paper">
              The Enterprise Engine
            </h2>
            <div className="mt-8">
              <StageText s={s} />
            </div>
          </div>
          <EngineFigure s={s} />
          <MobileEngine s={s} />
        </div>
      </div>
    </WorldShell>
  );
}

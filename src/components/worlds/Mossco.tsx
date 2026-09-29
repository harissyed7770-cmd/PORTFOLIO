"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { contours } from "d3-contour";
import { worldById } from "@/content/ecosystem";
import { Rise, useVisible } from "@/components/ui/primitives";
import { cn, makeNoise2D, mulberry32 } from "@/lib/utils";
import { WorldShell } from "./WorldShell";

const world = worldById["mossco-realty"];
const MOSS = "#5f6e45";
const INK = "#1d1f1a";
const SAND = "#d8cbb2";
const W = 1200;
const H = 750;

type Layer = "landscape" | "geography" | "parcels" | "development";
const layerList: { id: Layer; label: string }[] = [
  { id: "landscape", label: "Landscape" },
  { id: "geography", label: "Geography" },
  { id: "parcels", label: "Parcels" },
  { id: "development", label: "Development" },
];

function useTerrain() {
  return useMemo(() => {
    const noise = makeNoise2D(12);
    const nx = 120;
    const ny = 75;
    const values = new Array<number>(nx * ny);
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        const x = i / nx;
        const y = j / ny;
        let v = 0;
        let amp = 1;
        let f = 2.2;
        for (let o = 0; o < 4; o++) {
          v += noise(x * f + 3.1, y * f + 7.7) * amp;
          amp *= 0.5;
          f *= 2;
        }
        // a valley where the river runs
        v -= Math.exp(-Math.pow((y - 0.55 - Math.sin(x * 5) * 0.08) / 0.12, 2)) * 0.25;
        values[j * nx + i] = v;
      }
    }
    const gen = contours().size([nx, ny]).thresholds(18);
    const polys = gen(values);
    const sx = W / nx;
    const sy = H / ny;
    const paths = polys.map((mp, idx) => {
      let d = "";
      for (const poly of mp.coordinates) {
        for (const ring of poly) {
          ring.forEach(([x, y], k) => {
            d += `${k === 0 ? "M" : "L"}${(x * sx).toFixed(1)} ${(y * sy).toFixed(1)}`;
          });
          d += "Z";
        }
      }
      return { d, index: idx };
    });
    return paths;
  }, []);
}

function useParcels() {
  return useMemo(() => {
    const r = mulberry32(31);
    const cols = 5;
    const rows = 4;
    const x0 = 640;
    const y0 = 150;
    const cw = 92;
    const rh = 70;
    const pts: [number, number][][] = [];
    for (let j = 0; j <= rows; j++) {
      pts.push([]);
      for (let i = 0; i <= cols; i++) {
        pts[j].push([x0 + i * cw + j * 18 + (r() - 0.5) * 22, y0 + j * rh + (r() - 0.5) * 16]);
      }
    }
    const parcels: { id: string; d: string; c: [number, number]; dev: number }[] = [];
    let n = 1;
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        if ((i === 4 && j === 0) || (i === 0 && j === 3)) continue;
        const a = pts[j][i];
        const b = pts[j][i + 1];
        const c = pts[j + 1][i + 1];
        const d = pts[j + 1][i];
        const cx = (a[0] + b[0] + c[0] + d[0]) / 4;
        const cy = (a[1] + b[1] + c[1] + d[1]) / 4;
        parcels.push({
          id: `P-${String(n++).padStart(2, "0")}`,
          d: `M${a[0]} ${a[1]} L${b[0]} ${b[1]} L${c[0]} ${c[1]} L${d[0]} ${d[1]} Z`,
          c: [cx, cy],
          dev: [2, 6, 9, 13, 16].includes(n - 1) ? 20 + r() * 50 : 0,
        });
      }
    }
    return parcels;
  }, []);
}

/** An isometric block drawn in line — architectural massing, not a real building. */
function Massing({ x, y, h, active, delay }: { x: number; y: number; h: number; active: boolean; delay: number }) {
  const w = 22;
  const d = 13;
  const lines = [
    `M${x - w} ${y} L${x} ${y + d} L${x + w} ${y} L${x} ${y - d} Z`,
    `M${x - w} ${y} L${x - w} ${y - h} M${x} ${y + d} L${x} ${y + d - h} M${x + w} ${y} L${x + w} ${y - h}`,
    `M${x - w} ${y - h} L${x} ${y + d - h} L${x + w} ${y - h} L${x} ${y - d - h} Z`,
    ...Array.from({ length: Math.floor(h / 12) }, (_, k) => `M${x - w} ${y - 12 * (k + 1)} L${x} ${y + d - 12 * (k + 1)} L${x + w} ${y - 12 * (k + 1)}`),
  ];
  return (
    <g>
      <path d={`M${x - w} ${y - h} L${x} ${y + d - h} L${x + w} ${y - h} L${x} ${y - d - h} Z`} fill="#f3f1eb" opacity={active ? 0.9 : 0} />
      {lines.map((l, i) => (
        <motion.path
          key={i}
          d={l}
          fill="none"
          stroke={INK}
          strokeWidth={i < 3 ? 1.1 : 0.6}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: active ? 1 : 0 }}
          transition={{ duration: 0.9, delay: active ? delay + i * 0.05 : 0, ease: [0.65, 0, 0.35, 1] }}
        />
      ))}
    </g>
  );
}

function SurveyMap() {
  const terrain = useTerrain();
  const parcels = useParcels();
  const [on, setOn] = useState<Record<Layer, boolean>>({ landscape: true, geography: true, parcels: true, development: true });
  const [hover, setHover] = useState<string | null>(null);
  const [mapRef, visible] = useVisible<HTMLDivElement>("-15%");
  const hovered = parcels.find((p) => p.id === hover);
  const river = "M-10 430 C 160 380, 260 520, 420 470 S 700 360, 820 430 S 1060 560, 1210 500";

  return (
    <div ref={mapRef}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="Map layers" className="flex flex-wrap gap-1.5">
          {layerList.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setOn((s) => ({ ...s, [l.id]: !s[l.id] }))}
              aria-pressed={on[l.id]}
              className={cn(
                "label-sm flex items-center gap-2 rounded-full border px-3.5 py-2 transition-colors",
                on[l.id] ? "border-ink bg-ink text-bone" : "border-ink/25 text-ink/60 hover:border-ink/60",
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", on[l.id] ? "bg-bone" : "bg-ink/40")} />
              {l.label}
            </button>
          ))}
        </div>
        <span className="label-sm text-ink/55" aria-live="polite">
          {hovered ? `${hovered.id} · illustrative parcel — listings appear only when supplied` : "Survey sheet · illustrative · not to scale"}
        </span>
      </div>

      <div className="relative mt-4 overflow-hidden rounded-xl border border-ink/20 bg-[#ebe6da]">
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label="An illustrative survey map with terrain contours, a river, property parcels and building massing.">
          {/* landscape */}
          <g opacity={on.landscape ? 1 : 0} className="transition-opacity duration-700">
            {terrain.map((t) => (
              <path
                key={t.index}
                d={t.d}
                fill={t.index > 12 ? "rgba(95,110,69,0.06)" : "none"}
                stroke={MOSS}
                strokeOpacity={t.index % 4 === 0 ? 0.55 : 0.25}
                strokeWidth={t.index % 4 === 0 ? 1.1 : 0.6}
              />
            ))}
          </g>
          {/* geography */}
          <g opacity={on.geography ? 1 : 0} className="transition-opacity duration-700">
            {Array.from({ length: 13 }, (_, i) => (
              <line key={`v${i}`} x1={i * 100} y1={0} x2={i * 100} y2={H} stroke={INK} strokeOpacity={0.08} />
            ))}
            {Array.from({ length: 8 }, (_, i) => (
              <line key={`h${i}`} x1={0} y1={i * 100} x2={W} y2={i * 100} stroke={INK} strokeOpacity={0.08} />
            ))}
            {"ABCDEFGHIJKL".split("").map((c, i) => (
              <text key={c} x={i * 100 + 50} y={18} textAnchor="middle" fontSize="11" fill={INK} fillOpacity={0.5} fontFamily="var(--font-jetbrains)">
                {c}
              </text>
            ))}
            {Array.from({ length: 7 }, (_, i) => (
              <text key={i} x={10} y={i * 100 + 55} fontSize="11" fill={INK} fillOpacity={0.5} fontFamily="var(--font-jetbrains)">
                {i + 1}
              </text>
            ))}
            <path d={river} fill="none" stroke="#8fa5b5" strokeWidth={10} strokeOpacity={0.45} strokeLinecap="round" />
            <path d={river} fill="none" stroke="#6d8596" strokeWidth={1.2} strokeOpacity={0.8} />
            <g transform="translate(1120 90)">
              <circle r="30" fill="none" stroke={INK} strokeOpacity={0.3} />
              <path d="M0 -26 L6 0 L0 26 L-6 0 Z" fill={INK} fillOpacity={0.12} stroke={INK} strokeOpacity={0.5} />
              <path d="M0 -26 L6 0 L-6 0 Z" fill={INK} />
              <text y="-36" textAnchor="middle" fontSize="11" fill={INK} fontFamily="var(--font-jetbrains)">
                N
              </text>
            </g>
          </g>
          {/* parcels */}
          <g opacity={on.parcels ? 1 : 0} className="transition-opacity duration-700">
            {parcels.map((p) => (
              <g key={p.id} onMouseEnter={() => setHover(p.id)} onMouseLeave={() => setHover(null)} className="cursor-crosshair">
                <path
                  d={p.d}
                  fill={hover === p.id ? "#c8b893" : SAND}
                  fillOpacity={hover === p.id ? 0.95 : 0.55}
                  stroke={INK}
                  strokeOpacity={0.6}
                  strokeWidth={hover === p.id ? 1.6 : 0.8}
                />
                <text x={p.c[0]} y={p.c[1] + 4} textAnchor="middle" fontSize="10" fill={INK} fillOpacity={0.7} fontFamily="var(--font-jetbrains)">
                  {p.id}
                </text>
              </g>
            ))}
          </g>
          {/* development */}
          <g>
            {parcels
              .filter((p) => p.dev > 0)
              .map((p, i) => (
                <Massing key={p.id} x={p.c[0]} y={p.c[1] - 6} h={p.dev} active={on.development && visible} delay={i * 0.15} />
              ))}
          </g>
          {/* scale bar */}
          <g transform="translate(40 710)" fontFamily="var(--font-jetbrains)">
            <rect width="60" height="5" fill={INK} />
            <rect x="60" width="60" height="5" fill="none" stroke={INK} />
            <text y="-6" fontSize="10" fill={INK} fillOpacity={0.6}>
              ILLUSTRATIVE · NOT TO SCALE
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}

function Elevation() {
  const [ref, visible] = useVisible<HTMLDivElement>("-20%");
  const lines: string[] = [
    "M20 300 L380 300",
    "M60 300 L60 90 L300 90 L300 300",
    "M300 160 L360 160 L360 300",
    "M40 90 L320 90",
    "M90 60 L270 60 L270 90 M90 60 L90 90",
    ...[130, 170, 210, 250].map((y) => `M60 ${y} L300 ${y}`),
    ...[100, 140, 180, 220, 260].map((x) => `M${x} 90 L${x} 300`),
    "M150 300 L150 262 L210 262 L210 300",
  ];
  return (
    <div ref={ref} className="rounded-xl border border-ink/20 bg-[#f1ede3] p-5">
      <div className="label-sm flex justify-between text-ink/60">
        <span>Elevation · A–A</span>
        <span>Architectural study</span>
      </div>
      <svg viewBox="0 0 400 320" className="mt-3 h-auto w-full" aria-hidden>
        {lines.map((d, i) => (
          <motion.path
            key={i}
            d={d}
            fill="none"
            stroke={INK}
            strokeWidth={i < 5 ? 1.3 : 0.5}
            strokeOpacity={i < 5 ? 0.9 : 0.5}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: visible ? 1 : 0 }}
            transition={{ duration: 1.2, delay: i * 0.07, ease: [0.65, 0, 0.35, 1] }}
          />
        ))}
        <motion.path
          d="M20 300 C 80 290, 120 296, 160 300"
          fill="none"
          stroke={MOSS}
          strokeWidth={1}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: visible ? 1 : 0 }}
          transition={{ duration: 1.4, delay: 1.2 }}
        />
      </svg>
    </div>
  );
}

export function Mossco() {
  return (
    <WorldShell world={world} tone="light" className="bg-bone text-ink" coordinates={["Real estate", "The physical-world layer", "Survey"]}>
      <div className="gutter relative z-10 pt-14 md:pt-20">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <p className="label-sm" style={{ color: MOSS }}>
              MOSSCO Realty
            </p>
            <h2 id="mossco-realty-title" className="display-wide mt-3 text-[clamp(3rem,8.5vw,8.6rem)] text-ink">
              Mossco
              <span className="editorial block normal-case italic tracking-normal" style={{ color: MOSS }}>
                on solid ground.
              </span>
            </h2>
          </div>
          <Rise className="flex flex-col justify-end gap-4 lg:col-span-4">
            <p className="text-[1.02rem] leading-relaxed text-ink/75">
              Where the ecosystem meets the physical world. Architecture, landscape, property, geography, development and investment —
              drawn as a surveyor would draw them.
            </p>
            <ul className="flex flex-wrap gap-1.5">
              {world.vocabulary.map((v) => (
                <li key={v} className="label-sm rounded-full border border-ink/20 px-2.5 py-1 text-ink/70">
                  {v}
                </li>
              ))}
            </ul>
          </Rise>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-9">
            <SurveyMap />
          </div>
          <div className="flex flex-col gap-6 lg:col-span-3">
            <Elevation />
            <div className="rounded-xl border border-dashed border-ink/25 p-5">
              <p className="label-sm text-ink/60">Property records</p>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-ink/70">
                Parcels on this sheet are drawn to explain the world, not to list property. Real projects appear here only when supplied and
                verified.
              </p>
            </div>
          </div>
        </div>
      </div>
    </WorldShell>
  );
}

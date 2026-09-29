"use client";

import { useRef, useState } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { worldById } from "@/content/ecosystem";
import { RevealWords, useSectionProgress } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { WorldShell } from "./WorldShell";

const world = worldById["xenovo-tech"];

/** Bottom → top. Each layer is a concept from the brief, not a product claim. */
const layers = [
  { name: "Digital Infrastructure", line: "The ground floor everything else stands on." },
  { name: "Software", line: "Where ideas become working systems." },
  { name: "Automation", line: "Friction, removed from repeated work." },
  { name: "AI", line: "Intelligence that strengthens human judgment." },
  { name: "Products", line: "The surface people actually touch." },
  { name: "Experimentation", line: "The open top floor — always under construction." },
];

function Pattern({ index }: { index: number }) {
  const stroke = "rgba(157,178,198,0.55)";
  switch (index) {
    case 0:
      return (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(${stroke} 1px, transparent 1px), linear-gradient(90deg, ${stroke} 1px, transparent 1px)`,
            backgroundSize: "12.5% 12.5%",
            opacity: 0.55,
          }}
        />
      );
    case 1:
      return (
        <div className="absolute inset-[10%] flex flex-col justify-between">
          {[70, 45, 82, 30, 60, 52, 76, 38].map((w, i) => (
            <span key={i} className="block h-[3%] rounded-full bg-steel/60" style={{ width: `${w}%`, marginLeft: `${(i % 3) * 8}%` }} />
          ))}
        </div>
      );
    case 2:
      return (
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
          {[20, 40, 60, 80].map((y) => (
            <g key={y}>
              <line x1="10" y1={y} x2="84" y2={y} stroke={stroke} strokeWidth="0.8" />
              <path d={`M80 ${y - 3} L86 ${y} L80 ${y + 3}`} fill="none" stroke={stroke} strokeWidth="0.8" />
            </g>
          ))}
        </svg>
      );
    case 3:
      return (
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
          {[
            [20, 25, 50, 50], [80, 20, 50, 50], [15, 75, 50, 50], [85, 80, 50, 50], [50, 12, 50, 50], [50, 88, 50, 50],
            [20, 25, 50, 12], [80, 20, 50, 12], [15, 75, 50, 88], [85, 80, 50, 88],
          ].map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth="0.6" />
          ))}
          {[[50, 50], [20, 25], [80, 20], [15, 75], [85, 80], [50, 12], [50, 88]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i === 0 ? 4 : 2.2} fill={i === 0 ? "#f3f1eb" : "#9db2c6"} />
          ))}
        </svg>
      );
    case 4:
      return (
        <div className="absolute inset-[12%] grid grid-cols-3 gap-[6%]">
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i} className="rounded-[18%] border border-steel/50 bg-steel/10" />
          ))}
        </div>
      );
    default:
      return <div className="absolute inset-[8%] border border-dashed border-paper/50" />;
  }
}

function Pane({ index, gap, active }: { index: number; gap: MotionValue<number>; active: boolean }) {
  const z = useTransform(gap, (g) => index * g);
  const top = index === layers.length - 1;
  return (
    <motion.div
      className={cn(
        "absolute inset-0 overflow-hidden rounded-[6px] border transition-[background-color,border-color,box-shadow] duration-500",
        active ? "border-paper/80 bg-steel/25 shadow-[0_0_60px_rgba(157,178,198,0.35)]" : top ? "border-paper/40 bg-white/[0.03]" : "border-steel/35 bg-graphite-800/70",
      )}
      style={{ z, transformStyle: "preserve-3d" }}
    >
      <Pattern index={index} />
      <span className="label-sm absolute bottom-2 left-3 text-steel/90">{String(index + 1).padStart(2, "0")}</span>
    </motion.div>
  );
}

export function XenovoTech() {
  const ref = useRef<HTMLDivElement>(null);
  const p = useSectionProgress(ref);
  const gap = useTransform(p, [0.05, 0.55], [10, 58]);
  const rotate = useTransform(p, [0, 1], [-44, -30]);
  const [active, setActive] = useState<number | null>(null);

  return (
    <WorldShell world={world} className="bg-graphite-950" coordinates={["Technology", "The technology pillar", "HQ"]}>
      <div aria-hidden className="pointer-events-none absolute inset-0 grid-bg opacity-60" />
      <div aria-hidden className="pointer-events-none absolute inset-0 grid-fine opacity-60" />

      <div ref={ref} className="relative h-[210vh]">
        <div className="gutter sticky top-0 grid h-[100svh] items-center gap-10 pt-[var(--hud-h)] lg:grid-cols-12">
          <div className="relative z-10 lg:col-span-5">
            <p className="label-sm text-steel">Entering headquarters</p>
            <h2 id="xenovo-tech-title" className="display-wide mt-4 text-[clamp(3rem,7vw,7rem)] text-paper">
              <span className="block">Xenovo</span>
              <span className="block text-steel">Tech</span>
            </h2>
            <RevealWords
              as="p"
              text="The technology pillar of the ecosystem. Six floors, from the infrastructure underneath to the experiments on top."
              className="mt-6 max-w-md text-[1.05rem] leading-relaxed text-mist"
            />
            <ol className="mt-8 flex flex-col-reverse border-t border-white/10">
              {layers.map((l, i) => (
                <li key={l.name}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onMouseLeave={() => setActive(null)}
                    onFocus={() => setActive(i)}
                    onBlur={() => setActive(null)}
                    className={cn(
                      "group grid w-full grid-cols-[2.2rem_1fr] items-baseline gap-2 border-b border-white/10 py-2.5 text-left transition-colors",
                      active === i ? "text-paper" : "text-mist",
                    )}
                  >
                    <span className="label-sm tabular-nums text-steel">{String(i + 1).padStart(2, "0")}</span>
                    <span>
                      <span className="text-[0.98rem] font-medium">{l.name}</span>
                      <span
                        className={cn(
                          "block overflow-hidden text-[0.85rem] text-ash transition-all duration-500",
                          active === i ? "max-h-10 opacity-100" : "max-h-0 opacity-0",
                        )}
                      >
                        {l.line}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </div>

          <div className="relative hidden h-full items-center justify-center lg:col-span-7 lg:flex" aria-hidden>
            <div className="relative h-[min(34vw,420px)] w-[min(34vw,420px)]" style={{ perspective: "1800px" }}>
              <motion.div
                className="absolute inset-0"
                style={{ transformStyle: "preserve-3d", rotateX: 58, rotateZ: rotate, y: "12%" }}
              >
                {layers.map((l, i) => (
                  <Pane key={l.name} index={i} gap={gap} active={active === i} />
                ))}
              </motion.div>
            </div>
          </div>

          {/* Mobile: a flat elevation of the same six floors. */}
          <div className="flex flex-col-reverse gap-1.5 lg:hidden" aria-hidden>
            {layers.map((l, i) => (
              <div key={l.name} className="relative h-9 overflow-hidden rounded border border-steel/30 bg-graphite-800/70" style={{ marginLeft: `${i * 3}%`, marginRight: `${(5 - i) * 3}%` }}>
                <Pattern index={i} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="gutter relative z-10">
        <div className="overflow-hidden rounded-xl border border-white/10 bg-obsidian/80 font-mono text-[0.8rem] leading-7">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
            <span className="label-sm text-ash">xenovo-tech · product registry</span>
            <span className="flex gap-1.5" aria-hidden>
              <span className="h-2 w-2 rounded-full bg-white/15" />
              <span className="h-2 w-2 rounded-full bg-white/15" />
              <span className="h-2 w-2 rounded-full bg-white/15" />
            </span>
          </div>
          <div className="px-5 py-4 text-mist">
            <p>
              <span className="text-steel">~</span> registry list --verified
            </p>
            {world.records.length > 0 ? (
              world.records.map((r) => (
                <p key={r.title}>
                  <span className="text-ash">→</span> {r.title}
                  {r.detail ? <span className="text-ash"> — {r.detail}</span> : null}
                </p>
              ))
            ) : (
              <>
                <p>
                  <span className="text-ash">→</span> 0 verified projects published
                </p>
                <p className="text-ash">→ This registry only lists real, founder-supplied projects. Nothing is invented to fill it.</p>
              </>
            )}
            <p>
              <span className="text-steel">~</span> <span className="inline-block h-4 w-2 translate-y-0.5 animate-blink bg-paper" aria-hidden />
            </p>
          </div>
        </div>
      </div>
    </WorldShell>
  );
}

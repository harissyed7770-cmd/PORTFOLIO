"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { worldById } from "@/content/ecosystem";
import { useExperience } from "@/components/providers/Experience";
import { ExternalLink, RevealWords } from "@/components/ui/primitives";
import { cn, mulberry32 } from "@/lib/utils";
import { WorldShell } from "./WorldShell";

const world = worldById["samyam"];
const TEAL = world.accent;

/** Illustrative archetypes that explain the chamber. Not product features. */
const scenarios = [
  "A negotiation at an impasse",
  "A conversation that could break trust",
  "A crisis with minutes to decide",
  "A conflict between two teams",
  "Repairing a relationship",
  "A decision with no good options",
];

const phases = [
  { name: "Sense", line: "Read the situation — who is involved, what is at stake, what is left unsaid." },
  { name: "Rehearse", line: "Practise the possible paths before walking the real one." },
  { name: "Resolve", line: "Move toward reconciliation, resolution and restoration." },
];

const PHASE_MS = 2600;

function Chamber({ scenario, phase, reduced }: { scenario: number | null; phase: number; reduced: boolean }) {
  const angle = scenario === null ? -Math.PI / 2 : (scenario / scenarios.length) * Math.PI * 2 - Math.PI / 2;
  const blips = useMemo(() => {
    const r = mulberry32(scenario ?? 1);
    return Array.from({ length: 14 }, () => {
      const a = r() * Math.PI * 2;
      const d = 40 + r() * 120;
      return { x: Math.cos(a) * d, y: Math.sin(a) * d, delay: r() * 1.6 };
    });
  }, [scenario]);
  const paths = useMemo(() => {
    const r = mulberry32((scenario ?? 0) + 99);
    return Array.from({ length: 7 }, (_, i) => {
      const spread = (i - 3) * 0.32 + (r() - 0.5) * 0.1;
      const a = angle + spread;
      const end = { x: Math.cos(a) * (120 + r() * 50), y: Math.sin(a) * (120 + r() * 50) };
      const c1 = { x: Math.cos(angle + spread * 0.3) * 60 + (r() - 0.5) * 40, y: Math.sin(angle + spread * 0.3) * 60 + (r() - 0.5) * 40 };
      return { d: `M0 0 Q${c1.x.toFixed(1)} ${c1.y.toFixed(1)} ${end.x.toFixed(1)} ${end.y.toFixed(1)}`, chosen: i === 3, end };
    });
  }, [scenario, angle]);

  const running = scenario !== null;

  return (
    <svg viewBox="-200 -200 400 400" className="h-full w-full overflow-visible" aria-hidden>
      <defs>
        <radialGradient id="sm-core">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="40%" stopColor={TEAL} stopOpacity="0.35" />
          <stop offset="100%" stopColor={TEAL} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sm-sweep" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={TEAL} stopOpacity="0" />
          <stop offset="100%" stopColor={TEAL} stopOpacity="0.35" />
        </linearGradient>
      </defs>

      {[60, 100, 150, 190].map((r, i) => (
        <circle key={r} r={r} fill="none" stroke="#dfe1e5" strokeOpacity={i === 2 ? 0.22 : 0.08} strokeDasharray={i === 3 ? "1 6" : undefined} />
      ))}
      {Array.from({ length: 36 }, (_, i) => {
        const a = (i / 36) * Math.PI * 2;
        return (
          <line key={i} x1={Math.cos(a) * 186} y1={Math.sin(a) * 186} x2={Math.cos(a) * 192} y2={Math.sin(a) * 192} stroke="#dfe1e5" strokeOpacity={0.25} />
        );
      })}

      {/* SENSE — the sweep reads the room */}
      {running && phase === 0 && (
        <>
          <motion.g
            initial={{ rotate: 0 }}
            animate={{ rotate: reduced ? 0 : 360 }}
            transition={{ duration: 2.4, ease: "linear", repeat: Infinity }}
          >
            <circle r={190} fill="none" />
            <path d="M0 0 L190 0 A190 190 0 0 0 164.5 -95 Z" fill="url(#sm-sweep)" />
          </motion.g>
          {blips.map((b, i) => (
            <motion.circle
              key={i}
              cx={b.x}
              cy={b.y}
              r={2.4}
              fill="#f3f1eb"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0.6], scale: 1 }}
              transition={{ duration: 0.6, delay: reduced ? 0 : b.delay }}
            />
          ))}
        </>
      )}

      {/* REHEARSE — possible paths, tried in parallel */}
      {running && phase >= 1 &&
        paths.map((p, i) => (
          <motion.path
            key={`${scenario}-${i}`}
            d={p.d}
            fill="none"
            stroke={p.chosen && phase === 2 ? "#ffffff" : TEAL}
            strokeWidth={p.chosen && phase === 2 ? 2 : 1}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: 1,
              opacity: phase === 2 ? (p.chosen ? 1 : 0.06) : [0.2, 0.8, 0.35],
            }}
            transition={{
              pathLength: { duration: reduced ? 0 : 1.1, delay: reduced ? 0 : i * 0.12, ease: [0.65, 0, 0.35, 1] },
              opacity: { duration: phase === 2 ? 0.9 : 1.4, repeat: phase === 1 && !reduced ? Infinity : 0, repeatType: "mirror" },
            }}
          />
        ))}

      {/* RESOLVE — one path holds, the chamber settles */}
      {running && phase === 2 && (
        <>
          {[0, 1, 2].map((i) => (
            <motion.circle
              key={i}
              r={24}
              fill="none"
              stroke="#f3f1eb"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: reduced ? 1 : 7, opacity: 0 }}
              transition={{ duration: 3.6, delay: i * 1.2, repeat: Infinity, ease: "easeOut" }}
            />
          ))}
          <motion.circle cx={paths[3].end.x} cy={paths[3].end.y} r={5} fill="#ffffff" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
        </>
      )}

      <circle r={46} fill="url(#sm-core)" />
      <circle r={9} fill="#ffffff" />
    </svg>
  );
}

export function Samyam() {
  const { reducedMotion } = useExperience();
  const [scenario, setScenario] = useState<number | null>(null);
  const [phase, setPhase] = useState(0);
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (scenario === null) return;
    const t1 = setTimeout(() => setPhase(1), PHASE_MS);
    const t2 = setTimeout(() => setPhase(2), PHASE_MS * 2);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [scenario, run]);

  const choose = (i: number) => {
    setPhase(0);
    setScenario(i);
    setRun((r) => r + 1);
  };

  return (
    <WorldShell world={world} className="overflow-hidden bg-[#050607]" coordinates={["Technology · AI", "The AI simulation lab", "Chamber"]}>
      {/* Chamber floor */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%] overflow-hidden [perspective:900px]">
        <div
          className="absolute inset-x-[-50%] bottom-[-30%] h-[140%] origin-bottom grid-bg opacity-50 [transform:rotateX(72deg)] [mask-image:linear-gradient(to_top,black,transparent_75%)]"
          style={{ backgroundSize: "80px 80px" }}
        />
      </div>
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-[45%] h-[70vh] w-[70vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(156,195,189,0.12),transparent_65%)]" />

      <div className="gutter relative z-10 grid gap-12 pb-10 pt-12 lg:grid-cols-12 lg:gap-6 lg:pt-20">
        <div className="lg:col-span-5">
          <p className="label-sm" style={{ color: TEAL }}>
            samyam.app · AI-native simulation system
          </p>
          <h2 id="samyam-title" className="mt-4 text-paper">
            <span className="display block text-[clamp(3.4rem,8vw,7.8rem)]">Samyam</span>
            <span className="editorial mt-2 block text-[clamp(1.5rem,2.6vw,2.4rem)] italic text-mist">The simulation chamber.</span>
          </h2>
          <RevealWords
            as="p"
            text="Scenario labs for high-stakes situations — built around reconciliation, resolution and restoration."
            className="mt-6 max-w-md text-[1.05rem] leading-relaxed text-mist"
          />

          <div className="mt-10 flex gap-8">
            {phases.map((ph, i) => (
              <div key={ph.name} className="flex flex-col gap-2">
                <span className={cn("label-sm tabular-nums", scenario !== null && phase === i ? "text-paper" : "text-ash")}>0{i + 1}</span>
                <span
                  className={cn(
                    "display text-[clamp(1.4rem,2.4vw,2.2rem)] transition-colors duration-700",
                    scenario !== null && phase === i ? "text-paper" : scenario !== null && phase > i ? "text-mist" : "text-white/20",
                  )}
                  style={scenario !== null && phase === i ? { color: TEAL } : undefined}
                >
                  {ph.name}
                </span>
              </div>
            ))}
          </div>

          {/* Readout */}
          <div className="mt-8 min-h-[7.5rem] rounded-xl border border-white/10 bg-black/40 p-5 font-mono text-[0.78rem] leading-6 text-mist" aria-live="polite">
            {scenario === null ? (
              <p className="text-ash">
                <span style={{ color: TEAL }}>chamber</span> · idle — choose a scenario node to begin a rehearsal.
              </p>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div key={`${scenario}-${phase}`} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                  <p>
                    <span className="text-ash">scenario</span> {scenarios[scenario].toLowerCase()}
                  </p>
                  <p>
                    <span className="text-ash">phase</span> 0{phase + 1}/03 <span style={{ color: TEAL }}>{phases[phase].name.toUpperCase()}</span>
                  </p>
                  <p className="text-paper">{phases[phase].line}</p>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
          {world.url && (
            <div className="mt-8">
              <ExternalLink href={world.url} className="text-paper">
                Enter samyam.app
              </ExternalLink>
            </div>
          )}
        </div>

        <div className="relative lg:col-span-7">
          <div className="relative mx-auto aspect-square w-full max-w-[640px]">
            <Chamber scenario={scenario} phase={phase} reduced={reducedMotion} />
            {/* Scenario nodes around the chamber */}
            <ul className="absolute inset-0 hidden sm:block" aria-label="Scenario nodes">
              {scenarios.map((s, i) => {
                const a = (i / scenarios.length) * Math.PI * 2 - Math.PI / 2;
                const x = 50 + Math.cos(a) * 37.5;
                const y = 50 + Math.sin(a) * 37.5;
                const on = scenario === i;
                return (
                  <li key={s} className="absolute" style={{ left: `${x}%`, top: `${y}%` }}>
                    <button
                      type="button"
                      onClick={() => choose(i)}
                      aria-pressed={on}
                      className="group relative -translate-x-1/2 -translate-y-1/2"
                    >
                      <span
                        className={cn(
                          "block h-4 w-4 rounded-full border transition-all duration-500",
                          on ? "scale-125 border-white bg-white" : "border-white/50 bg-black group-hover:border-white",
                        )}
                        style={on ? { boxShadow: `0 0 0 8px ${TEAL}33, 0 0 30px ${TEAL}` } : undefined}
                      />
                      <span
                        className={cn(
                          "label-sm absolute left-1/2 top-6 w-40 -translate-x-1/2 text-center leading-snug transition-colors",
                          on ? "text-paper" : "text-ash group-hover:text-mist",
                        )}
                      >
                        {s}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          <ul className="mt-6 grid grid-cols-1 gap-2 sm:hidden" aria-label="Scenario nodes">
            {scenarios.map((s, i) => (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => choose(i)}
                  aria-pressed={scenario === i}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-[0.9rem] transition-colors",
                    scenario === i ? "border-white/40 bg-white/10 text-paper" : "border-white/10 text-mist",
                  )}
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: scenario === i ? TEAL : "rgba(255,255,255,0.3)" }} />
                  {s}
                </button>
              </li>
            ))}
          </ul>
          <p className="label-sm mt-6 text-center text-ash">
            Scenario nodes are illustrative archetypes that explain the chamber — not a list of Samyam features.
          </p>
        </div>
      </div>
    </WorldShell>
  );
}

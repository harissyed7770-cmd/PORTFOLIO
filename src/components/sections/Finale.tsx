"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useTransform, type MotionValue } from "framer-motion";
import { ArrowUpRight, RotateCcw } from "lucide-react";
import { person, worlds } from "@/content/ecosystem";
import { useExperience } from "@/components/providers/Experience";
import { Magnetic } from "@/components/ui/Magnetic";
import { useSectionProgress, useRange } from "@/components/ui/primitives";
import { easeOutCubic } from "@/lib/utils";

const statements = ["One person.", "Multiple worlds.", "One ecosystem."];

function Statement({ text, i, p }: { text: string; i: number; p: MotionValue<number> }) {
  const start = i * 0.2;
  const opacity = useRange(p, [start, start + 0.06, 0.66, 0.72], [0, 1, 1, 0]);
  const y = useRange(p, [start, start + 0.08], [40, 0], easeOutCubic);
  return (
    <motion.span style={{ opacity, y }} className="block">
      {text}
    </motion.span>
  );
}

function WorldDot({ i, p }: { i: number; p: MotionValue<number> }) {
  const a = (i / worlds.length) * Math.PI * 2 - Math.PI / 2;
  const R = 36;
  // appear with "Multiple worlds", hold through "One ecosystem", converge for the name
  const r = useRange(p, [0.2, 0.3, 0.66, 0.78], [0, R, R, 0], easeOutCubic);
  const cx = useTransform(r, (v) => `${50 + Math.cos(a) * v}%`);
  const cy = useTransform(r, (v) => `${50 + Math.sin(a) * v}%`);
  const opacity = useRange(p, [0.2, 0.26, 0.74, 0.8], [0, 1, 1, 0]);
  return <motion.circle cx={cx} cy={cy} r={6} fill={worlds[i].accent} style={{ opacity }} />;
}

function Converge({ p }: { p: MotionValue<number> }) {
  const linkOpacity = useRange(p, [0.42, 0.5, 0.66, 0.72], [0, 0.5, 0.5, 0]);
  const rotate = useRange(p, [0.4, 0.7], [0, 30]);
  const coreScale = useRange(p, [0, 0.08, 0.66, 0.8], [0, 1, 1, 3]);
  const coreOpacity = useRange(p, [0.74, 0.84], [1, 0]);
  return (
    <motion.svg aria-hidden className="absolute inset-0 h-full w-full" style={{ rotate }}>
      {worlds.map((w, i) => {
        const a = (i / worlds.length) * Math.PI * 2 - Math.PI / 2;
        const b = ((i + 3) / worlds.length) * Math.PI * 2 - Math.PI / 2;
        return (
          <motion.g key={w.id} style={{ opacity: linkOpacity }}>
            <line x1="50%" y1="50%" x2={`${50 + Math.cos(a) * 36}%`} y2={`${50 + Math.sin(a) * 36}%`} stroke="#f3f1eb" strokeOpacity={0.4} />
            <line
              x1={`${50 + Math.cos(a) * 36}%`}
              y1={`${50 + Math.sin(a) * 36}%`}
              x2={`${50 + Math.cos(b) * 36}%`}
              y2={`${50 + Math.sin(b) * 36}%`}
              stroke={w.accent}
              strokeOpacity={0.35}
            />
          </motion.g>
        );
      })}
      {worlds.map((w, i) => (
        <WorldDot key={w.id} i={i} p={p} />
      ))}
      <motion.circle cx="50%" cy="50%" r={9} fill="#f3f1eb" style={{ scale: coreScale, opacity: coreOpacity }} className="[transform-box:fill-box] origin-center" />
    </motion.svg>
  );
}

/** The visitor's own points — kept only in this browser. */
const ideaStore = (() => {
  const KEY = "ha:ideas";
  const EMPTY: string[] = [];
  let memory: string[] = EMPTY;
  let cachedRaw: string | null = null;
  let cached: string[] = EMPTY;
  const listeners = new Set<() => void>();
  const read = (): string[] => {
    let raw: string | null = null;
    try {
      raw = localStorage.getItem(KEY);
    } catch {
      return memory;
    }
    if (raw === cachedRaw) return cached;
    cachedRaw = raw;
    try {
      cached = raw ? (JSON.parse(raw) as string[]) : EMPTY;
    } catch {
      cached = EMPTY;
    }
    return cached;
  };
  return {
    subscribe(fn: () => void) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    get: read,
    server: () => EMPTY,
    add(idea: string) {
      const next = [...read(), idea].slice(-8);
      memory = next;
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable — keep it in memory for this visit */
      }
      listeners.forEach((l) => l());
    },
  };
})();

function IdeaConstellation() {
  const ideas = useSyncExternalStore(ideaStore.subscribe, ideaStore.get, ideaStore.server);
  const [value, setValue] = useState("");
  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const v = value.trim();
    if (!v) return;
    ideaStore.add(v);
    setValue("");
  };
  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
      <form onSubmit={add} className="flex flex-col gap-3">
        <label htmlFor="idea" className="label-sm text-ash">
          Leave an idea in the universe
        </label>
        <div className="flex gap-2 rounded-full border border-white/15 bg-white/[0.03] p-1.5 focus-within:border-white/40">
          <input
            id="idea"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            maxLength={80}
            placeholder="An idea that doesn't exist yet…"
            className="min-w-0 flex-1 bg-transparent px-4 text-[1rem] text-paper placeholder:text-ash focus:outline-none"
          />
          <button type="submit" className="label-sm shrink-0 rounded-full bg-paper px-4 py-2.5 text-ink transition-opacity hover:opacity-85">
            Add a point
          </button>
        </div>
        <p className="label-sm text-ash">It stays in your browser. Nothing is sent anywhere.</p>
      </form>
      <div className="relative h-56" aria-live="polite">
        <svg aria-hidden className="absolute inset-0 h-full w-full" viewBox="-200 -100 400 200">
          <circle r={4} fill="#f3f1eb" />
          {ideas.map((_, i) => {
            const a = (i / Math.max(1, ideas.length)) * Math.PI * 2;
            return <line key={i} x1={0} y1={0} x2={Math.cos(a) * 150} y2={Math.sin(a) * 70} stroke="#f3f1eb" strokeOpacity={0.15} />;
          })}
        </svg>
        <AnimatePresence>
          {ideas.map((idea, i) => {
            const a = (i / Math.max(1, ideas.length)) * Math.PI * 2;
            return (
              <motion.span
                key={`${idea}-${i}`}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1, left: `${50 + Math.cos(a) * 37.5}%`, top: `${50 + Math.sin(a) * 35}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="absolute flex max-w-[12rem] -translate-x-1/2 -translate-y-1/2 items-center gap-2 text-[0.8rem] text-platinum"
              >
                <span className="h-2 w-2 shrink-0 rounded-full bg-brass shadow-[0_0_14px_rgba(191,167,124,0.8)]" />
                <span className="truncate">{idea}</span>
              </motion.span>
            );
          })}
        </AnimatePresence>
        {ideas.length === 0 && <p className="label-sm absolute bottom-0 left-1/2 -translate-x-1/2 text-ash">Your points will appear here</p>}
      </div>
    </div>
  );
}

export function Finale() {
  const { replay } = useExperience();
  const ref = useRef<HTMLDivElement>(null);
  const p = useSectionProgress(ref);
  const nameOpacity = useRange(p, [0.76, 0.86], [0, 1]);
  const nameScale = useRange(p, [0.76, 0.95], [0.9, 1]);

  return (
    <section id="next" data-hud aria-labelledby="next-title" className="relative bg-obsidian">
      <div ref={ref} className="relative h-[380vh]">
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          <Converge p={p} />
          <p className="gutter display pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center text-[clamp(2.4rem,7.5vw,7.5rem)] text-paper [text-shadow:0_0_30px_rgba(0,0,0,0.9)]">
            {statements.map((s, i) => (
              <Statement key={s} text={s} i={i} p={p} />
            ))}
          </p>
          <motion.div
            style={{ opacity: nameOpacity, scale: nameScale }}
            className="gutter pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center"
          >
            <p className="display text-[min(15vw,22vh)] text-paper">{person.name}</p>
            <p className="editorial mt-4 text-[clamp(1.4rem,2.8vw,2.6rem)] italic text-platinum">{person.closing}</p>
          </motion.div>
        </div>
      </div>

      <div className="gutter relative pb-16 pt-24 md:pt-36">
        <div className="mx-auto max-w-6xl">
          <p className="label-sm text-ash">20 / The open question</p>
          <h2 id="next-title" className="display mt-6 text-[clamp(3rem,9.5vw,9.5rem)] text-paper">
            What are we building next?
          </h2>
          <div className="mt-14 border-t border-white/10 pt-10">
            <IdeaConstellation />
          </div>
          <div className="mt-14 flex flex-wrap items-center gap-3">
            {person.links.linkedin && (
              <Magnetic
                as="a"
                href={person.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="group gap-3 rounded-full bg-paper px-6 py-4 text-ink"
              >
                <span className="label">Continue on LinkedIn</span>
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
              </Magnetic>
            )}
            {worlds
              .filter((w) => w.url)
              .map((w) => (
                <Magnetic
                  key={w.id}
                  as="a"
                  href={w.url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group gap-3 rounded-full border border-white/20 px-6 py-4 text-paper transition-colors hover:border-white/50"
                >
                  <span className="label">Visit {w.url!.replace(/^https?:\/\//, "")}</span>
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </Magnetic>
              ))}
            <Magnetic onClick={replay} className="group gap-3 rounded-full border border-white/20 px-6 py-4 text-paper transition-colors hover:border-white/50">
              <RotateCcw className="h-4 w-4 transition-transform duration-700 group-hover:-rotate-180" aria-hidden />
              <span className="label">Replay the genesis</span>
            </Magnetic>
          </div>
        </div>
      </div>
    </section>
  );
}

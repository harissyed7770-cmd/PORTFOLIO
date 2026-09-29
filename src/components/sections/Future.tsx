"use client";

import { useRef } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { worlds } from "@/content/ecosystem";
import { Coordinates, useSectionProgress } from "@/components/ui/primitives";

const nexts = ["The next company.", "The next product.", "The next idea.", "The next community.", "The next system."];

function NextLine({ text, i, p }: { text: string; i: number; p: MotionValue<number> }) {
  const start = 0.14 + i * 0.1;
  const opacity = useTransform(p, [start, start + 0.06, 0.72, 0.8], [0, 1, 1, 0.25]);
  const x = useTransform(p, [start, start + 0.08], [-30, 0]);
  return (
    <motion.li style={{ opacity, x }} className="display text-[clamp(1.8rem,4.6vw,4.4rem)] text-paper">
      {text}
    </motion.li>
  );
}

function Ghost({ i, p }: { i: number; p: MotionValue<number> }) {
  const start = 0.14 + i * 0.1;
  const a = (i / nexts.length) * Math.PI * 2 + 0.6;
  const r = 250;
  const opacity = useTransform(p, [start, start + 0.08], [0, 1]);
  const scale = useTransform(p, [start, start + 0.1], [0.3, 1]);
  return (
    <motion.g style={{ opacity, scale }} className="[transform-box:fill-box] origin-center">
      <circle cx={Math.cos(a) * r} cy={Math.sin(a) * r} r={26} fill="none" stroke="#f3f1eb" strokeOpacity={0.55} strokeDasharray="3 5" />
      <text x={Math.cos(a) * r} y={Math.sin(a) * r + 4} textAnchor="middle" fontSize="12" fontFamily="var(--font-jetbrains)" fill="rgba(243,241,235,0.6)">
        ?
      </text>
      <line x1={0} y1={0} x2={Math.cos(a) * (r - 28)} y2={Math.sin(a) * (r - 28)} stroke="#f3f1eb" strokeOpacity={0.12} strokeDasharray="2 6" />
    </motion.g>
  );
}

export function Future() {
  const ref = useRef<HTMLElement>(null);
  const p = useSectionProgress(ref);
  const titleOpacity = useTransform(p, [0, 0.06, 0.72, 0.8], [0, 1, 1, 0.2]);
  const finalOpacity = useTransform(p, [0.78, 0.88], [0, 1]);
  const finalY = useTransform(p, [0.78, 0.9], [30, 0]);
  const orbit = useTransform(p, [0, 1], [0, 40]);

  return (
    <section ref={ref} id="future" data-hud aria-labelledby="future-title" className="relative h-[360vh] bg-obsidian">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <motion.svg
          aria-hidden
          viewBox="-400 -400 800 800"
          className="absolute right-[-18%] top-1/2 h-[120vh] w-[120vh] -translate-y-1/2 opacity-80 md:right-[-8%]"
          style={{ rotate: orbit }}
        >
          <circle r={250} fill="none" stroke="rgba(255,255,255,0.08)" />
          <circle r={140} fill="none" stroke="rgba(255,255,255,0.06)" />
          {worlds.map((w, i) => {
            const a = (i / worlds.length) * Math.PI * 2;
            return <circle key={w.id} cx={Math.cos(a) * 140} cy={Math.sin(a) * 140} r={5} fill={w.accent} opacity={0.7} />;
          })}
          <circle r={9} fill="#f3f1eb" />
          {nexts.map((n, i) => (
            <Ghost key={n} i={i} p={p} />
          ))}
        </motion.svg>

        <div className="gutter relative flex h-full flex-col justify-center pt-[var(--hud-h)]">
          <motion.div style={{ opacity: titleOpacity }}>
            <Coordinates code="19 / Future" items={["Possibility"]} className="max-w-md" />
            <h2 id="future-title" className="editorial mt-8 max-w-4xl text-[clamp(3rem,8vw,8rem)] italic leading-[0.9] text-paper">
              What doesn&apos;t exist yet?
            </h2>
          </motion.div>
          <ul className="mt-10 flex flex-col gap-1">
            {nexts.map((n, i) => (
              <NextLine key={n} text={n} i={i} p={p} />
            ))}
          </ul>
          <motion.p
            style={{ opacity: finalOpacity, y: finalY }}
            className="display absolute inset-x-[var(--gutter)] bottom-[14%] text-[clamp(1.6rem,4vw,3.6rem)] text-paper"
          >
            The story is still being built.
            <span aria-hidden className="ml-2 inline-block h-[0.8em] w-[0.35em] translate-y-[0.08em] animate-blink bg-paper" />
          </motion.p>
        </div>
      </div>
    </section>
  );
}

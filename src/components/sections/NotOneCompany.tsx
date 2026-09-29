"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { thematicLinks, worlds, type World } from "@/content/ecosystem";
import { useSectionProgress, useRange } from "@/components/ui/primitives";
import { easeOutCubic, mulberry32 } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/useClient";

function useBurstLayout() {
  const portrait = useMediaQuery("(max-aspect-ratio: 9/10)");
  return useMemo(() => {
    const rand = mulberry32(42);
    return worlds.map((w, i) => {
      const a = (i / worlds.length) * Math.PI * 2 - Math.PI / 2 + 0.2;
      const rx = portrait ? 36 : 41;
      const ry = portrait ? 38 : 35;
      const j = 0.82 + rand() * 0.3;
      return { world: w, x: 50 + Math.cos(a) * rx * j, y: 50 + Math.sin(a) * ry * j };
    });
  }, [portrait]);
}

function BurstNode({
  world,
  x,
  y,
  index,
  progress,
}: {
  world: World;
  x: number;
  y: number;
  index: number;
  progress: MotionValue<number>;
}) {
  const start = 0.5 + index * 0.014;
  const end = start + 0.16;
  const left = useTransform(progress, [start, end], ["50%", `${x}%`], { ease: easeOutCubic });
  const top = useTransform(progress, [start, end], ["50%", `${y}%`], { ease: easeOutCubic });
  const scale = useRange(progress, [start - 0.02, start + 0.04, end], [0, 1.3, 1]);
  const labelOpacity = useRange(progress, [end - 0.04, end + 0.04], [0, 1]);
  return (
    <motion.div className="absolute" style={{ left, top }}>
      <motion.div style={{ scale }} className="-translate-x-1/2 -translate-y-1/2">
        <span
          className="block h-3.5 w-3.5 rounded-full md:h-4 md:w-4"
          style={{
            background: world.accent,
            boxShadow: `0 0 0 6px ${world.accent}1f, 0 0 40px 6px ${world.accent}55`,
          }}
        />
      </motion.div>
      <motion.span
        style={{ opacity: labelOpacity }}
        className="label-sm absolute left-1/2 top-4 -translate-x-1/2 whitespace-nowrap text-platinum md:top-5"
      >
        {world.name}
      </motion.span>
    </motion.div>
  );
}

function BurstLine({
  x1,
  y1,
  x2,
  y2,
  progress,
  from,
  to,
  opacity = 0.35,
  dashed = false,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  dashed?: boolean;
  progress: MotionValue<number>;
  from: number;
  to: number;
  opacity?: number;
}) {
  const t = useRange(progress, [from, to], [0, 1], easeOutCubic);
  const ex = useTransform(t, (v) => x1 + (x2 - x1) * v);
  const ey = useTransform(t, (v) => y1 + (y2 - y1) * v);
  const o = useRange(progress, [from, from + 0.02], [0, opacity]);
  return (
    <motion.line
      x1={x1}
      y1={y1}
      x2={ex}
      y2={ey}
      stroke="#dfe1e5"
      strokeWidth={1}
      strokeDasharray={dashed ? "3 5" : undefined}
      style={{ opacity: o }}
    />
  );
}

export function NotOneCompany() {
  const ref = useRef<HTMLElement>(null);
  const p = useSectionProgress(ref);
  const layout = useBurstLayout();
  const stageRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 1440, h: 900 });
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const sx = size.w / 100;
  const sy = size.h / 100;
  const links = useMemo(() => thematicLinks(), []);
  const pos = useMemo(() => Object.fromEntries(layout.map((l) => [l.world.id, l])), [layout]);

  // Act I — "I didn't build one company."
  const actOneY = useTransform(p, [0, 0.1, 0.36, 0.46], ["8%", "0%", "0%", "-30%"]);
  const actOneOpacity = useRange(p, [0, 0.06, 0.38, 0.46], [0.55, 1, 1, 0]);
  const strike = useRange(p, [0.24, 0.34], [0, 1]);
  const dotScale = useRange(p, [0.1, 0.18, 0.46, 0.5], [0, 1, 1, 1.8]);
  const dotOpacity = useRange(p, [0.1, 0.18, 0.5, 0.53], [0, 1, 1, 0]);

  // Act II — "I built an ecosystem."
  const actTwoY = useTransform(p, [0.42, 0.54], ["30%", "0%"], { ease: easeOutCubic });
  const actTwoOpacity = useRange(p, [0.42, 0.52, 0.66, 0.78], [0, 1, 1, 0.14]);
  const actTwoScale = useRange(p, [0.52, 0.8], [1, 0.82]);

  const caption = useRange(p, [0.78, 0.86], [0, 1]);

  return (
    <section ref={ref} id="not-one-company" data-hud aria-label="I didn't build one company. I built an ecosystem." className="relative h-[420vh]">
      <div ref={stageRef} className="sticky top-0 h-[100svh] overflow-hidden bg-obsidian">
        <div aria-hidden className="absolute inset-0 grid-bg opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />

        {/* Connections */}
        <svg aria-hidden className="absolute inset-0 h-full w-full" viewBox={`0 0 ${size.w} ${size.h}`}>
          {layout.map((l, i) => (
            <BurstLine key={l.world.id} x1={50 * sx} y1={50 * sy} x2={l.x * sx} y2={l.y * sy} progress={p} from={0.56 + i * 0.012} to={0.7 + i * 0.012} opacity={0.3} />
          ))}
          {links.map((lk, i) => {
            const a = pos[lk.a];
            const b = pos[lk.b];
            if (!a || !b) return null;
            return <BurstLine key={`${lk.a}-${lk.b}`} x1={a.x * sx} y1={a.y * sy} x2={b.x * sx} y2={b.y * sy} progress={p} from={0.7 + (i % 12) * 0.008} to={0.82 + (i % 12) * 0.008} opacity={0.16} dashed />;
          })}
        </svg>

        {/* The single company — the dot that becomes many. */}
        <motion.span
          aria-hidden
          style={{ scale: dotScale, opacity: dotOpacity }}
          className="absolute left-1/2 top-1/2 -ml-2 -mt-2 h-4 w-4 rounded-full bg-paper shadow-[0_0_40px_10px_rgba(255,255,255,0.25)]"
        />

        {/* Worlds */}
        <div aria-hidden className="absolute inset-0">
          {layout.map((l, i) => (
            <BurstNode key={l.world.id} world={l.world} x={l.x} y={l.y} index={i} progress={p} />
          ))}
        </div>

        {/* Act I */}
        <motion.div
          style={{ y: actOneY, opacity: actOneOpacity }}
          className="gutter absolute inset-0 flex flex-col items-center justify-center text-center"
        >
          <h2 className="display text-[clamp(3rem,11.5vw,12.5rem)] text-paper">
            <span className="block">I didn&apos;t build</span>
            <span className="relative inline-block">
              one company.
              <motion.span
                aria-hidden
                style={{ scaleX: strike }}
                className="absolute left-[-2%] top-[52%] h-[0.06em] w-[104%] origin-left bg-paper"
              />
            </span>
          </h2>
        </motion.div>

        {/* Act II */}
        <motion.div
          style={{ y: actTwoY, opacity: actTwoOpacity, scale: actTwoScale }}
          className="gutter absolute inset-0 flex flex-col items-center justify-center text-center"
        >
          <p className="display text-[clamp(2.2rem,7vw,7.5rem)] text-paper">I built an</p>
          <p className="editorial -mt-[0.1em] text-[clamp(4.2rem,17vw,18rem)] italic leading-[0.85] text-paper">ecosystem.</p>
        </motion.div>

        <motion.p
          style={{ opacity: caption }}
          className="label-sm absolute inset-x-0 bottom-8 text-center text-ash"
        >
          Eleven worlds · one ecosystem · keep scrolling to explore it in three dimensions
        </motion.p>
      </div>
    </section>
  );
}

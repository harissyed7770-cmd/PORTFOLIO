"use client";

import { motion } from "framer-motion";
import { worldById } from "@/content/ecosystem";
import { useVisible } from "@/components/ui/primitives";
import { cn, mulberry32 } from "@/lib/utils";
import { useNowSeconds } from "@/hooks/useClient";
import { WorldShell } from "./WorldShell";

const world = worldById["trendtimes"];
const RED = world.accent;

function useClock() {
  const seconds = useNowSeconds();
  return seconds ? new Date(seconds * 1000) : null;
}

/** A deterministic rising line — shape only, no data. */
const trendPoints = (() => {
  const r = mulberry32(9);
  const pts: string[] = [];
  let y = 70;
  for (let i = 0; i < 24; i++) {
    y = Math.max(8, Math.min(90, y - (r() - 0.35) * 14));
    pts.push(`${((i / 23) * 300).toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(" ");
})();

function Greek({ widths, className }: { widths: number[]; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-[7px]", className)}>
      {widths.map((w, i) => (
        <span key={i} className="block h-[5px] rounded-full bg-white/18" style={{ width: `${w}%` }} />
      ))}
    </div>
  );
}

function Desk({
  label,
  index,
  className,
  children,
}: {
  label: string;
  index: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("group relative flex flex-col overflow-hidden bg-[#0b0b0c] p-5 md:p-6", className)}>
      <div className="flex items-center justify-between">
        <span className="label-sm text-mist">
          <span className="tabular-nums text-ash">{String(index).padStart(2, "0")}</span> · {label}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 animate-blink rounded-full" style={{ background: RED }} />
          <span className="label-sm text-ash">Desk</span>
        </span>
      </div>
      <div className="relative mt-5 flex-1">{children}</div>
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1/3 animate-scan bg-gradient-to-b from-transparent via-white/[0.025] to-transparent" />
    </div>
  );
}

function Wire({ active }: { active: boolean }) {
  const rows = [92, 78, 85, 40, 88, 72, 95, 60, 83, 50];
  return (
    <div className="flex flex-col gap-3">
      {rows.map((w, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="label-sm w-10 shrink-0 tabular-nums text-ash">
            {String(9 + Math.floor((i * 23) / 60)).padStart(2, "0")}:{String((i * 23) % 60).padStart(2, "0")}
          </span>
          <motion.span
            className="block h-[6px] rounded-full bg-white/20"
            initial={{ width: "0%" }}
            animate={active ? { width: `${w}%` } : undefined}
            transition={{ duration: 0.9, delay: i * 0.18, ease: [0.16, 1, 0.3, 1] }}
            style={i === 0 ? { background: RED } : undefined}
          />
        </div>
      ))}
    </div>
  );
}

function TrendLine({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 300 100" className="h-36 w-full" aria-hidden>
      {[25, 50, 75].map((g) => (
        <line key={g} x1="0" x2="300" y1={g} y2={g} stroke="rgba(255,255,255,0.06)" />
      ))}
      <motion.polyline
        points={trendPoints}
        fill="none"
        stroke={RED}
        strokeWidth={1.4}
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={active ? { pathLength: 1 } : undefined}
        transition={{ duration: 2.4, ease: [0.65, 0, 0.35, 1] }}
      />
    </svg>
  );
}

function People() {
  return (
    <div className="grid grid-cols-6 gap-2.5">
      {Array.from({ length: 18 }, (_, i) => (
        <span
          key={i}
          className={cn("aspect-square rounded-full border", i === 7 || i === 13 ? "border-transparent" : "border-white/15 bg-white/[0.04]")}
          style={i === 7 || i === 13 ? { background: RED } : undefined}
        />
      ))}
    </div>
  );
}

function Ideas() {
  const nodes = [
    [20, 30], [50, 18], [78, 34], [34, 66], [66, 70], [50, 46],
  ];
  return (
    <svg viewBox="0 0 100 90" className="h-36 w-full" aria-hidden>
      {nodes.map(([x, y], i) => (
        <line key={i} x1={50} y1={46} x2={x} y2={y} stroke="rgba(255,255,255,0.2)" />
      ))}
      <line x1={20} y1={30} x2={50} y2={18} stroke="rgba(255,255,255,0.12)" />
      <line x1={34} y1={66} x2={66} y2={70} stroke="rgba(255,255,255,0.12)" />
      {nodes.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === 5 ? 5 : 2.6} fill={i === 5 ? RED : "#f3f1eb"} />
      ))}
    </svg>
  );
}

function Culture() {
  return (
    <div className="relative h-36">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute top-1/2 h-24 w-24 -translate-y-1/2 rounded-full border border-white/25"
          style={{ left: `${18 + i * 20}%`, background: i === 1 ? `${RED}22` : "transparent" }}
          animate={{ x: [0, i === 1 ? 0 : i === 0 ? 8 : -8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function Conversations({ active }: { active: boolean }) {
  const msgs = [
    { side: "l", w: 62 },
    { side: "r", w: 48 },
    { side: "l", w: 74 },
    { side: "r", w: 36 },
  ];
  return (
    <div className="flex flex-col gap-2.5">
      {msgs.map((m, i) => (
        <motion.div
          key={i}
          className={cn("flex", m.side === "r" ? "justify-end" : "justify-start")}
          initial={{ opacity: 0, y: 8 }}
          animate={active ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.5, delay: 0.6 + i * 0.55 }}
        >
          <span
            className={cn("block rounded-2xl px-3 py-2.5", m.side === "r" ? "rounded-br-sm" : "rounded-bl-sm bg-white/[0.07]")}
            style={{ width: `${m.w}%`, background: m.side === "r" ? `${RED}33` : undefined }}
          >
            <Greek widths={[100, 70]} />
          </span>
        </motion.div>
      ))}
    </div>
  );
}

export function TrendTimes() {
  const now = useClock();
  const [gridRef, active] = useVisible<HTMLDivElement>("-10%");
  const channels = world.vocabulary;
  const dateLine = now
    ? now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : " ";
  const timeLine = now ? now.toLocaleTimeString("en-GB", { hour12: false }) : "--:--:--";

  return (
    <WorldShell world={world} className="bg-[#070708]" coordinates={["Media", "The media world", "Newsroom"]}>
      {/* Masthead */}
      <div className="gutter relative z-10 pt-10">
        <div className="bg-paper px-5 pb-5 pt-4 text-ink md:px-8">
          <div className="label-sm flex flex-wrap items-center justify-between gap-2 border-b-2 border-ink pb-3">
            <span>Edition · Live</span>
            <span className="hidden sm:inline">{dateLine}</span>
            <span className="tabular-nums">{timeLine}</span>
          </div>
          <h2 id="trendtimes-title" className="editorial py-3 text-center text-[clamp(3.6rem,13vw,13rem)] leading-[0.85] tracking-[-0.03em]">
            TrendTimes
          </h2>
          <div className="label-sm flex items-center justify-between border-t border-ink pt-2">
            <span>The media world</span>
            <span className="hidden md:inline">{channels.join(" · ")}</span>
            <span>Command centre</span>
          </div>
        </div>
        {/* Ticker */}
        <div className="relative flex overflow-hidden border-b border-white/10 bg-[#0b0b0c] py-3" aria-hidden>
          <div className="flex w-max animate-marquee">
            {[0, 1].map((k) => (
              <div key={k} className="flex shrink-0 items-center">
                {Array.from({ length: 3 }).flatMap((_, j) =>
                  channels.map((c) => (
                    <span key={`${k}-${j}-${c}`} className="label flex items-center gap-6 pr-6 text-paper">
                      {c}
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: RED }} />
                    </span>
                  )),
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Desks */}
      <div ref={gridRef} className="gutter relative z-10">
        <div className="grid auto-rows-[minmax(220px,auto)] gap-px border border-white/10 bg-white/10 md:grid-cols-4">
          <Desk label={channels[0]} index={1} className="md:col-span-2 md:row-span-2">
            <Wire active={active} />
          </Desk>
          <Desk label={channels[1]} index={2} className="md:col-span-2">
            <TrendLine active={active} />
          </Desk>
          <Desk label={channels[2]} index={3}>
            <div className="grid grid-cols-2 gap-3">
              <Greek widths={[100, 92, 96, 70, 100, 88, 94, 40]} />
              <Greek widths={[96, 100, 84, 100, 90, 98, 62]} />
            </div>
          </Desk>
          <Desk label={channels[3]} index={4}>
            <People />
          </Desk>
          <Desk label={channels[4]} index={5}>
            <Ideas />
          </Desk>
          <Desk label={channels[5]} index={6}>
            <Culture />
          </Desk>
          <Desk label={channels[6]} index={7} className="md:col-span-2">
            <Conversations active={active} />
          </Desk>
        </div>
        <p className="label-sm mt-4 text-ash">
          Greeked lines, on purpose — TrendTimes stories live on TrendTimes. None are invented here.
        </p>
      </div>
    </WorldShell>
  );
}

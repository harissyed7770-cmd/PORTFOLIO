"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { foundationFields, foundationRecords, worldById, type FoundationField, type World } from "@/content/ecosystem";
import { sectionById } from "@/content/sections";
import { Coordinates, Rise } from "@/components/ui/primitives";
import { cn, scrollToId } from "@/lib/utils";

const cg = worldById["cg-ed-foundation"];
const sappta = worldById["sappta-support-foundation"];
const nexus = worldById["ngo-nexus"];
const foundations = [cg, sappta];

type Selection = { world: World; field: FoundationField };

function Threads() {
  const curves = [-90, -55, -24, 0, 24, 55, 90];
  return (
    <svg viewBox="0 0 1000 560" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="fd-thread" x1="0" x2="1">
          <stop offset="0%" stopColor={cg.accent} />
          <stop offset="100%" stopColor={sappta.accent} />
        </linearGradient>
      </defs>
      {curves.map((c, i) => (
        <path
          key={c}
          d={`M280 280 C 420 ${280 + c * 1.6}, 580 ${280 - c * 1.6}, 720 280`}
          fill="none"
          stroke="url(#fd-thread)"
          strokeOpacity={i === 3 ? 0.7 : 0.28}
          strokeWidth={i === 3 ? 1.4 : 1}
          strokeDasharray="4 10"
          className="[animation:fd-flow_6s_linear_infinite]"
          style={{ animationDirection: i % 2 ? "reverse" : "normal" }}
        />
      ))}
      <path d="M280 280 Q 360 120 500 70" fill="none" stroke={cg.accent} strokeOpacity={0.25} />
      <path d="M720 280 Q 640 120 500 70" fill="none" stroke={sappta.accent} strokeOpacity={0.25} />
      <style>{`@keyframes fd-flow { to { stroke-dashoffset: -140; } }`}</style>
    </svg>
  );
}

function ImpactNode({
  world,
  x,
  selection,
  onPick,
}: {
  world: World;
  x: number;
  selection: Selection;
  onPick: (s: Selection) => void;
}) {
  const activeWorld = selection.world.id === world.id;
  return (
    <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%` }}>
      <div className="relative h-[300px] w-[300px]">
        <span
          aria-hidden
          className="absolute inset-[34%] rounded-full animate-breathe"
          style={{ background: `radial-gradient(circle, ${world.accent} 0%, ${world.accent}55 45%, transparent 72%)` }}
        />
        <span aria-hidden className="absolute inset-[18%] rounded-full border" style={{ borderColor: `${world.accent}44` }} />
        <span aria-hidden className="absolute inset-[4%] rounded-full border border-dashed border-white/10" />
        {foundationFields.map((f, i) => {
          const a = (i / foundationFields.length) * Math.PI * 2 - Math.PI / 2;
          const on = activeWorld && selection.field === f;
          return (
            <button
              key={f}
              type="button"
              onClick={() => onPick({ world, field: f })}
              aria-pressed={on}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${50 + Math.cos(a) * 46}%`, top: `${50 + Math.sin(a) * 46}%` }}
            >
              <span
                className={cn(
                  "label-sm block rounded-full border px-2.5 py-1.5 backdrop-blur transition-colors",
                  on ? "text-ink" : "border-white/15 bg-obsidian/70 text-mist hover:border-white/40 hover:text-paper",
                )}
                style={on ? { background: world.accent, borderColor: world.accent } : undefined}
              >
                {f}
              </span>
            </button>
          );
        })}
      </div>
      <p className="absolute left-1/2 top-[calc(100%+0.75rem)] w-64 -translate-x-1/2 text-center">
        <span className="label-sm block" style={{ color: world.accent }}>
          {world.mark}
        </span>
        <span className="mt-1 block text-[1.05rem] text-paper">{world.name}</span>
      </p>
    </div>
  );
}

export function Foundations() {
  const [selection, setSelection] = useState<Selection>({ world: cg, field: "Mission" });
  const value = foundationRecords[selection.world.id]?.[selection.field];

  return (
    <section id="foundations" data-hud aria-labelledby="foundations-title" className="relative bg-obsidian pb-24 md:pb-32">
      <div className="gutter pt-[calc(var(--hud-h)+2.5rem)]">
        <Coordinates code={`${sectionById.foundations.code} / World`} items={["Social impact", "Foundation network", "Constellation"]} />
      </div>
      <div className="gutter mt-12 grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="label-sm text-ash">The foundation network</p>
          <h2 id="foundations-title" className="display mt-3 text-[clamp(2.6rem,6vw,5.6rem)] text-paper">
            Two foundations.
            <br />
            <span className="editorial mt-2 block text-[0.62em] normal-case italic leading-[1] tracking-normal text-mist">One constellation of care.</span>
          </h2>
        </div>
        <Rise className="flex items-end lg:col-span-5">
          <p className="text-[1rem] leading-relaxed text-mist">
            {cg.name} and {sappta.name} sit together in the social impact constellation. Choose a node to open its mission, work,
            initiatives, communities, impact and partnerships.
          </p>
        </Rise>
      </div>

      {/* Desktop constellation */}
      <div className="gutter mt-10 hidden md:block">
        <div className="relative h-[560px] overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03),transparent_70%)]">
          <Threads />
          <button
            type="button"
            onClick={() => scrollToId("ngo-nexus")}
            className="label-sm absolute left-1/2 top-[12.5%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-obsidian px-3 py-1.5 text-mist transition-colors hover:text-paper"
          >
            <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle" style={{ background: nexus.accent }} />
            {nexus.name}
          </button>
          <ImpactNode world={cg} x={28} selection={selection} onPick={setSelection} />
          <ImpactNode world={sappta} x={72} selection={selection} onPick={setSelection} />
        </div>
      </div>

      {/* Mobile: the same nodes, stacked */}
      <div className="gutter mt-10 flex flex-col gap-6 md:hidden">
        {foundations.map((f) => (
          <div key={f.id} className="rounded-2xl border border-white/10 p-5">
            <div className="flex items-center gap-3">
              <span className="h-6 w-6 rounded-full" style={{ background: `radial-gradient(circle, ${f.accent}, ${f.accent}33)` }} />
              <span className="text-[1.05rem] text-paper">{f.name}</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {foundationFields.map((field) => {
                const on = selection.world.id === f.id && selection.field === field;
                return (
                  <button
                    key={field}
                    type="button"
                    onClick={() => setSelection({ world: f, field })}
                    aria-pressed={on}
                    className={cn("label-sm rounded-full border px-3 py-2", on ? "text-ink" : "border-white/15 text-mist")}
                    style={on ? { background: f.accent, borderColor: f.accent } : undefined}
                  >
                    {field}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Record */}
      <div className="gutter mt-6">
        <div className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-[1fr_2fr]" aria-live="polite">
          <div className="bg-obsidian p-6 md:p-8">
            <span className="label-sm" style={{ color: selection.world.accent }}>
              {selection.world.name}
            </span>
            <AnimatePresence mode="wait">
              <motion.p
                key={selection.field}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="display mt-3 text-[clamp(2rem,4vw,3.4rem)] text-paper"
              >
                {selection.field}
              </motion.p>
            </AnimatePresence>
          </div>
          <div className="flex flex-col justify-center gap-3 bg-obsidian p-6 md:p-8">
            {value ? (
              <p className="text-[1.05rem] leading-relaxed text-platinum">{value}</p>
            ) : (
              <>
                <p className="label-sm flex items-center gap-2 text-mist">
                  <span className="h-1.5 w-1.5 animate-blink rounded-full bg-current" aria-hidden />
                  Awaiting verified record
                </p>
                <p className="editorial text-[clamp(1.3rem,2vw,1.8rem)] italic leading-snug text-paper">
                  This field is intentionally empty. Impact is never estimated here — it is published only when it can be verified.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

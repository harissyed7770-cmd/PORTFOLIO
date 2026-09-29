"use client";

import { useMemo } from "react";
import { lab, labDomains, labStages, type LabStage } from "@/content/living";
import { Coordinates, OpenSlot, Rise } from "@/components/ui/primitives";
import { mulberry32 } from "@/lib/utils";

/** A tiny generative glyph so each specimen has a face of its own. */
function Glyph({ seed }: { seed: number }) {
  const shapes = useMemo(() => {
    const r = mulberry32(seed * 97 + 3);
    return Array.from({ length: 5 }, () => ({ x: 4 + r() * 24, y: 4 + r() * 24, r: 1 + r() * 3.5, ring: r() > 0.6 }));
  }, [seed]);
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden>
      {shapes.map((s, i) =>
        s.ring ? (
          <circle key={i} cx={s.x} cy={s.y} r={s.r + 1.5} fill="none" stroke="currentColor" strokeOpacity={0.6} />
        ) : (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="currentColor" fillOpacity={0.85} />
        ),
      )}
      <line x1={shapes[0].x} y1={shapes[0].y} x2={shapes[1].x} y2={shapes[1].y} stroke="currentColor" strokeOpacity={0.4} />
    </svg>
  );
}

const stageNote: Record<LabStage, string> = {
  Building: "In active construction",
  Experimenting: "Being tested",
  Exploring: "Being explored",
  Archived: "Paused or retired",
  Next: "Queued",
};

export function TheLab() {
  const byStage = (stage: LabStage) => lab.entries.filter((e) => e.stage === stage);
  return (
    <section id="the-lab" data-hud aria-labelledby="the-lab-title" className="relative bg-graphite-950 pb-24 md:pb-32">
      <div aria-hidden className="pointer-events-none absolute inset-0 grid-fine opacity-70" />
      <div className="gutter relative pt-[calc(var(--hud-h)+2.5rem)]">
        <Coordinates code="16 / Living" items={["The Lab", lab.updated ? `Updated ${lab.updated}` : "Awaiting first log entry"]} />
        <div className="mt-12 grid gap-8 lg:grid-cols-12">
          <h2 id="the-lab-title" className="display text-[clamp(3.6rem,10vw,10rem)] text-paper lg:col-span-7">
            The Lab
          </h2>
          <Rise className="flex flex-col justify-end gap-4 lg:col-span-5">
            <p className="editorial text-[clamp(1.3rem,2vw,1.8rem)] italic leading-snug text-platinum">
              What is being explored right now. The Lab changes over time — this bench is never finished.
            </p>
          </Rise>
        </div>

        <div className="-mx-[var(--gutter)] mt-14 overflow-x-auto px-[var(--gutter)] pb-2" data-lenis-prevent>
          <div className="grid min-w-[980px] grid-cols-5 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10">
            {labStages.map((stage, si) => {
              const entries = byStage(stage);
              const exploring = stage === "Exploring";
              return (
                <div key={stage} className="relative flex min-h-[30rem] flex-col bg-graphite-950/95 p-5">
                  <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-24 animate-scan bg-gradient-to-b from-transparent via-white/[0.03] to-transparent" style={{ animationDelay: `${si * 0.8}s` }} />
                  <div className="flex items-center justify-between">
                    <span className="label text-paper">{stage}</span>
                    <span className="label-sm tabular-nums text-ash">
                      {String(exploring ? labDomains.length + entries.length : entries.length).padStart(2, "0")}
                    </span>
                  </div>
                  <span className="label-sm mt-1 text-ash">{stageNote[stage]}</span>
                  <ul className="mt-6 flex flex-col gap-2">
                    {entries.map((e) => (
                      <li key={e.title} className="rounded-lg border border-white/15 bg-white/[0.04] p-3">
                        <p className="text-[0.9rem] text-paper">{e.title}</p>
                        <p className="label-sm mt-1 text-ash">{e.domain}</p>
                      </li>
                    ))}
                    {exploring &&
                      labDomains.map((d, i) => (
                        <li
                          key={d}
                          className="group flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2.5 text-mist transition-colors hover:border-white/30 hover:text-paper"
                        >
                          <Glyph seed={i + 1} />
                          <span className="text-[0.9rem]">{d}</span>
                        </li>
                      ))}
                  </ul>
                  {!exploring && entries.length === 0 && (
                    <OpenSlot label="Open bench" note="Awaiting log entry" compact className="mt-auto rounded-lg" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-white/10 bg-black/40 px-5 py-4 font-mono text-[0.78rem] leading-7 text-mist">
          <p>
            <span className="text-ash">lab.log</span> ·{" "}
            {lab.updated ? `last entry ${lab.updated}` : "no entries yet — the domains under exploration come from the founder; specific experiments appear as they are logged."}
            <span aria-hidden className="ml-1 inline-block h-3.5 w-2 translate-y-0.5 animate-blink bg-paper" />
          </p>
        </div>
      </div>
    </section>
  );
}

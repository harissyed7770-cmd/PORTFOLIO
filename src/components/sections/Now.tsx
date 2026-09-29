"use client";

import { now, nowChannels } from "@/content/living";
import { Coordinates, Rise } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { useNowSeconds } from "@/hooks/useClient";

function LocalClock() {
  const seconds = useNowSeconds();
  const t = seconds ? new Date(seconds * 1000).toLocaleTimeString("en-GB", { hour12: false }) : "--:--:--";
  return <span className="tabular-nums">{t}</span>;
}

export function Now() {
  return (
    <section id="now" data-hud aria-labelledby="now-title" className="relative bg-obsidian pb-24 md:pb-32">
      <div className="gutter pt-[calc(var(--hud-h)+2.5rem)]">
        <Coordinates code="18 / Living" items={["Now", now.updated ? `Updated ${now.updated}` : "Awaiting first transmission"]} />
        <div className="mt-12 grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <h2 id="now-title" className="display-wide relative inline-block text-[clamp(4.6rem,12vw,12rem)] leading-[0.8] text-paper">
              Now
              <span aria-hidden className="absolute -right-2 top-[12%] inline-block h-4 w-4 animate-blink rounded-full bg-[#d2563f] md:h-6 md:w-6" />
            </h2>
          </div>
          <Rise className="flex flex-col justify-end gap-3 lg:col-span-6">
            <p className="editorial text-[clamp(1.35rem,2.2vw,2rem)] italic leading-snug text-platinum">
              Not a biography. A live transmission of what is being built, explored, learned and planned — updated periodically, never finished.
            </p>
          </Rise>
        </div>

        <div className="mt-14 overflow-hidden rounded-2xl border border-white/10 bg-graphite-950">
          <div className="label-sm flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-3.5 text-ash md:px-8">
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 animate-blink rounded-full bg-[#d2563f]" aria-hidden /> Transmission
            </span>
            <span>
              Your local time · <LocalClock />
            </span>
          </div>
          <ul>
            {nowChannels.map((c, i) => {
              const items = now.entries[c] ?? [];
              return (
                <li key={c} className={cn("grid gap-3 px-5 py-6 md:grid-cols-[4rem_minmax(0,22rem)_1fr] md:items-baseline md:px-8", i > 0 && "border-t border-white/10")}>
                  <span className="label-sm tabular-nums text-ash">{String(i + 1).padStart(2, "0")}</span>
                  <span className="display text-[clamp(1.5rem,2.2vw,2.2rem)] text-paper">{c}</span>
                  {items.length ? (
                    <ul className="flex flex-col gap-1.5 text-[1rem] text-platinum">
                      {items.map((it) => (
                        <li key={it}>{it}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="flex items-center gap-2 font-mono text-[0.85rem] text-ash">
                      awaiting transmission
                      <span aria-hidden className="inline-block h-4 w-2 animate-blink bg-mist/70" />
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
        <p className="label-sm mt-4 text-ash">Channels fill only with what the founder publishes. An empty channel means nothing has been announced — not that nothing is happening.</p>
      </div>
    </section>
  );
}

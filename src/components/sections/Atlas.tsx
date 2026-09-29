"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { domains, person, thematicLinks, worlds, worldsInDomain, type DomainId, type World } from "@/content/ecosystem";
import { useExperience } from "@/components/providers/Experience";
import { Coordinates } from "@/components/ui/primitives";
import { cn, scrollToId } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/useClient";

const R1 = 200;
const R2 = 390;

const targetFor = (id: string) => (id === "cg-ed-foundation" || id === "sappta-support-foundation" ? "foundations" : id);

function useLayout() {
  return useMemo(() => {
    const dAngle: Record<string, number> = {};
    domains.forEach((d, i) => (dAngle[d.id] = (i / domains.length) * Math.PI * 2 - Math.PI / 2));
    const wPos: Record<string, { x: number; y: number; a: number }> = {};
    domains.forEach((d) => {
      const members = worldsInDomain(d.id);
      members.forEach((w, k) => {
        const a = dAngle[d.id] + (k - (members.length - 1) / 2) * 0.3;
        wPos[w.id] = { x: Math.cos(a) * R2, y: Math.sin(a) * R2, a };
      });
    });
    return { dAngle, wPos };
  }, []);
}

function Universe({ onFocus, focus }: { onFocus: (w: World | null) => void; focus: World | null }) {
  const { reducedMotion } = useExperience();
  const { dAngle, wPos } = useLayout();
  const [hoverDomain, setHoverDomain] = useState<DomainId | null>(null);
  const links = useMemo(() => thematicLinks(), []);

  const litWorld = (w: World) => (focus ? focus.id === w.id : hoverDomain ? w.domain === hoverDomain : true);
  const litDomain = (d: DomainId) => (focus ? focus.domain === d : hoverDomain ? hoverDomain === d : true);

  return (
    <svg viewBox="-680 -500 1360 1000" className="h-auto w-full" role="img" aria-label={`A map of ${person.name}'s ecosystem: seven domains and eleven worlds.`}>
      <g className="origin-center animate-spin-slow [transform-box:fill-box]" aria-hidden>
        <circle r={R2 + 70} fill="none" stroke="rgba(255,255,255,0.06)" strokeDasharray="2 10" />
        <circle r={R2 + 110} fill="none" stroke="rgba(255,255,255,0.035)" strokeDasharray="1 16" />
      </g>
      <circle r={R1} fill="none" stroke="rgba(255,255,255,0.08)" />
      <circle r={R2} fill="none" stroke="rgba(255,255,255,0.06)" />

      {/* thematic links between worlds */}
      {links.map((l) => {
        const a = wPos[l.a];
        const b = wPos[l.b];
        const on = focus && (focus.id === l.a || focus.id === l.b);
        return (
          <path
            key={`${l.a}-${l.b}`}
            d={`M${a.x} ${a.y} Q${(a.x + b.x) * 0.2} ${(a.y + b.y) * 0.2} ${b.x} ${b.y}`}
            fill="none"
            stroke={on ? "#f3f1eb" : "rgba(255,255,255,0.06)"}
            strokeOpacity={on ? 0.5 : 1}
            strokeDasharray="3 6"
          />
        );
      })}

      {/* person → domain → world */}
      {domains.map((d) => {
        const a = dAngle[d.id];
        const dx = Math.cos(a) * R1;
        const dy = Math.sin(a) * R1;
        const on = litDomain(d.id);
        return (
          <g key={d.id}>
            <line x1={0} y1={0} x2={dx} y2={dy} stroke="#f3f1eb" strokeOpacity={on ? 0.35 : 0.07} />
            {worldsInDomain(d.id).map((w) => {
              const p = wPos[w.id];
              const path = `M${dx} ${dy} Q${Math.cos(a) * (R1 + 110)} ${Math.sin(a) * (R1 + 110)} ${p.x} ${p.y}`;
              const full = `M0 0 L${dx} ${dy} ${path.replace(/^M[^Q]+/, "")}`;
              return (
                <g key={w.id}>
                  <path d={path} fill="none" stroke={w.accent} strokeOpacity={litWorld(w) ? 0.5 : 0.08} strokeWidth={1.2} />
                  {!reducedMotion && (
                    <circle r={3.2} fill={w.accent} opacity={litWorld(w) ? 0.95 : 0.15}>
                      <animateMotion dur={`${5 + (w.name.length % 4)}s`} repeatCount="indefinite" path={full} />
                    </circle>
                  )}
                </g>
              );
            })}
          </g>
        );
      })}

      {/* domains */}
      {domains.map((d) => {
        const a = dAngle[d.id];
        const x = Math.cos(a) * R1;
        const y = Math.sin(a) * R1;
        const on = litDomain(d.id);
        return (
          <g
            key={d.id}
            onMouseEnter={() => setHoverDomain(d.id)}
            onMouseLeave={() => setHoverDomain(null)}
            className="cursor-default"
            opacity={on ? 1 : 0.35}
          >
            <circle cx={x} cy={y} r={7} fill="#06070a" stroke="#f3f1eb" strokeWidth={1.2} />
            <text
              x={x + Math.cos(a) * 20}
              y={y + Math.sin(a) * 20 + 4}
              textAnchor={Math.abs(Math.cos(a)) < 0.3 ? "middle" : Math.cos(a) > 0 ? "start" : "end"}
              fontSize="12"
              letterSpacing="2"
              fontFamily="var(--font-jetbrains)"
              fill="rgba(243,241,235,0.75)"
            >
              {d.label.toUpperCase()}
            </text>
          </g>
        );
      })}

      {/* worlds */}
      {worlds.map((w) => {
        const p = wPos[w.id];
        const on = litWorld(w);
        return (
          <g
            key={w.id}
            role="link"
            tabIndex={0}
            aria-label={`${w.name} — ${w.layer}`}
            onMouseEnter={() => onFocus(w)}
            onMouseLeave={() => onFocus(null)}
            onFocus={() => onFocus(w)}
            onBlur={() => onFocus(null)}
            onClick={() => scrollToId(targetFor(w.id))}
            onKeyDown={(e) => e.key === "Enter" && scrollToId(targetFor(w.id))}
            className="cursor-pointer outline-none"
            opacity={on ? 1 : 0.3}
          >
            <circle cx={p.x} cy={p.y} r={focus?.id === w.id ? 20 : 14} fill={w.accent} fillOpacity={0.15} />
            <circle cx={p.x} cy={p.y} r={focus?.id === w.id ? 9 : 6.5} fill={w.accent} />
            <text
              x={p.x + Math.cos(p.a) * 26}
              y={p.y + Math.sin(p.a) * 26 + 5}
              textAnchor={Math.abs(Math.cos(p.a)) < 0.3 ? "middle" : Math.cos(p.a) > 0 ? "start" : "end"}
              fontSize="17"
              fontFamily="var(--font-archivo)"
              fill="#f3f1eb"
            >
              {w.name}
            </text>
          </g>
        );
      })}

      {/* the person */}
      <circle r={42} fill="rgba(243,241,235,0.06)" />
      <circle r={10} fill="#f3f1eb" />
      <text y={36} textAnchor="middle" fontSize="13" letterSpacing="3" fontFamily="var(--font-jetbrains)" fill="#f3f1eb">
        {person.name.toUpperCase()}
      </text>
    </svg>
  );
}

function IndexTree() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/40 p-6 font-mono text-[0.82rem] leading-7 md:p-10 md:text-[0.95rem]" data-lenis-prevent>
      <p className="text-paper">{person.name.toUpperCase()}</p>
      <p className="text-ash">│</p>
      {domains.map((d, di) => {
        const lastD = di === domains.length - 1;
        const members = worldsInDomain(d.id);
        return (
          <div key={d.id}>
            <p className="text-mist">
              <span className="text-ash">{lastD ? "└── " : "├── "}</span>
              {d.label.toUpperCase()}
            </p>
            {members.map((w, wi) => (
              <p key={w.id} className="whitespace-pre">
                <span className="text-ash">
                  {lastD ? "    " : "│   "}
                  {wi === members.length - 1 ? "└── " : "├── "}
                </span>
                <button
                  type="button"
                  onClick={() => scrollToId(targetFor(w.id))}
                  className="text-paper underline decoration-white/20 underline-offset-4 transition-colors hover:decoration-white"
                >
                  {w.name}
                </button>
                <span className="hidden text-ash sm:inline">{"  "}· {w.layer.toLowerCase()}</span>
              </p>
            ))}
            {!lastD && <p className="text-ash">│</p>}
          </div>
        );
      })}
    </div>
  );
}

export function Atlas() {
  const small = useMediaQuery("(max-width: 639px)");
  const [choice, setView] = useState<"universe" | "index" | null>(null);
  const view = choice ?? (small ? "index" : "universe");
  const [focus, setFocus] = useState<World | null>(null);

  return (
    <section id="atlas" data-hud aria-labelledby="atlas-title" className="relative overflow-hidden bg-obsidian pb-24 md:pb-32">
      <div className="gutter pt-[calc(var(--hud-h)+2.5rem)]">
        <Coordinates code="17 / Ecosystem" items={["Atlas", "Every relationship"]} />
        <div className="mt-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 id="atlas-title" className="display text-[clamp(2.8rem,7vw,6.5rem)] text-paper">
              The atlas
            </h2>
            <p className="editorial mt-3 max-w-xl text-[clamp(1.2rem,1.8vw,1.6rem)] italic text-mist">
              One person at the centre, seven domains in orbit, eleven worlds at the edge — and the themes that tie them together.
            </p>
          </div>
          <div role="tablist" aria-label="Atlas view" className="flex rounded-full border border-white/15 p-1">
            {(["universe", "index"] as const).map((v) => (
              <button
                key={v}
                role="tab"
                aria-selected={view === v}
                type="button"
                onClick={() => setView(v)}
                className={cn("label-sm rounded-full px-4 py-2 transition-colors", view === v ? "bg-paper text-ink" : "text-mist hover:text-paper")}
              >
                {v === "universe" ? "Universe" : "Index"}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {view === "universe" ? (
            <motion.div
              key="universe"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="relative mt-8 grid items-center gap-8 lg:grid-cols-[1fr_20rem]"
            >
              <div className="mx-auto w-full max-w-[min(100%,calc((100svh_-_9rem)*1.36))]">
                <Universe focus={focus} onFocus={setFocus} />
              </div>
              <div className="min-h-[12rem] lg:self-center" aria-live="polite">
                {focus ? (
                  <div className="rounded-2xl border border-white/10 p-6">
                    <span className="label-sm" style={{ color: focus.accent }}>
                      {focus.mark} · {focus.layer}
                    </span>
                    <p className="display mt-3 text-[1.8rem] text-paper">{focus.name}</p>
                    <p className="mt-3 text-[0.9rem] leading-relaxed text-mist">{focus.summary}</p>
                    <p className="label-sm mt-5 flex items-center gap-2 text-paper">
                      Click to enter <ArrowDown className="h-3 w-3" aria-hidden />
                    </p>
                  </div>
                ) : (
                  <p className="label-sm text-ash">Hover a world to trace its path back to the centre. Click to enter it.</p>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div key="index" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="mt-8">
              <IndexTree />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

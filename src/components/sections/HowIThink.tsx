"use client";

import { useEffect, useRef } from "react";
import { useTransform } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { person } from "@/content/ecosystem";
import { Coordinates, useMotionNumber, useSectionProgress } from "@/components/ui/primitives";
import { clamp, cn } from "@/lib/utils";

function Principle() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-word]",
        { opacity: 0.1, filter: "blur(6px)" },
        {
          opacity: 1,
          filter: "blur(0px)",
          stagger: 0.12,
          ease: "none",
          scrollTrigger: { trigger: ref.current, start: "top top", end: "bottom bottom", scrub: 0.6 },
        },
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  const lead = person.principle.lead.split(" ");
  const emphasis = person.principle.emphasis.split(" ");
  const tail = person.principle.tail.split(" ");

  return (
    <div ref={ref} className="relative h-[240vh]">
      <div className="gutter sticky top-0 flex h-[100svh] flex-col justify-center">
        <Coordinates code="15 / Mind" items={["How I think", "The core principle"]} className="max-w-xl" />
        <h2 id="how-i-think-title" className="sr-only">
          How I think
        </h2>
        <p
          className="mt-10 max-w-[18ch] text-[clamp(2.8rem,8.4vw,9rem)] leading-[0.95] text-paper"
          aria-label={`${person.principle.lead} ${person.principle.emphasis} ${person.principle.tail}`}
        >
          {lead.map((w, i) => (
            <span key={`l${i}`} data-word aria-hidden className="display mr-[0.22em] inline-block">
              {w}
            </span>
          ))}
          {emphasis.map((w, i) => (
            <span key={`e${i}`} data-word aria-hidden className="editorial mr-[0.22em] inline-block italic text-[#e9e2d0]">
              {w}
            </span>
          ))}
          {tail.map((w, i) => (
            <span key={`t${i}`} data-word aria-hidden className="display mr-[0.22em] inline-block">
              {w}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}

function Loop() {
  const ref = useRef<HTMLDivElement>(null);
  const p = useSectionProgress(ref);
  const sv = useTransform(p, (v) => clamp((v - 0.05) / 0.85) * (person.principles.length - 1));
  const s = useMotionNumber(sv, 100);
  const current = Math.round(s);
  const n = person.principles.length;
  const R = 150;
  const angle = (i: number) => (i / n) * Math.PI * 2 - Math.PI / 2;
  const traveller = angle(s);
  const complete = s >= n - 1.02;

  return (
    <div ref={ref} className="relative h-[340vh]">
      <div className="gutter sticky top-0 grid h-[100svh] items-center gap-10 pt-[var(--hud-h)] lg:grid-cols-2">
        <div className="relative mx-auto aspect-square w-[min(80vw,480px)]" aria-hidden>
          <svg viewBox="-200 -200 400 400" className="h-full w-full overflow-visible">
            <circle r={R} fill="none" stroke="rgba(255,255,255,0.1)" />
            <circle
              r={R}
              fill="none"
              stroke="#f3f1eb"
              strokeWidth={1.4}
              strokeDasharray={`${(s / n) * Math.PI * 2 * R} ${Math.PI * 2 * R}`}
              transform="rotate(-90)"
            />
            {complete && (
              <path d={`M ${Math.cos(angle(n - 1)) * R} ${Math.sin(angle(n - 1)) * R} A ${R} ${R} 0 0 1 0 ${-R}`} fill="none" stroke="#bfa77c" strokeWidth={1.4} strokeDasharray="3 5" />
            )}
            {person.principles.map((pr, i) => {
              const a = angle(i);
              const on = i <= current;
              return (
                <g key={pr}>
                  <circle cx={Math.cos(a) * R} cy={Math.sin(a) * R} r={i === current ? 7 : 4} fill={on ? "#f3f1eb" : "#06070a"} stroke="#f3f1eb" strokeOpacity={on ? 1 : 0.4} />
                  <text
                    x={Math.cos(a) * (R + 28)}
                    y={Math.sin(a) * (R + 28) + 4}
                    textAnchor={Math.abs(Math.cos(a)) < 0.2 ? "middle" : Math.cos(a) > 0 ? "start" : "end"}
                    fontSize="11"
                    letterSpacing="1.5"
                    fontFamily="var(--font-jetbrains)"
                    fill={i === current ? "#f3f1eb" : "rgba(243,241,235,0.4)"}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </text>
                </g>
              );
            })}
            <circle cx={Math.cos(traveller) * R} cy={Math.sin(traveller) * R} r={14} fill="rgba(243,241,235,0.12)" />
            <text textAnchor="middle" y={-6} fontSize="12" letterSpacing="3" fontFamily="var(--font-jetbrains)" fill="rgba(243,241,235,0.55)">
              THE LOOP
            </text>
            <text textAnchor="middle" y={16} fontSize="26" fontFamily="var(--font-instrument)" fontStyle="italic" fill="#f3f1eb">
              {complete ? "again." : `${current + 1} / ${n}`}
            </text>
          </svg>
        </div>
        <ol className="flex flex-col gap-1" aria-label="Principles">
          {person.principles.map((pr, i) => (
            <li
              key={pr}
              aria-current={i === current ? "step" : undefined}
              className={cn(
                "display text-[clamp(1.8rem,4.2vw,3.9rem)] transition-all duration-500",
                i === current ? "translate-x-3 text-paper" : i < current ? "text-white/35" : "text-white/12",
              )}
            >
              {pr}
            </li>
          ))}
          <li className={cn("label-sm mt-6 transition-opacity duration-700", complete ? "text-brass opacity-100" : "opacity-0")}>
            ↺ and the loop begins again
          </li>
        </ol>
      </div>
    </div>
  );
}

export function HowIThink() {
  return (
    <section id="how-i-think" data-hud aria-labelledby="how-i-think-title" className="relative bg-obsidian">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(191,167,124,0.06),transparent_55%)]" />
      <Principle />
      <Loop />
    </section>
  );
}

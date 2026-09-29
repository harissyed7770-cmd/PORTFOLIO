"use client";

import { useEffect, useRef, useState } from "react";
import { worldById } from "@/content/ecosystem";
import { useExperience } from "@/components/providers/Experience";
import { RevealWords, useVisible } from "@/components/ui/primitives";
import { cn, mulberry32 } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/useClient";
import { WorldShell } from "./WorldShell";

const world = worldById["jobtimes24"];
const AMBER = world.accent;

const talent = ["Students", "Graduates", "Skills"];
const opportunity = ["Jobs", "Employers", "Opportunities"];

type Pt = { x: number; y: number };

function anchors(vertical: boolean) {
  const t = talent.map((_, i) => (vertical ? { x: 0.2 + i * 0.3, y: 0.1 } : { x: 0.1, y: 0.22 + i * 0.28 }));
  const o = opportunity.map((_, i) => (vertical ? { x: 0.2 + i * 0.3, y: 0.9 } : { x: 0.9, y: 0.22 + i * 0.28 }));
  return { t, o };
}

function bez(p0: Pt, p1: Pt, p2: Pt, p3: Pt, u: number): Pt {
  const v = 1 - u;
  return {
    x: v * v * v * p0.x + 3 * v * v * u * p1.x + 3 * v * u * u * p2.x + u * u * u * p3.x,
    y: v * v * v * p0.y + 3 * v * v * u * p1.y + 3 * v * u * u * p2.y + u * u * u * p3.y,
  };
}

function controls(a: Pt, b: Pt, vertical: boolean): [Pt, Pt] {
  return vertical
    ? [{ x: a.x, y: 0.45 }, { x: b.x, y: 0.55 }]
    : [{ x: 0.42, y: a.y }, { x: 0.58, y: b.y }];
}

function FlowMap({ focus, vertical }: { focus: string | null; vertical: boolean }) {
  const { reducedMotion } = useExperience();
  const [wrapRef, visible] = useVisible<HTMLDivElement>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const focusRef = useRef(focus);
  useEffect(() => {
    focusRef.current = focus;
  }, [focus]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap || !visible) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let w = 0;
    let h = 0;
    const resize = () => {
      w = wrap.clientWidth;
      h = wrap.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    const { t, o } = anchors(vertical);
    const routes = t.flatMap((a, i) => o.map((b, j) => ({ a, b, from: talent[i], to: opportunity[j], c: controls(a, b, vertical) })));
    const rand = mulberry32(24);
    const particles = Array.from({ length: 220 }, () => ({
      r: Math.floor(rand() * routes.length),
      u: rand(),
      speed: 0.05 + rand() * 0.07,
    }));
    let raf = 0;
    let last = performance.now();
    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const f = focusRef.current;
      const S = (p: Pt) => ({ x: p.x * w, y: p.y * h });
      routes.forEach((rt) => {
        const on = !f || rt.from === f || rt.to === f;
        ctx.beginPath();
        const a = S(rt.a);
        const c1 = S(rt.c[0]);
        const c2 = S(rt.c[1]);
        const b = S(rt.b);
        ctx.moveTo(a.x, a.y);
        ctx.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, b.x, b.y);
        ctx.strokeStyle = on ? "rgba(216,166,75,0.22)" : "rgba(255,255,255,0.04)";
        ctx.lineWidth = 1;
        ctx.stroke();
      });
      particles.forEach((pt) => {
        const rt = routes[pt.r];
        if (!reducedMotion) pt.u += pt.speed * dt;
        if (pt.u > 1) pt.u -= 1;
        const on = !f || rt.from === f || rt.to === f;
        const p = S(bez(rt.a, rt.c[0], rt.c[1], rt.b, pt.u));
        const q = S(bez(rt.a, rt.c[0], rt.c[1], rt.b, Math.max(0, pt.u - 0.018)));
        ctx.beginPath();
        ctx.moveTo(q.x, q.y);
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = on ? AMBER : "rgba(255,255,255,0.08)";
        ctx.globalAlpha = on ? 0.35 + 0.65 * Math.sin(pt.u * Math.PI) : 1;
        ctx.lineWidth = 1.6;
        ctx.stroke();
        ctx.globalAlpha = 1;
      });
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [visible, vertical, reducedMotion, wrapRef]);

  return (
    <div ref={wrapRef} className="absolute inset-0" aria-hidden>
      <canvas ref={canvasRef} className="block" />
    </div>
  );
}

function Dial() {
  return (
    <svg viewBox="-100 -100 200 200" className="h-full w-full" aria-hidden>
      <circle r="92" fill="#0f0d09" stroke="rgba(216,166,75,0.25)" />
      {Array.from({ length: 24 }, (_, i) => {
        const a = (i / 24) * Math.PI * 2 - Math.PI / 2;
        const long = i % 6 === 0;
        return (
          <line
            key={i}
            x1={Math.cos(a) * (long ? 70 : 78)}
            y1={Math.sin(a) * (long ? 70 : 78)}
            x2={Math.cos(a) * 86}
            y2={Math.sin(a) * 86}
            stroke={long ? AMBER : "rgba(243,241,235,0.35)"}
            strokeWidth={long ? 2 : 1}
          />
        );
      })}
      {[0, 6, 12, 18].map((hr) => {
        const a = (hr / 24) * Math.PI * 2 - Math.PI / 2;
        return (
          <text key={hr} x={Math.cos(a) * 56} y={Math.sin(a) * 56 + 3.5} textAnchor="middle" fontSize="10" fill="rgba(243,241,235,0.6)" fontFamily="var(--font-jetbrains)">
            {String(hr).padStart(2, "0")}
          </text>
        );
      })}
      <g className="origin-center animate-spin-slow [transform-box:fill-box]">
        <circle r="80" fill="none" />
        <line x1="0" y1="0" x2="0" y2="-80" stroke="#f3f1eb" strokeWidth="1.5" />
      </g>
      <circle r="4" fill={AMBER} />
    </svg>
  );
}

export function JobTimes24() {
  const [focus, setFocus] = useState<string | null>(null);
  const vertical = useMediaQuery("(max-width: 767px)");
  const { t, o } = anchors(vertical);

  const node = (label: string, p: Pt, side: "talent" | "opportunity") => (
    <button
      key={label}
      type="button"
      onMouseEnter={() => setFocus(label)}
      onMouseLeave={() => setFocus(null)}
      onFocus={() => setFocus(label)}
      onBlur={() => setFocus(null)}
      onClick={() => setFocus((f) => (f === label ? null : label))}
      aria-pressed={focus === label}
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}
    >
      <span
        className={cn(
          "flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-2 transition-all duration-300 md:gap-3 md:px-4 md:py-2.5",
          focus === label ? "border-[#d8a64b] bg-[#d8a64b] text-ink" : "border-white/15 bg-graphite-900/90 text-paper hover:border-white/40",
          side === "opportunity" && !vertical ? "flex-row-reverse" : "",
        )}
      >
        <span className={cn("h-2 w-2 rounded-full", focus === label ? "bg-ink" : "bg-[#d8a64b]")} />
        <span className="text-[0.78rem] md:text-[1rem]">{label}</span>
      </span>
    </button>
  );

  return (
    <WorldShell world={world} className="bg-graphite-950" coordinates={["Employment", "The employment world", "Live map"]}>
      <div className="gutter relative z-10 grid gap-8 pt-12 lg:grid-cols-12 lg:pt-16">
        <div className="lg:col-span-7">
          <p className="label-sm" style={{ color: AMBER }}>
            JobTimes24
          </p>
          <h2 id="jobtimes24-title" className="display-wide mt-3 text-[clamp(2.4rem,5.6vw,6rem)] text-paper">
            Job<span style={{ color: AMBER }}>Times</span>24
          </h2>
        </div>
        <div className="flex items-end lg:col-span-5">
          <RevealWords
            as="p"
            text="The employment world — a living map of how talent finds its way to opportunity."
            className="editorial text-[clamp(1.3rem,2vw,1.8rem)] italic leading-snug text-mist"
          />
        </div>
      </div>

      <div className="gutter relative z-10 mt-10">
        <div className="relative h-[min(78vh,720px)] overflow-hidden rounded-2xl border border-white/10 bg-[#0c0b09]">
          <div aria-hidden className="absolute inset-0 grid-bg opacity-40" />
          <FlowMap focus={focus} vertical={vertical} />
          <div className="absolute left-1/2 top-1/2 aspect-square w-[min(34%,300px)] -translate-x-1/2 -translate-y-1/2 md:w-[min(26%,300px)]">
            <Dial />
          </div>
          <span className={cn("label-sm absolute text-ash", vertical ? "left-4 top-[3%]" : "left-[4%] top-5")}>Talent</span>
          <span className={cn("label-sm absolute text-ash", vertical ? "bottom-[3%] left-4" : "right-[4%] top-5")}>Opportunity</span>
          {talent.map((l, i) => node(l, t[i], "talent"))}
          {opportunity.map((l, i) => node(l, o[i], "opportunity"))}
        </div>
        <p className="label-sm mt-4 text-ash">
          Flows are illustrative — they show the idea, not platform data. Real numbers appear here only when supplied.
        </p>
      </div>
    </WorldShell>
  );
}

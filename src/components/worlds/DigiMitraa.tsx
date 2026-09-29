"use client";

import { useEffect, useRef } from "react";
import { useTransform } from "framer-motion";
import { worldById } from "@/content/ecosystem";
import { useExperience } from "@/components/providers/Experience";
import { Rise, useMotionNumber, useSectionProgress, useVisible } from "@/components/ui/primitives";
import { clamp, cn, lerp, mulberry32 } from "@/lib/utils";
import { WorldShell } from "./WorldShell";

const world = worldById["digimitraa"];
const COPPER = world.accent;

const stages = [
  { name: "Attention", line: "Everything competes for a second of it." },
  { name: "Identity", line: "A clear shape people recognise." },
  { name: "Reach", line: "The signal travels outward." },
  { name: "Conversion", line: "Interest becomes action." },
  { name: "Growth", line: "Measured, compounding, long-term." },
];

function stageValue(p: number) {
  const t = clamp((p - 0.05) / 0.85) * 4;
  const i = Math.floor(t);
  const f = t - i;
  const e = f < 0.4 ? 0 : (f - 0.4) / 0.6;
  return Math.min(4, i + e * e * (3 - 2 * e));
}

interface Seed {
  a: number;
  b: number;
  c: number;
  d: number;
}

/** Where particle i sits in formation k at time t, in a unit box [-1, 1]. */
function formation(k: number, s: Seed, i: number, n: number, t: number): [number, number] {
  switch (k) {
    case 0: {
      // attention: noise
      const x = (s.a * 2 - 1) * 0.95 + Math.sin(t * 2.3 + s.c * 20) * 0.02;
      const y = (s.b * 2 - 1) * 0.85 + Math.cos(t * 1.9 + s.d * 20) * 0.02;
      return [x, y];
    }
    case 1: {
      // identity: an emblem — outer ring, inner ring, centre
      const ang = (i / n) * Math.PI * 2 * 7 + t * 0.05;
      const r = s.a < 0.62 ? 0.62 : s.a < 0.9 ? 0.26 : 0.04 * s.b;
      return [Math.cos(ang) * r, Math.sin(ang) * r];
    }
    case 2: {
      // reach: ripples moving outward
      const ring = ((s.a + t * 0.12) % 1) * 1.05;
      const ang = s.b * Math.PI * 2;
      return [Math.cos(ang) * ring, Math.sin(ang) * ring * 0.9];
    }
    case 3: {
      // conversion: a funnel that narrows into a stream
      const u = (s.a + t * 0.08) % 1;
      const width = u < 0.6 ? lerp(0.85, 0.08, u / 0.6) : 0.05;
      const x = lerp(-0.95, 0.95, u);
      const y = (s.b * 2 - 1) * width;
      return [x, y];
    }
    default: {
      // growth: a compounding curve, with thickness
      const u = (s.a + t * 0.03) % 1;
      const x = lerp(-0.9, 0.9, u);
      const y = 0.75 - Math.pow(u, 2.4) * 1.55;
      const spread = 0.02 + u * 0.08;
      return [x + (s.c - 0.5) * spread, y + (s.b - 0.5) * spread];
    }
  }
}

function GrowthCanvas({ s }: { s: number }) {
  const { reducedMotion } = useExperience();
  const [wrapRef, visible] = useVisible<HTMLDivElement>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sRef = useRef(s);
  useEffect(() => {
    sRef.current = s;
  }, [s]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap || !visible) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const small = window.innerWidth < 768;
    const n = small ? 520 : 950;
    const rand = mulberry32(21);
    const seeds: Seed[] = Array.from({ length: n }, () => ({ a: rand(), b: rand(), c: rand(), d: rand() }));
    let w = 0;
    let h = 0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
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
    let raf = 0;
    const start = performance.now();
    const draw = (now: number) => {
      const t = reducedMotion ? 0 : (now - start) / 1000;
      const sv = sRef.current;
      const k = Math.min(3, Math.floor(sv));
      const f = sv - k;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const scale = Math.min(w, h) * 0.46;
      const cx = w / 2;
      const cy = h / 2;
      for (let i = 0; i < n; i++) {
        const sd = seeds[i];
        const stagger = clamp(f * 1.4 - sd.d * 0.4);
        const e = stagger * stagger * (3 - 2 * stagger);
        const [ax, ay] = formation(k, sd, i, n, t);
        const [bx, by] = formation(Math.min(4, k + 1), sd, i, n, t);
        const x = cx + lerp(ax, bx, e) * scale * (w > h ? 1.35 : 1);
        const y = cy + lerp(ay, by, e) * scale;
        const flicker = sv < 0.6 ? 0.35 + 0.65 * Math.abs(Math.sin(t * 3 + sd.c * 30)) : 1;
        ctx.globalAlpha = (0.25 + sd.b * 0.75) * flicker;
        ctx.fillStyle = sd.c > 0.82 ? "#f3f1eb" : COPPER;
        const r = 0.7 + sd.c * 1.3;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [visible, reducedMotion, wrapRef]);

  return (
    <div ref={wrapRef} className="absolute inset-0" aria-hidden>
      <canvas ref={canvasRef} className="block" />
    </div>
  );
}

export function DigiMitraa() {
  const ref = useRef<HTMLDivElement>(null);
  const p = useSectionProgress(ref);
  const sv = useTransform(p, stageValue);
  const s = useMotionNumber(sv, 200);
  const current = Math.round(s);

  return (
    <WorldShell world={world} recordLabel="Portfolio" className="bg-[#0a0807]" coordinates={["Digital growth", "Digital growth & branding layer", "Engine"]}>
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_65%_45%,rgba(214,149,116,0.1),transparent_60%)]" />
      <div ref={ref} className="relative h-[330vh]">
        <div className="sticky top-0 h-[100svh] overflow-hidden pt-[var(--hud-h)]">
          <div className="absolute inset-0 top-[var(--hud-h)] md:left-[34%]">
            <GrowthCanvas s={s} />
          </div>
          <div className="gutter relative z-10 flex h-full flex-col justify-between py-8 md:w-[42%] md:justify-center md:gap-10">
            <div>
              <p className="label-sm" style={{ color: COPPER }}>
                DigiMitraa · growth engine
              </p>
              <h2 id="digimitraa-title" className="display-narrow mt-3 text-[clamp(3.4rem,8vw,7.5rem)] text-paper">
                DigiMitraa
              </h2>
            </div>
            <div className="-mx-3 rounded-2xl bg-[#0a0807]/75 p-3 backdrop-blur-[2px] md:mx-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
              <ol className="flex flex-col gap-1" aria-label="The growth sequence">
                {stages.map((st, i) => (
                  <li
                    key={st.name}
                    className={cn(
                      "flex items-baseline gap-4 transition-all duration-500",
                      i === current ? "translate-x-2 text-paper" : i < current ? "text-mist/60" : "text-white/25",
                    )}
                    aria-current={i === current ? "step" : undefined}
                  >
                    <span className="label-sm w-6 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                    <span className="display text-[clamp(1.5rem,3vw,2.6rem)]" style={i === current ? { color: COPPER } : undefined}>
                      {st.name}
                    </span>
                    {i < 4 && <span className="label-sm hidden text-ash md:inline">→</span>}
                  </li>
                ))}
              </ol>
              <p className="editorial mt-6 min-h-[2.4em] max-w-sm text-[clamp(1.15rem,1.7vw,1.5rem)] italic text-mist" aria-live="polite">
                {stages[current].line}
              </p>
            </div>
            <p className="label-sm max-w-xs text-ash">A conceptual model of how growth works — not a performance chart.</p>
          </div>
        </div>
      </div>

      <div className="gutter relative z-10 pt-10">
        <Rise>
          <p className="label-sm text-ash">The instruments</p>
        </Rise>
        <ul className="mt-6 grid grid-cols-2 gap-px border border-white/10 bg-white/10 md:grid-cols-4">
          {world.vocabulary.map((v, i) => (
            <li key={v} className="group relative flex min-h-[8.5rem] flex-col justify-between bg-[#0a0807] p-5 transition-colors hover:bg-[#15100d]">
              <span className="label-sm tabular-nums" style={{ color: COPPER }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-[1.1rem] leading-tight text-paper md:text-[1.25rem]">{v}</span>
            </li>
          ))}
        </ul>
      </div>
    </WorldShell>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { motion, useTransform } from "framer-motion";
import { worldById } from "@/content/ecosystem";
import { useExperience } from "@/components/providers/Experience";
import { OpenSlot, Rise, useMotionNumber, useSectionProgress, useVisible, useRange } from "@/components/ui/primitives";
import { clamp, cn, gaussian, lerp, mulberry32 } from "@/lib/utils";
import { WorldShell } from "./WorldShell";

const world = worldById["ngo-nexus"];
const WARM = world.accent;

const chapters = [
  { word: "People", line: "It always begins with one person." },
  { word: "Communities", line: "People find each other." },
  { word: "NGOs", line: "Organisations give care a structure." },
  { word: "Volunteers", line: "Some people carry help from one place to the next." },
  { word: "Education", line: "Knowledge spreads like light." },
  { word: "Opportunity", line: "And doors begin to open outward." },
  { word: "Social impact", line: "Impact is not a number. It is a changed life." },
];

function stageOf(p: number) {
  return clamp((p - 0.04) / 0.86) * (chapters.length - 1);
}

const CLUSTERS = [
  [0.18, 0.28], [0.42, 0.2], [0.7, 0.24], [0.86, 0.5], [0.66, 0.72], [0.4, 0.78], [0.16, 0.66], [0.52, 0.48], [0.3, 0.47],
];

function NexusCanvas({ stage }: { stage: number }) {
  const { reducedMotion } = useExperience();
  const [wrapRef, visible] = useVisible<HTMLDivElement>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef(stage);
  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);
  const pointer = useRef({ x: -9999, y: -9999 });

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
    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      pointer.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onLeave = () => (pointer.current = { x: -9999, y: -9999 });
    window.addEventListener("pointermove", onMove, { passive: true });
    wrap.addEventListener("pointerleave", onLeave);

    const small = window.innerWidth < 768;
    const n = small ? 260 : 440;
    const rand = mulberry32(77);
    const people = Array.from({ length: n }, (_, i) => {
      const k = i % CLUSTERS.length;
      const other = (k + 1 + Math.floor(rand() * 3)) % CLUSTERS.length;
      return {
        sx: 0.04 + rand() * 0.92,
        sy: 0.06 + rand() * 0.88,
        k,
        ox: gaussian(rand) * 0.045,
        oy: gaussian(rand) * 0.05,
        volunteer: rand() < 0.14,
        other,
        phase: rand(),
        size: 0.8 + rand() * 1.4,
      };
    });
    const bridges: [number, number][] = [];
    for (let k = 0; k < CLUSTERS.length; k++) {
      bridges.push([k, (k + 1) % CLUSTERS.length]);
      if (k % 2 === 0) bridges.push([k, (k + 4) % CLUSTERS.length]);
    }
    const rays = CLUSTERS.map((c, k) => {
      const a = Math.atan2(c[1] - 0.5, c[0] - 0.5) + (k % 2 ? 0.3 : -0.3);
      return [a, a + 0.5];
    });

    let raf = 0;
    const start = performance.now();
    const draw = (now: number) => {
      const t = reducedMotion ? 0 : (now - start) / 1000;
      const s = stageRef.current;
      const gather = clamp(s - 0.3);
      const ngo = clamp(s - 1.5);
      const vol = clamp(s - 2.5);
      const edu = clamp(s - 3.5);
      const opp = clamp(s - 4.5);
      const impact = clamp(s - 5.5);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const P = (x: number, y: number) => [x * w, y * h] as const;
      const px = pointer.current.x;
      const py = pointer.current.y;

      // opportunity rays
      if (opp > 0) {
        CLUSTERS.forEach((c, k) => {
          rays[k].forEach((a) => {
            const [x0, y0] = P(c[0], c[1]);
            const len = Math.max(w, h) * 0.6 * opp;
            const g = ctx.createLinearGradient(x0, y0, x0 + Math.cos(a) * len, y0 + Math.sin(a) * len);
            g.addColorStop(0, `rgba(232,182,140,${0.35 * opp})`);
            g.addColorStop(1, "rgba(232,182,140,0)");
            ctx.strokeStyle = g;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x0 + Math.cos(a) * len, y0 + Math.sin(a) * len);
            ctx.stroke();
          });
        });
      }

      // bridges between communities
      if (vol > 0) {
        ctx.lineWidth = 1;
        bridges.forEach(([a, b]) => {
          const [x0, y0] = P(CLUSTERS[a][0], CLUSTERS[a][1]);
          const [x1, y1] = P(CLUSTERS[b][0], CLUSTERS[b][1]);
          ctx.strokeStyle = `rgba(243,241,235,${0.12 * vol + 0.15 * impact})`;
          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 - 30, x1, y1);
          ctx.stroke();
        });
      }

      for (const pp of people) {
        const c = CLUSTERS[pp.k];
        let tx = lerp(pp.sx, c[0] + pp.ox, gather) + Math.sin(t * 0.4 + pp.phase * 9) * 0.004;
        let ty = lerp(pp.sy, c[1] + pp.oy, gather) + Math.cos(t * 0.35 + pp.phase * 9) * 0.004;
        if (pp.volunteer && vol > 0) {
          const o = CLUSTERS[pp.other];
          const u = (Math.sin(t * 0.35 + pp.phase * 6.28) + 1) / 2;
          tx = lerp(tx, lerp(c[0], o[0], u), vol);
          ty = lerp(ty, lerp(c[1], o[1], u) - Math.sin(u * Math.PI) * 0.04, vol);
        }
        const [x, y] = P(tx, ty);

        // threads to the NGO at the heart of each community
        if (ngo > 0 && !pp.volunteer) {
          const [cx, cy] = P(c[0], c[1]);
          ctx.strokeStyle = `rgba(232,182,140,${0.1 * ngo})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(cx, cy);
          ctx.stroke();
        }

        // the visitor's presence connects nearby people
        const d = Math.hypot(px - x, py - y);
        if (d < 120) {
          ctx.strokeStyle = `rgba(255,236,214,${(1 - d / 120) * 0.45})`;
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(x, y);
          ctx.stroke();
        }

        const [cx, cy] = P(c[0], c[1]);
        const wave = edu > 0 ? clamp(edu * 1.6 - Math.hypot(x - cx, y - cy) / 160) : 0;
        const bright = 0.28 + 0.3 * gather + 0.3 * wave + 0.2 * impact + (d < 120 ? 0.4 * (1 - d / 120) : 0);
        ctx.globalAlpha = Math.min(1, bright);
        ctx.fillStyle = pp.volunteer && vol > 0 ? "#fff4e8" : WARM;
        ctx.beginPath();
        ctx.arc(x, y, pp.size * (pp.volunteer && vol > 0 ? 1.4 : 1), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // NGO hearts
      if (ngo > 0) {
        CLUSTERS.forEach((c) => {
          const [x, y] = P(c[0], c[1]);
          const r = 4 + 3 * ngo + Math.sin(t * 1.2 + x) * 0.8;
          const g = ctx.createRadialGradient(x, y, 0, x, y, r * 6);
          g.addColorStop(0, `rgba(255,236,214,${0.5 * ngo})`);
          g.addColorStop(1, "rgba(255,236,214,0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(x, y, r * 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#fff4e8";
          ctx.beginPath();
          ctx.arc(x, y, r * 0.6, 0, Math.PI * 2);
          ctx.fill();
        });
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
    };
  }, [visible, reducedMotion, wrapRef]);

  return (
    <div ref={wrapRef} className="absolute inset-0" aria-hidden>
      <canvas ref={canvasRef} className="block" />
    </div>
  );
}

export function NgoNexus() {
  const ref = useRef<HTMLDivElement>(null);
  const p = useSectionProgress(ref);
  const sv = useTransform(p, stageOf);
  const stage = useMotionNumber(sv, 200);
  const current = Math.min(chapters.length - 1, Math.round(stage));
  const dawn = useRange(p, [0.1, 0.95], [0, 1]);

  return (
    <WorldShell world={world} className="bg-[#07060a]" coordinates={["Social impact", "The social impact world", "Nexus"]} recordLabel="Initiatives" hideRecord>
      <div ref={ref} className="relative h-[380vh]">
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          <motion.div
            aria-hidden
            className="absolute inset-0"
            style={{
              opacity: dawn,
              background:
                "radial-gradient(120% 70% at 50% 110%, rgba(232,182,140,0.42) 0%, rgba(120,70,48,0.28) 35%, rgba(20,12,14,0) 70%)",
            }}
          />
          <NexusCanvas stage={stage} />
          <div className="gutter pointer-events-none absolute inset-x-0 top-[calc(var(--hud-h)+1.5rem)]">
            <p className="label-sm" style={{ color: WARM }}>
              NGO Nexus
            </p>
            <h2 id="ngo-nexus-title" className="editorial mt-3 max-w-3xl text-[clamp(2.6rem,6vw,5.6rem)] leading-[0.95] text-paper">
              Behind every point, <em className="text-[#e8b68c]">a person.</em>
            </h2>
          </div>
          <div className="gutter pointer-events-none absolute inset-x-0 bottom-0 pb-10 md:pb-14">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="min-h-[7.5rem]" aria-live="polite">
                <motion.p
                  key={chapters[current].word}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="display text-[clamp(2.4rem,6.2vw,6rem)] text-paper"
                >
                  {chapters[current].word}
                </motion.p>
                <motion.p
                  key={`${chapters[current].word}-line`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className="editorial mt-2 text-[clamp(1.2rem,1.9vw,1.7rem)] italic text-platinum"
                >
                  {chapters[current].line}
                </motion.p>
              </div>
              <ol className="flex gap-1.5" aria-label="Chapters">
                {chapters.map((c, i) => (
                  <li key={c.word} className="flex flex-col items-center gap-2">
                    <span className={cn("h-8 w-px transition-colors", i <= current ? "bg-[#e8b68c]" : "bg-white/15")} />
                    <span className="sr-only">{c.word}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>

      <div className="gutter relative z-10 pb-24 pt-10 md:pb-32">
        <div className="grid gap-10 lg:grid-cols-12">
          <Rise className="lg:col-span-5">
            <p className="label-sm text-ash">Initiatives</p>
            <p className="editorial mt-4 text-[clamp(1.6rem,2.6vw,2.4rem)] leading-tight text-paper">
              Each initiative will be told here as its own story — with its people, its place and its outcome — once it is verified.
            </p>
            <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-mist">{world.summary}</p>
          </Rise>
          <div className="grid gap-3 sm:grid-cols-3 lg:col-span-7">
            {world.records.length > 0
              ? world.records.map((r) => (
                  <div key={r.title} className="rounded-xl border border-white/10 p-5">
                    <p className="text-paper">{r.title}</p>
                    {r.detail && <p className="mt-2 text-sm text-mist">{r.detail}</p>}
                  </div>
                ))
              : ["Initiative", "Community", "Story"].map((l) => (
                  <OpenSlot key={l} label={l} note="Awaiting verified record" className="min-h-[11rem] rounded-xl" />
                ))}
          </div>
        </div>
      </div>
    </WorldShell>
  );
}

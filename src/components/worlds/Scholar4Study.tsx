"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { worldById } from "@/content/ecosystem";
import { useExperience } from "@/components/providers/Experience";
import { Rise, useVisible } from "@/components/ui/primitives";
import { cn, mulberry32 } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/useClient";
import { WorldShell } from "./WorldShell";

const world = worldById["scholar4study"];
const INK = "#121317";
const COBALT = "#2f49c8";

const columns = [
  { key: "student", label: "Students", count: 4 },
  { key: "knowledge", label: "Knowledge", count: 8 },
  { key: "scholarship", label: "Scholarships", count: 9 },
  { key: "college", label: "Colleges", count: 8 },
  { key: "career", label: "Careers", count: 7 },
] as const;

const notes = [
  { n: "1", title: "Student pathways", body: "No two routes through education are the same." },
  { n: "2", title: "Scholarship nodes", body: "Funding that opens a door that was closed." },
  { n: "3", title: "College discovery", body: "Finding the right place to keep learning." },
  { n: "4", title: "Career pathways", body: "Where the learning eventually leads." },
];

interface GNode {
  id: string;
  col: number;
  row: number;
  x: number;
  y: number;
}

function useGraph(vertical: boolean) {
  return useMemo(() => {
    const rand = mulberry32(404);
    const W = vertical ? 360 : 1200;
    const H = vertical ? 900 : 520;
    const nodes: GNode[] = [];
    columns.forEach((c, ci) => {
      for (let r = 0; r < c.count; r++) {
        const main = 60 + (ci / (columns.length - 1)) * ((vertical ? H : W) - 120);
        const cross = ((r + 0.5) / c.count) * ((vertical ? W : H) - 80) + 40 + (rand() - 0.5) * 18;
        nodes.push({ id: `${ci}-${r}`, col: ci, row: r, x: vertical ? cross : main, y: vertical ? main : cross });
      }
    });
    const edges: [string, string][] = [];
    for (let ci = 0; ci < columns.length - 1; ci++) {
      const from = nodes.filter((n) => n.col === ci);
      const to = nodes.filter((n) => n.col === ci + 1);
      from.forEach((f) => {
        const k = 2 + Math.floor(rand() * 2);
        const picks = new Set<number>();
        const centre = Math.round((f.row / Math.max(1, from.length - 1)) * (to.length - 1));
        while (picks.size < Math.min(k, to.length)) {
          const j = Math.max(0, Math.min(to.length - 1, centre + Math.round((rand() - 0.5) * 4)));
          picks.add(j);
        }
        picks.forEach((j) => edges.push([f.id, to[j].id]));
      });
      // make sure every node downstream is reachable
      to.forEach((t) => {
        if (!edges.some((e) => e[1] === t.id)) edges.push([from[Math.floor(rand() * from.length)].id, t.id]);
      });
    }
    return { nodes, edges, W, H };
  }, [vertical]);
}

function curve(a: GNode, b: GNode, vertical: boolean) {
  if (vertical) {
    const my = (a.y + b.y) / 2;
    return `M${a.x} ${a.y} C${a.x} ${my} ${b.x} ${my} ${b.x} ${b.y}`;
  }
  const mx = (a.x + b.x) / 2;
  return `M${a.x} ${a.y} C${mx} ${a.y} ${mx} ${b.y} ${b.x} ${b.y}`;
}

function Shape({ col, x, y, on }: { col: number; x: number; y: number; on: boolean }) {
  const fill = on ? COBALT : "#f3f1eb";
  const stroke = on ? COBALT : INK;
  switch (col) {
    case 0:
      return <circle cx={x} cy={y} r={on ? 9 : 7} fill={on ? COBALT : INK} />;
    case 1:
      return <circle cx={x} cy={y} r={5} fill={fill} stroke={stroke} strokeWidth={1.2} />;
    case 2:
      return <rect x={x - 5.5} y={y - 5.5} width={11} height={11} transform={`rotate(45 ${x} ${y})`} fill={fill} stroke={stroke} strokeWidth={1.2} />;
    case 3:
      return <rect x={x - 5.5} y={y - 5.5} width={11} height={11} fill={fill} stroke={stroke} strokeWidth={1.2} />;
    default:
      return <path d={`M${x - 6} ${y + 5} L${x + 6} ${y + 5} L${x} ${y - 6} Z`} fill={fill} stroke={stroke} strokeWidth={1.2} />;
  }
}

function KnowledgeGraph() {
  const { reducedMotion } = useExperience();
  const [wrapRef, visible] = useVisible<HTMLDivElement>();
  const vertical = useMediaQuery("(max-width: 767px)");
  const { nodes, edges, W, H } = useGraph(vertical);
  const byId = useMemo(() => Object.fromEntries(nodes.map((n) => [n.id, n])), [nodes]);
  const [hover, setHover] = useState<string | null>(null);
  const [seed, setSeed] = useState(1);

  // One student's route through every column, chosen deterministically from the seed.
  const path = useMemo(() => {
    const r = mulberry32(seed);
    const starts = nodes.filter((n) => n.col === 0);
    let cur = starts[Math.floor(r() * starts.length)];
    const ids = [cur.id];
    for (let c = 1; c < columns.length; c++) {
      const next = edges.filter((e) => e[0] === cur.id).map((e) => byId[e[1]]);
      cur = next[Math.floor(r() * next.length)];
      ids.push(cur.id);
    }
    return ids;
  }, [seed, nodes, edges, byId]);
  useEffect(() => {
    if (!visible || hover || reducedMotion) return;
    const t = setInterval(() => setSeed((s) => s + 1), 3800);
    return () => clearInterval(t);
  }, [visible, hover, reducedMotion]);

  // Everything reachable through the hovered node (upstream and downstream).
  const lit = useMemo(() => {
    if (!hover) return null;
    const set = new Set([hover]);
    const walk = (id: string, dir: 0 | 1) => {
      edges.forEach((e) => {
        if (e[dir] === id && !set.has(e[1 - dir])) {
          set.add(e[1 - dir]);
          walk(e[1 - dir], dir);
        }
      });
    };
    walk(hover, 0);
    walk(hover, 1);
    return set;
  }, [hover, edges]);

  const pathEdges = useMemo(() => new Set(path.slice(1).map((id, i) => `${path[i]}>${id}`)), [path]);

  return (
    <div ref={wrapRef}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <ol className={cn("grid w-full gap-2", vertical ? "grid-cols-5" : "grid-cols-5")} aria-label="Graph columns">
          {columns.map((c, i) => (
            <li key={c.key} className="label-sm flex items-center gap-2 text-ink/60">
              <span className="tabular-nums text-ink">{String(i + 1).padStart(2, "0")}</span> {c.label}
            </li>
          ))}
        </ol>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 h-auto w-full" role="img" aria-label="An illustrative knowledge graph: students connect through knowledge to scholarships, colleges and careers.">
        {edges.map(([a, b]) => {
          const on = pathEdges.has(`${a}>${b}`);
          const hot = lit ? lit.has(a) && lit.has(b) : false;
          return (
            <path
              key={`${a}>${b}`}
              d={curve(byId[a], byId[b], vertical)}
              fill="none"
              stroke={hot ? COBALT : INK}
              strokeOpacity={hot ? 0.7 : lit ? 0.05 : on ? 0 : 0.14}
              strokeWidth={hot ? 1.4 : 1}
            />
          );
        })}
        {!lit &&
          path.slice(1).map((id, i) => (
            <motion.path
              key={`${path[i]}>${id}-${seed}`}
              d={curve(byId[path[i]], byId[id], vertical)}
              fill="none"
              stroke={COBALT}
              strokeWidth={2.2}
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: reducedMotion ? 0 : 0.55, delay: reducedMotion ? 0 : i * 0.45, ease: [0.65, 0, 0.35, 1] }}
            />
          ))}
        {nodes.map((n) => {
          const on = lit ? lit.has(n.id) : path.includes(n.id);
          return (
            <g
              key={n.id}
              onMouseEnter={() => setHover(n.id)}
              onMouseLeave={() => setHover(null)}
              className="cursor-pointer"
              opacity={lit && !lit.has(n.id) ? 0.25 : 1}
            >
              <circle cx={n.x} cy={n.y} r={16} fill="transparent" />
              <Shape col={n.col} x={n.x} y={n.y} on={on} />
            </g>
          );
        })}
      </svg>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setSeed((s) => s + 1)}
          className="label-sm rounded-full border border-ink/30 px-4 py-2.5 text-ink transition-colors hover:bg-ink hover:text-paper"
        >
          Trace another pathway →
        </button>
        <p className="label-sm text-ink/50">Illustrative model · hover any node to see every route through it</p>
      </div>
    </div>
  );
}

export function Scholar4Study() {
  return (
    <WorldShell
      world={world}
      tone="light"
      className="bg-paper text-ink"
      coordinates={["Education", "The education world", "Atlas edition"]}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.5] [background-image:linear-gradient(rgba(18,19,23,0.05)_1px,transparent_1px)] [background-size:100%_32px]" />
      <div className="gutter relative z-10 pt-14 md:pt-20">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <p className="label-sm text-ink/60">Scholar4Study</p>
            <h2 id="scholar4study-title" className="editorial mt-4 text-[clamp(3.4rem,9vw,9.5rem)] leading-[0.9] text-ink">
              Knowledge,
              <br />
              <em className="text-[#2f49c8]">mapped.</em>
            </h2>
          </div>
          <div className="flex flex-col justify-end lg:col-span-4">
            <Rise>
              <p className="editorial text-[1.35rem] leading-snug text-ink/80">
                The education world, drawn as infrastructure: how a student can move through knowledge, scholarships, college discovery and
                career pathways.
              </p>
            </Rise>
          </div>
        </div>

        <div className="mt-14 border-y border-ink/15 py-8 md:mt-20 md:py-12">
          <KnowledgeGraph />
        </div>

        <ol className="grid gap-px border-b border-ink/15 bg-ink/15 sm:grid-cols-2 lg:grid-cols-4">
          {notes.map((n, i) => (
            <li key={n.n} className="bg-paper p-6">
              <Rise delay={i * 0.08}>
                <span className="editorial text-[2.6rem] italic text-[#2f49c8]">{n.n}</span>
                <p className="label mt-2 text-ink">{n.title}</p>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-ink/70">{n.body}</p>
              </Rise>
            </li>
          ))}
        </ol>
      </div>
    </WorldShell>
  );
}

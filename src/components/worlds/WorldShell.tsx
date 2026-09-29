"use client";

import type { World } from "@/content/ecosystem";
import { domainLabel } from "@/content/ecosystem";
import { sectionById } from "@/content/sections";
import { Coordinates, ExternalLink, OpenSlot } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

type Tone = "dark" | "light";

/**
 * The thin layer of Founder OS chrome around every world: where you are,
 * and — at the end — the verified record of that world.
 * Everything in between is the world's own environment.
 */
export function WorldShell({
  world,
  sectionId,
  tone = "dark",
  className,
  style,
  children,
  recordLabel = "Projects",
  hideRecord = false,
  coordinates,
}: {
  world: World;
  sectionId?: string;
  tone?: Tone;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  recordLabel?: string;
  hideRecord?: boolean;
  coordinates?: string[];
}) {
  const id = sectionId ?? world.id;
  const section = sectionById[id];
  return (
    <section
      id={id}
      data-hud
      aria-labelledby={`${id}-title`}
      className={cn("relative w-full", className)}
      style={{ ["--accent" as string]: world.accent, ...style }}
    >
      <div className="gutter relative z-10 pt-[calc(var(--hud-h)+2.5rem)]">
        <Coordinates
          code={`${section?.code ?? "--"} / World`}
          items={coordinates ?? [domainLabel(world.domain), world.layer]}
          tone={tone}
        />
      </div>
      {children}
      {!hideRecord && <WorldRecord world={world} tone={tone} recordLabel={recordLabel} />}
    </section>
  );
}

export function WorldRecord({
  world,
  tone = "dark",
  recordLabel = "Projects",
  className,
}: {
  world: World;
  tone?: Tone;
  recordLabel?: string;
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <div className={cn("gutter relative z-10 pb-24 pt-16 md:pb-32", className)}>
      <div
        className={cn(
          "grid gap-px border md:grid-cols-[1.2fr_1fr_0.8fr]",
          dark ? "border-white/10 bg-white/10" : "border-ink/15 bg-ink/15",
        )}
      >
        <div className={cn("flex flex-col gap-4 p-6 md:p-8", dark ? "bg-obsidian" : "bg-paper")}>
          <span className={cn("label-sm", dark ? "text-ash" : "text-ink/55")}>Verified record · {world.name}</span>
          <p className={cn("max-w-md text-[0.98rem] leading-relaxed", dark ? "text-mist" : "text-ink/80")}>{world.summary}</p>
        </div>
        <div className={cn("flex flex-col gap-4 p-6 md:p-8", dark ? "bg-obsidian" : "bg-paper")}>
          <span className={cn("label-sm", dark ? "text-ash" : "text-ink/55")}>{recordLabel}</span>
          {world.records.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {world.records.map((r) => (
                <li key={r.title} className="flex flex-col gap-1">
                  {r.href ? <ExternalLink href={r.href}>{r.title}</ExternalLink> : <span className="label">{r.title}</span>}
                  {r.detail && <span className={cn("text-sm", dark ? "text-mist" : "text-ink/70")}>{r.detail}</span>}
                </li>
              ))}
            </ul>
          ) : (
            <OpenSlot
              label={`${recordLabel} · 0 published`}
              note="Open slot — published when verified"
              tone={tone}
              compact
            />
          )}
        </div>
        <div className={cn("flex flex-col justify-between gap-4 p-6 md:p-8", dark ? "bg-obsidian" : "bg-paper")}>
          <span className={cn("label-sm", dark ? "text-ash" : "text-ink/55")}>Portal</span>
          {world.url ? (
            <ExternalLink href={world.url} className={dark ? "text-paper" : "text-ink"}>
              {world.url.replace(/^https?:\/\//, "")}
            </ExternalLink>
          ) : (
            <span className={cn("label-sm", dark ? "text-ash" : "text-ink/50")}>Official link · awaiting</span>
          )}
        </div>
      </div>
    </div>
  );
}

import { person, worlds } from "@/content/ecosystem";

/** The protocol that governs every page of this universe. */
export function Footer({ built }: { built: string }) {
  const year = built.slice(0, 4);
  return (
    <footer className="gutter relative border-t border-white/10 bg-obsidian pb-10 pt-12">
      <div className="grid gap-10 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="label-sm text-paper">Verified-only protocol</p>
          <p className="mt-3 max-w-md text-[0.9rem] leading-relaxed text-mist">
            Every fact in this universe comes from {person.name}. Open slots are intentional: no achievement, statistic, testimonial or
            impact figure is estimated, invented or implied. Illustrations are labelled as illustrations.
          </p>
        </div>
        <div className="md:col-span-4">
          <p className="label-sm text-paper">Worlds</p>
          <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-[0.85rem] text-mist">
            {worlds.map((w) => (
              <li key={w.id}>
                <a href={`#${w.domain === "social-impact" && w.id !== "ngo-nexus" ? "foundations" : w.id}`} className="transition-colors hover:text-paper">
                  {w.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col justify-between gap-6 md:col-span-3 md:items-end md:text-right">
          <p className="label-sm text-ash">
            Press <kbd className="rounded border border-white/15 px-1.5 py-0.5 text-mist">/</kbd> anywhere to navigate
          </p>
          <p className="label-sm text-ash">
            © {year} {person.name} · Last built {built}
          </p>
        </div>
      </div>
    </footer>
  );
}

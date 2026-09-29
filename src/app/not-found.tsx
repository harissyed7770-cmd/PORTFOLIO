import Link from "next/link";

export default function NotFound() {
  return (
    <main className="gutter flex min-h-[100svh] flex-col items-start justify-center bg-obsidian">
      <p className="label-sm text-ash">404 · coordinates not found</p>
      <h1 className="editorial mt-6 max-w-3xl text-[clamp(2.8rem,7vw,6rem)] italic leading-[0.95] text-paper">
        This world doesn&apos;t exist yet.
      </h1>
      <Link href="/" className="label mt-10 border-b border-paper pb-1 text-paper">
        Return to the ecosystem →
      </Link>
    </main>
  );
}

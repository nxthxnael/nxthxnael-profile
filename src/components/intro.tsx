import Link from "next/link";

export function Intro() {
  return (
    <section className="border-t border-border px-6 py-20">
      <div className="mx-auto flex max-w-3xl flex-col items-start gap-4">
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
          A bit about me
        </h2>
        <p className="text-sm text-muted-foreground sm:text-base">
          I move between writing code, designing interfaces, and building
          businesses — usually all on the same project. That range means I
          can take something from a rough idea to a shipped product without
          losing the thread between them.
        </p>
        <Link
          href="/about"
          className="text-sm font-medium text-accent transition-opacity hover:opacity-80"
        >
          More about me →
        </Link>
      </div>
    </section>
  );
}

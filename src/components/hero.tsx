import Link from "next/link";

const roles = ["Developer", "Designer", "Entrepreneur"];

export function Hero() {
  return (
    <section className="relative flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center overflow-hidden bg-grid bg-glow px-6 py-16">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
        <span className="motion-safe:animate-fade-up rounded-full border border-border bg-card px-4 py-1 text-xs font-medium text-muted-foreground">
          Hi, I&apos;m nxthxnael
        </span>

        <h1 className="motion-safe:animate-fade-up motion-safe:[animation-delay:80ms] text-glow-gradient text-4xl font-semibold tracking-tight sm:text-6xl">
          I build products, design experiences,
          <br className="hidden sm:block" /> and ship businesses.
        </h1>

        <p className="motion-safe:animate-fade-up motion-safe:[animation-delay:160ms] max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
          {roles.join(" · ")} — I take ideas from a blank canvas to something
          people actually use.
        </p>

        <div className="motion-safe:animate-fade-up motion-safe:[animation-delay:240ms] mt-2 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/work"
            className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
          >
            View my work
          </Link>
          <Link
            href="/contact"
            className="rounded-full border border-border px-6 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            Get in touch
          </Link>
          <Link
            href="/support"
            className="rounded-full border border-border px-6 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            Support me
          </Link>
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";

export function CtaBand() {
  return (
    <section className="relative overflow-hidden border-t border-border bg-grid px-6 py-20">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Have a project in mind?
        </h2>
        <p className="max-w-md text-sm text-muted-foreground sm:text-base">
          Whether it&apos;s a productized service, a one-off build, or just an
          idea worth talking through — I&apos;d like to hear about it.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/services"
            className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
          >
            See services
          </Link>
          <Link
            href="/contact"
            className="rounded-full border border-border px-6 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            Contact me
          </Link>
        </div>
      </div>
    </section>
  );
}

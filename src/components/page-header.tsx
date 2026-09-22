type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <section className="border-b border-border bg-grid px-6 py-16 sm:py-20">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 text-center">
        {eyebrow ? (
          <span className="rounded-full border border-border bg-card px-4 py-1 text-xs font-medium text-muted-foreground">
            {eyebrow}
          </span>
        ) : null}
        <h1 className="text-glow-gradient text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
    </section>
  );
}

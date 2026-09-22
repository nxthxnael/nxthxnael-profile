export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center gap-4 overflow-hidden bg-grid bg-glow px-6 py-32 text-center">
      <p className="text-sm font-medium text-muted-foreground">
        Home — hero coming next
      </p>
      <h1 className="text-glow-gradient text-4xl font-semibold tracking-tight sm:text-5xl">
        nxthxnael
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Developer · Designer · Entrepreneur
      </p>
      <div className="mt-4 rounded-xl border border-border bg-card px-4 py-3 text-xs text-card-foreground">
        Design tokens + theme toggle preview
      </div>
    </div>
  );
}

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 px-6 text-center">
      <h1 className="text-2xl font-semibold">You&apos;re offline</h1>
      <p className="text-sm opacity-70">
        Check your connection and try again — this page was served from the cache.
      </p>
    </main>
  );
}

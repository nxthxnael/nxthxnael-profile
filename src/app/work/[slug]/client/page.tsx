import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/content/projects";
import { createClient, isSupabaseConfigured } from "@/lib/supabase";
import { requestLink, signOut } from "./actions";

export const metadata: Metadata = {
  title: "Client area",
  robots: { index: false },
};

const messages: Record<string, string> = {
  invalid_email: "Please enter a valid email address.",
  rate_limited: "Too many attempts. Please wait a few minutes and try again.",
  unavailable: "Sign-in isn't available right now. Please try again later.",
  link_expired: "That sign-in link has expired or was already used. Request a new one.",
};

type Resource = {
  id: string;
  label: string;
  kind: "link" | "file";
  url: string | null;
  storage_path: string | null;
};

export default async function ClientAreaPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { slug } = await params;
  const { sent, error } = await searchParams;
  const project = getProjectBySlug(slug);
  if (!project?.clientArea) notFound();

  return (
    <section className="flex flex-1 justify-center px-6 py-24">
      <div className="flex w-full max-w-md flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Link
            href={`/work/${slug}`}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← {project.title}
          </Link>
          <h1 className="text-glow-gradient text-3xl font-semibold tracking-tight">
            Client area
          </h1>
        </div>
        {isSupabaseConfigured ? (
          <ClientArea slug={slug} sent={sent === "1"} error={error} />
        ) : (
          <p className="text-sm text-muted-foreground">
            The client area isn&apos;t set up yet.
          </p>
        )}
      </div>
    </section>
  );
}

async function ClientArea({
  slug,
  sent,
  error,
}: {
  slug: string;
  sent: boolean;
  error?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <form action={requestLink.bind(null, slug)} className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          Enter the email you work with me from, and I&apos;ll send you a
          sign-in link.
        </p>
        {sent ? (
          <p role="status" className="rounded-lg border border-border bg-card p-3 text-sm">
            If this email has access, a sign-in link is on its way. Open the
            most recent one in this browser.
          </p>
        ) : null}
        {error && messages[error] ? (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {messages[error]}
          </p>
        ) : null}
        <input
          type="email"
          name="email"
          required
          aria-label="Email address"
          placeholder="you@example.com"
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
        >
          Email me a sign-in link
        </button>
      </form>
    );
  }

  // Row level security returns only the resources this user may see.
  const { data, error: loadError } = await supabase
    .from("project_resources")
    .select("id, label, kind, url, storage_path")
    .eq("project_slug", slug)
    .order("sort")
    .order("created_at");
  if (loadError) {
    console.error("Client resources failed to load", { slug, error: loadError });
    return (
      <p role="alert" className="text-sm text-red-600 dark:text-red-400">
        {messages.unavailable}
      </p>
    );
  }
  const resources = await Promise.all(
    ((data ?? []) as Resource[]).map(async (resource) => {
      if (resource.kind === "link") return { ...resource, href: resource.url };
      const { data: signed } = await supabase.storage
        .from("client-files")
        .createSignedUrl(resource.storage_path!, 300);
      return { ...resource, href: signed?.signedUrl ?? null };
    }),
  );

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">Signed in as {user.email}.</p>
      {resources.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          There&apos;s nothing here for this account. If you think that&apos;s
          wrong, get in touch.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {resources.map((resource) => (
            <li
              key={resource.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm"
            >
              <span>{resource.label}</span>
              {resource.href ? (
                <a
                  href={resource.href}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 text-accent hover:underline"
                >
                  {resource.kind === "file" ? "Download" : "Open"} →
                </a>
              ) : (
                <span className="shrink-0 text-muted-foreground">Unavailable</span>
              )}
            </li>
          ))}
        </ul>
      )}
      <form action={signOut.bind(null, slug)}>
        <button
          type="submit"
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}

import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/content/projects";
import { isAuthOutage, isSessionExpired, SESSION_EXPIRED_HEADER } from "@/lib/session";
import { createClient, isSupabaseConfigured } from "@/lib/supabase";
import { requestLink, signOut } from "./actions";
import { SubmitButton } from "./submit-button";

export const metadata: Metadata = {
  title: "Client area",
  robots: { index: false },
};

const messages: Record<string, string> = {
  invalid_email: "Enter a valid email address.",
  rate_limited: "Too many attempts. Wait a few minutes, then try again.",
  unavailable: "Sign-in is unavailable right now. Try again shortly.",
  link_expired: "That link expired or was already used. Request a new one.",
  sign_out_failed: "Signing out didn't finish. Try again in a moment.",
  file_unavailable: "That file couldn't be opened. Refresh and try again.",
};

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40";

type Resource = {
  id: string;
  label: string;
  kind: "link" | "file";
  url: string; // links always have one (a database check); files use the file route
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
    <section className="relative flex min-h-[calc(100dvh-4rem)] items-start justify-center overflow-hidden bg-grid bg-glow px-4 py-16 sm:items-center sm:px-6 sm:py-24">
      <div className="flex w-full max-w-md flex-col gap-6 motion-safe:animate-fade-up">
        <Link
          href={`/work/${slug}`}
          className={`self-start rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground ${focusRing}`}
        >
          ← {project.title}
        </Link>

        <div className="rounded-2xl border border-border bg-card/80 p-6 shadow-sm backdrop-blur sm:p-8">
          <header className="mb-6 flex flex-col items-start gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <LockIcon className="h-3 w-3" />
              Client area
            </span>
            <h1 className="text-glow-gradient text-3xl font-semibold tracking-tight sm:text-4xl">
              {project.title}
            </h1>
          </header>

          {isSupabaseConfigured ? (
            <ClientArea slug={slug} sent={sent === "1"} error={error} />
          ) : (
            <p className="text-sm text-muted-foreground">
              The client area isn&apos;t set up yet.
            </p>
          )}
        </div>
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
  // getUser asks the auth server, so a revoked session or deleted user is refused
  // at once; the verified claims then give this session's own sign-in time.
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  // No session is a normal 4xx answer; only a service failure is an outage.
  if (isAuthOutage(userError)) {
    console.error("Client sign-in check failed", { slug, error: userError });
    return <Notice tone="alert">{messages.unavailable}</Notice>;
  }
  const claims = user ? (await supabase.auth.getClaims()).data?.claims : undefined;

  // The proxy signs expired sessions out and says so in a header; the claims
  // check covers a request it didn't see.
  const expired =
    (await headers()).get(SESSION_EXPIRED_HEADER) === "1" ||
    Boolean(claims && isSessionExpired(claims.amr));

  if (!claims && sent) {
    return (
      <div role="status" className="flex flex-col items-start gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/10 text-accent">
          <MailIcon className="h-5 w-5" />
        </span>
        <h2 className="text-lg font-semibold tracking-tight">Check your email</h2>
        <p className="text-sm text-muted-foreground">
          If this address has access, a sign-in link is on its way. It works
          once, for 15 minutes; open it in this browser.
        </p>
        <Link
          href={`/work/${slug}/client`}
          className={`mt-1 rounded-md text-sm font-medium text-accent hover:underline ${focusRing}`}
        >
          Use a different email
        </Link>
      </div>
    );
  }

  if (!claims || expired) {
    // Only a bad address belongs to the field; other errors are about the attempt.
    const fieldError = error === "invalid_email" ? messages.invalid_email : null;
    const formError = !fieldError && error ? messages[error] : null;

    return (
      <form action={requestLink.bind(null, slug)} className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          I&apos;ll email you a sign-in link.
        </p>
        {expired ? (
          <Notice tone="info">
            Your session ended after 12 hours. Request a new link.
          </Notice>
        ) : null}
        {formError ? <Notice tone="alert">{formError}</Notice> : null}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            required
            autoComplete="email"
            inputMode="email"
            spellCheck={false}
            placeholder="you@company.com"
            aria-invalid={fieldError ? true : undefined}
            aria-describedby={fieldError ? "email-error" : undefined}
            className={`h-11 rounded-xl border bg-background px-3.5 text-sm transition-colors placeholder:text-muted-foreground/70 focus:border-accent ${focusRing} ${
              fieldError ? "border-red-500/60" : "border-border"
            }`}
          />
          {fieldError ? (
            <p id="email-error" className="text-xs text-red-600 dark:text-red-400">
              {fieldError}
            </p>
          ) : null}
        </div>

        <SubmitButton>Email me a sign-in link</SubmitButton>
      </form>
    );
  }

  // Row level security returns only the resources this user may see.
  const { data, error: loadError } = await supabase
    .from("project_resources")
    .select("id, label, kind, url")
    .eq("project_slug", slug)
    .order("sort")
    .order("created_at")
    .order("id");
  if (loadError) {
    console.error("Client resources failed to load", { slug, error: loadError });
    return <Notice tone="alert">{messages.unavailable}</Notice>;
  }
  // Files are signed when clicked (files/[id]/route.ts), so links never go stale.
  const resources = ((data ?? []) as Resource[]).map((resource) => ({
    ...resource,
    href:
      resource.kind === "link" ? resource.url : `/work/${slug}/client/files/${resource.id}`,
  }));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="min-w-0 truncate text-muted-foreground">{user?.email}</span>
        <form action={signOut.bind(null, slug)} className="shrink-0">
          <button
            type="submit"
            className={`rounded-md font-medium text-muted-foreground transition-colors hover:text-foreground ${focusRing}`}
          >
            Sign out
          </button>
        </form>
      </div>

      {error && messages[error] ? <Notice tone="alert">{messages[error]}</Notice> : null}

      {resources.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border px-6 py-10 text-center">
          <FolderIcon className="h-6 w-6 text-muted-foreground" />
          <p className="font-medium">Nothing here yet</p>
          <p className="text-sm text-muted-foreground">
            Files and links for this project will appear here. Questions?{" "}
            <Link href="/contact" className={`rounded-sm text-accent hover:underline ${focusRing}`}>
              Get in touch
            </Link>
            .
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-background/60">
          {resources.map((resource) => (
            <li key={resource.id}>
              <a
                href={resource.href}
                target="_blank"
                rel="noreferrer"
                className={`group flex min-h-14 items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted focus-visible:bg-muted ${focusRing} focus-visible:ring-inset`}
              >
                <ResourceIcon kind={resource.kind} />
                <span className="min-w-0 flex-1 truncate font-medium">{resource.label}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {resource.kind === "file" ? "Download" : "Open"}
                </span>
                <ChevronIcon className="h-4 w-4 shrink-0 text-muted-foreground transition-transform motion-safe:group-hover:translate-x-0.5" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Notice({ tone, children }: { tone: "info" | "alert"; children: React.ReactNode }) {
  return (
    <p
      role={tone === "alert" ? "alert" : "status"}
      className={`flex items-start gap-2 rounded-xl border px-3.5 py-3 text-sm ${
        tone === "alert"
          ? "border-red-500/30 bg-red-500/5 text-red-700 dark:text-red-300"
          : "border-border bg-muted text-foreground"
      }`}
    >
      <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

function ResourceIcon({ kind }: { kind: Resource["kind"] }) {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
      {kind === "file" ? <FileIcon className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
    </span>
  );
}

type IconProps = { className?: string };

function Icon({ className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

const LockIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </Icon>
);
const MailIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </Icon>
);
const FileIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5" />
  </Icon>
);
const LinkIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1" />
    <path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" />
  </Icon>
);
const FolderIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </Icon>
);
const ChevronIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m9 6 6 6-6 6" />
  </Icon>
);
const InfoIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8h.01" />
  </Icon>
);

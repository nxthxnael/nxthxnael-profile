"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getProjectBySlug } from "@/content/projects";
import { checkSignInRateLimit, getClientIp } from "@/lib/rate-limit";
import { siteUrl } from "@/lib/site";
import { createAdminClient, createClient, isSupabaseConfigured } from "@/lib/supabase";

// Every answer after the membership check takes at least this long, so a member
// (whose link is emailed) and a stranger (no email) cannot be told apart by timing.
const MIN_RESPONSE_MS = 2000;

// What Supabase answers a sent sign-in link with, minus the email.
const answerLocally: typeof fetch = async () => Response.json({});

/** Emails a sign-in link, but only to addresses listed for this project. */
export async function requestLink(slug: string, formData: FormData) {
  const page = `/work/${slug}/client`;
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!getProjectBySlug(slug)?.clientArea) redirect("/work");
  const site = siteUrl();
  if (!isSupabaseConfigured || !site) redirect(`${page}?error=unavailable`);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    redirect(`${page}?error=invalid_email`);
  }

  const requestHeaders = await headers();
  const limit = await checkSignInRateLimit(getClientIp(requestHeaders), email);
  if (limit === "limited") redirect(`${page}?error=rate_limited`);
  if (limit === "unavailable") redirect(`${page}?error=unavailable`);

  const started = Date.now();
  const { data: isMember, error } = await createAdminClient().rpc(
    "can_access_project",
    { project: slug, address: email },
  );
  if (error) {
    console.error("Client access check failed", { slug, error });
    redirect(`${page}?error=unavailable`);
  }

  // Strangers run the same sign-in against a stub that answers locally: they get
  // the same PKCE verifier cookie a member does, but nothing reaches Supabase.
  const supabase = await createClient(isMember ? undefined : answerLocally);
  const { error: sendError } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${site}/auth/callback?next=${encodeURIComponent(page)}`,
    },
  });
  if (sendError) console.error("Sign-in email failed", { slug, error: sendError });

  // The same answer, after the same minimum wait, whether or not a link was sent.
  await new Promise((resolve) =>
    setTimeout(resolve, Math.max(0, MIN_RESPONSE_MS - (Date.now() - started))),
  );
  redirect(`${page}?sent=1`);
}

export async function signOut(slug: string) {
  // Supabase keeps the session cookies when sign-out itself fails, so say so.
  const { error } = await (await createClient()).auth.signOut({ scope: "local" });
  if (error) {
    console.error("Client sign-out failed", { slug, error });
    redirect(`/work/${slug}/client?error=sign_out_failed`);
  }
  redirect(`/work/${slug}/client`);
}

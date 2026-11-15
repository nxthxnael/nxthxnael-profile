"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getProjectBySlug } from "@/content/projects";
import { checkSignInRateLimit, getClientIp } from "@/lib/rate-limit";
import { siteUrl } from "@/lib/site";
import { createAdminClient, createClient } from "@/lib/supabase";

// Every answer after the membership check takes at least this long, so a member
// (whose link is emailed) and a stranger (no email) cannot be told apart by timing.
const MIN_RESPONSE_MS = 2000;

/** Emails a sign-in link, but only to addresses listed for this project. */
export async function requestLink(slug: string, formData: FormData) {
  const page = `/work/${slug}/client`;
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!getProjectBySlug(slug)?.clientArea) redirect("/work");
  const site = siteUrl();
  if (!site) redirect(`${page}?error=unavailable`);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    redirect(`${page}?error=invalid_email`);
  }

  const requestHeaders = await headers();
  const limit = await checkSignInRateLimit(getClientIp(requestHeaders));
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

  if (isMember) {
    const { error: sendError } = await (await createClient()).auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${site}/auth/callback?next=${encodeURIComponent(page)}`,
      },
    });
    if (sendError) console.error("Sign-in email failed", { slug, error: sendError });
  }

  // The same answer, after the same minimum wait, whether or not a link was sent.
  await new Promise((resolve) =>
    setTimeout(resolve, Math.max(0, MIN_RESPONSE_MS - (Date.now() - started))),
  );
  redirect(`${page}?sent=1`);
}

export async function signOut(slug: string) {
  await (await createClient()).auth.signOut({ scope: "local" });
  redirect(`/work/${slug}/client`);
}

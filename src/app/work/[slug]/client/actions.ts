"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getProjectBySlug } from "@/content/projects";
import { checkSignInRateLimit, getClientIp } from "@/lib/rate-limit";
import { createAdminClient, createClient } from "@/lib/supabase";

/** Emails a sign-in link, but only to addresses listed for this project. */
export async function requestLink(slug: string, formData: FormData) {
  const page = `/work/${slug}/client`;
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!getProjectBySlug(slug)?.clientArea) redirect("/work");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    redirect(`${page}?error=invalid_email`);
  }

  const requestHeaders = await headers();
  if (!(await checkSignInRateLimit(getClientIp(requestHeaders)))) {
    redirect(`${page}?error=rate_limited`);
  }

  const { data: isMember, error } = await createAdminClient().rpc(
    "can_access_project",
    { project: slug, address: email },
  );
  if (error) {
    console.error("Client access check failed", { slug, error });
    redirect(`${page}?error=unavailable`);
  }

  if (isMember) {
    // Supabase only honours redirect URLs on its allowlist, so a forged header
    // falls back to the Site URL rather than an attacker's domain.
    const origin =
      requestHeaders.get("origin") ?? `https://${requestHeaders.get("host")}`;
    const { error: sendError } = await (await createClient()).auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(page)}`,
      },
    });
    if (sendError) console.error("Sign-in email failed", { slug, error: sendError });
  }

  // The same answer either way, so the form never reveals who is a client.
  redirect(`${page}?sent=1`);
}

export async function signOut(slug: string) {
  await (await createClient()).auth.signOut({ scope: "local" });
  redirect(`/work/${slug}/client`);
}

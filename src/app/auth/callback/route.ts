import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase";
import { safeRedirectPath } from "@/lib/safe-redirect";
import { isAuthOutage } from "@/lib/session";
import { siteUrl } from "@/lib/site";

/** Where a sign-in link lands: swaps its one-time code for a session. */
export async function GET(request: NextRequest) {
  // Redirects use SITE_URL, never this request's Host, which a caller controls.
  const site = siteUrl();
  if (!site) return new NextResponse("Not found", { status: 404 });

  const { searchParams } = request.nextUrl;
  // Belt and braces: even a path that slips past the check must resolve on-site.
  const path = safeRedirectPath(searchParams.get("next"));
  const next = new URL(path, site).origin === site ? path : "/";
  const code = searchParams.get("code");

  let outage = false;
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, site));
    // A used or expired code is the client's to fix; a service failure is not.
    outage = isAuthOutage(error);
    if (outage) console.error("Sign-in code exchange failed", error);
  }

  const failed = new URL(next, site);
  failed.searchParams.set("error", outage ? "unavailable" : "link_expired");
  return NextResponse.redirect(failed);
}

import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase";
import { safeRedirectPath } from "@/lib/safe-redirect";

/** Where a sign-in link lands: swaps its one-time code for a session. */
export async function GET(request: NextRequest) {
  const { origin, searchParams } = request.nextUrl;
  const next = safeRedirectPath(searchParams.get("next"));
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  const failed = new URL(next, origin);
  failed.searchParams.set("error", "link_expired");
  return NextResponse.redirect(failed);
}

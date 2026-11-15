import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSessionExpired } from "@/lib/session";

/** Refreshes the client-area session cookie before pages read it. */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Verifying the claims also refreshes an expired access token.
  const { data } = await supabase.auth.getClaims();

  // Ends this device's session 12 hours after its sign-in; signOut clears the cookies above.
  if (data && isSessionExpired(data.claims.amr)) {
    await supabase.auth.signOut({ scope: "local" });
  }

  return response;
}

export const config = {
  matcher: ["/work/:slug/client", "/auth/:path*"],
};

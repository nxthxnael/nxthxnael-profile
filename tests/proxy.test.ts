import assert from "node:assert/strict";
import { register } from "node:module";
import { mock, test } from "node:test";

register("./alias-hooks.mjs", import.meta.url);
process.env.SUPABASE_URL = "https://abc.supabase.co";
process.env.SUPABASE_PUBLISHABLE_KEY = "sb_publishable_test";

// The session the fake Supabase reports: signed in this many hours ago.
let signedInHoursAgo = 1;
mock.module("@/lib/supabase", { namedExports: { isSupabaseConfigured: true } });
mock.module("@supabase/ssr", {
  namedExports: {
    createServerClient: (
      _url: string,
      _key: string,
      { cookies }: { cookies: { setAll(c: { name: string; value: string; options: object }[]): void } },
    ) => ({
      auth: {
        getClaims: async () => ({
          data: {
            claims: {
              amr: [{ method: "otp", timestamp: Date.now() / 1000 - signedInHoursAgo * 3600 }],
            },
          },
          error: null,
        }),
        // Like Supabase: signing out clears the session cookie.
        signOut: async () => {
          cookies.setAll([{ name: "sb-abc-auth-token", value: "", options: { maxAge: 0 } }]);
          return { error: null };
        },
      },
    }),
  },
});

const { NextRequest } = await import("next/server");
const { proxy } = await import("../src/proxy.ts");

// Next forwards request headers the proxy sets as x-middleware-request-<name>.
const FORWARDED = "x-middleware-request-x-client-session-expired";
const visit = () =>
  proxy(
    new NextRequest("https://nxthxnael.dev/work/qrix/client", {
      headers: { "x-client-session-expired": "1" },
    }),
  );

test("an expired session is signed out and the page is told why", async () => {
  signedInHoursAgo = 13;
  const response = await visit();
  assert.equal(response.headers.get(FORWARDED), "1");
  assert.match(response.headers.get("set-cookie") ?? "", /sb-abc-auth-token=;/);
});

test("a caller cannot fake the expired notice on a live session", async () => {
  signedInHoursAgo = 1;
  const response = await visit();
  assert.notEqual(response.headers.get(FORWARDED), "1");
});

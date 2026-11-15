import assert from "node:assert/strict";
import { register } from "node:module";
import { mock, test } from "node:test";

register("./alias-hooks.mjs", import.meta.url);
process.env.SITE_URL = "https://nxthxnael.dev";

let exchangeError: unknown = null;
mock.module("@/lib/supabase", {
  namedExports: {
    createClient: async () => ({
      auth: { exchangeCodeForSession: async () => ({ error: exchangeError }) },
    }),
  },
});

const { NextRequest } = await import("next/server");
const { GET } = await import("../src/app/auth/callback/route.ts");

function callback(query: string, host = "evil.example") {
  return GET(new NextRequest(`https://${host}/auth/callback?${query}`, { headers: { host } }));
}

test("redirects to the canonical site even when the Host header is forged", async () => {
  const ok = await callback("code=abc&next=%2Fwork%2Fqrix%2Fclient");
  assert.equal(ok.headers.get("location"), "https://nxthxnael.dev/work/qrix/client");

  exchangeError = new Error("expired");
  const failed = await callback("code=abc&next=%2Fwork%2Fqrix%2Fclient%3Fsent%3D1");
  assert.equal(
    failed.headers.get("location"),
    "https://nxthxnael.dev/work/qrix/client?sent=1&error=link_expired",
  );
});

test("an off-site next falls back to the home page on the canonical site", async () => {
  const response = await callback("next=%2F%2Fevil.com");
  assert.equal(response.headers.get("location"), "https://nxthxnael.dev/?error=link_expired");
});

test("a tab or newline in next cannot steer the redirect off-site", async () => {
  for (const next of ["%2F%09%2Fevil.com", "%2F%0A%2Fevil.com", "%2F%0D%2Fevil.com"]) {
    const response = await callback(`next=${next}`);
    assert.equal(new URL(response.headers.get("location")!).origin, "https://nxthxnael.dev", next);
  }
});

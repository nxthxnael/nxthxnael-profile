import assert from "node:assert/strict";
import { register } from "node:module";
import { beforeEach, mock, test } from "node:test";

register("./alias-hooks.mjs", import.meta.url);
process.env.SITE_URL = "http://localhost:3000";

// Who is on the member list, and what requestLink tried to send.
let isMember = false;
let rpcError: unknown = null;
let sendError: unknown = null;
let signOutError: unknown = null;
let limiterResult: "ok" | "limited" | "unavailable" = "ok";
let lastElapsedMs = 0;
// Real sends only; a stranger's sign-in runs against a local stub instead.
const sentLinks: { email: string; options: { emailRedirectTo: string } }[] = [];
const stubbedSends: string[] = [];
const checked: { name: string; project: string; address: string }[] = [];

mock.module("next/headers", {
  namedExports: {
    headers: async () =>
      new Headers({ origin: "http://localhost:3000", "x-real-ip": "203.0.113.5" }),
  },
});
mock.module("next/navigation", {
  namedExports: {
    redirect: (url: string) => {
      throw Object.assign(new Error("redirect"), { url });
    },
  },
});
mock.module("@/content/projects", {
  namedExports: {
    getProjectBySlug: (slug: string) =>
      slug === "client-proj" ? { slug, clientArea: true } : undefined,
  },
});
mock.module("@/lib/rate-limit", {
  namedExports: { checkSignInRateLimit: async () => limiterResult, getClientIp: () => "ip" },
});
mock.module("@/lib/supabase", {
  namedExports: {
    isSupabaseConfigured: true,
    createAdminClient: () => ({
      rpc: async (name: string, args: { project: string; address: string }) => {
        checked.push({ name, ...args });
        return { data: isMember, error: rpcError };
      },
    }),
    createClient: async (fetch?: typeof globalThis.fetch) => ({
      auth: {
        signInWithOtp: async (args: (typeof sentLinks)[number]) => {
          if (!fetch) {
            sentLinks.push(args);
            return { error: sendError };
          }
          // The stub must answer like Supabase does, without a network call.
          const reply = await fetch("https://stub.invalid/auth/v1/otp", { method: "POST" });
          stubbedSends.push(`${args.email} ${reply.status}`);
          return { error: null };
        },
        signOut: async () => ({ error: signOutError }),
      },
    }),
  },
});

const { requestLink, signOut } = await import("../src/app/work/[slug]/client/actions.ts");

// Runs requestLink on a mocked clock, so the minimum wait is measured, not slept.
async function submit(slug: string, email: string) {
  const form = new FormData();
  form.set("email", email);
  mock.timers.enable({ apis: ["setTimeout", "Date"], now: 0 });
  let url: string | undefined;
  let settled = false;
  requestLink(slug, form)
    .catch((error: { url?: string }) => {
      url = error.url;
    })
    .finally(() => {
      settled = true;
    });
  while (!settled) {
    await new Promise((resolve) => setImmediate(resolve));
    mock.timers.tick(100);
  }
  lastElapsedMs = Date.now();
  mock.timers.reset();
  if (!url) throw new Error("requestLink did not redirect");
  return url;
}

beforeEach(() => {
  isMember = false;
  rpcError = null;
  sendError = null;
  signOutError = null;
  limiterResult = "ok";
  sentLinks.length = 0;
  stubbedSends.length = 0;
  checked.length = 0;
});

test("a member gets a link back to their client page", async () => {
  isMember = true;
  const landed = await submit("client-proj", " Client@Example.com ");

  assert.equal(landed, "/work/client-proj/client?sent=1");
  assert.deepEqual(checked, [
    { name: "can_access_project", project: "client-proj", address: "client@example.com" },
  ]);
  assert.equal(stubbedSends.length, 0);
  assert.equal(sentLinks.length, 1);
  assert.equal(sentLinks[0].email, "client@example.com");
  assert.equal(
    sentLinks[0].options.emailRedirectTo,
    "http://localhost:3000/auth/callback?next=%2Fwork%2Fclient-proj%2Fclient",
  );
});

test("a stranger gets the same answer and no email", async () => {
  const landed = await submit("client-proj", "stranger@example.com");

  assert.equal(landed, "/work/client-proj/client?sent=1");
  assert.equal(sentLinks.length, 0);
  // Same sign-in call (so the same PKCE cookie) as a member, answered locally.
  assert.deepEqual(stubbedSends, ["stranger@example.com 200"]);
});

test("no email is sent when the membership check fails", async () => {
  mock.method(console, "error", () => {});
  isMember = true;
  rpcError = new Error("down");
  assert.equal(await submit("client-proj", "client@example.com"), "/work/client-proj/client?error=unavailable");
  assert.equal(sentLinks.length, 0);
  mock.restoreAll();
});

test("bad emails and projects without a client area are refused before any check", async () => {
  assert.equal(await submit("client-proj", "not-an-email"), "/work/client-proj/client?error=invalid_email");
  assert.equal(await submit("qrix", "client@example.com"), "/work");
  assert.equal(checked.length, 0);
});

test("members and strangers both wait at least two seconds, so timing does not reveal membership", async () => {
  isMember = true;
  await submit("client-proj", "client@example.com");
  const memberMs = lastElapsedMs;

  isMember = false;
  await submit("client-proj", "stranger@example.com");
  const strangerMs = lastElapsedMs;

  assert.ok(memberMs >= 2000, `member answered after ${memberMs} ms`);
  assert.ok(strangerMs >= 2000, `stranger answered after ${strangerMs} ms`);
});

test("a failed sign-in email gets the same answer as a sent one", async () => {
  mock.method(console, "error", () => {});
  isMember = true;
  sendError = new Error("smtp down");
  assert.equal(await submit("client-proj", "client@example.com"), "/work/client-proj/client?sent=1");
  mock.restoreAll();
});

test("sign-in is refused, with no check or email, when rate limited or the limiter is down", async () => {
  limiterResult = "limited";
  assert.equal(await submit("client-proj", "client@example.com"), "/work/client-proj/client?error=rate_limited");
  limiterResult = "unavailable";
  assert.equal(await submit("client-proj", "client@example.com"), "/work/client-proj/client?error=unavailable");
  assert.equal(checked.length, 0);
  assert.equal(sentLinks.length, 0);
});

test("sign-out reports a failure instead of pretending the session ended", async () => {
  const landed = async () =>
    signOut("client-proj").catch((error: { url?: string }) => error.url);
  assert.equal(await landed(), "/work/client-proj/client");

  mock.method(console, "error", () => {});
  signOutError = { status: 0, name: "AuthRetryableFetchError" };
  assert.equal(await landed(), "/work/client-proj/client?error=sign_out_failed");
  mock.restoreAll();
});

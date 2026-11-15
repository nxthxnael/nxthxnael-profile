import assert from "node:assert/strict";
import { register } from "node:module";
import { beforeEach, mock, test } from "node:test";

register("./alias-hooks.mjs", import.meta.url);

// Who is on the member list, and what requestLink tried to send.
let isMember = false;
let rpcError: unknown = null;
const sentLinks: { email: string; options: { emailRedirectTo: string } }[] = [];
const checked: { project: string; address: string }[] = [];

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
  namedExports: { checkSignInRateLimit: async () => true, getClientIp: () => "ip" },
});
mock.module("@/lib/supabase", {
  namedExports: {
    createAdminClient: () => ({
      rpc: async (_name: string, args: { project: string; address: string }) => {
        checked.push(args);
        return { data: isMember, error: rpcError };
      },
    }),
    createClient: async () => ({
      auth: {
        signInWithOtp: async (args: (typeof sentLinks)[number]) => {
          sentLinks.push(args);
          return { error: null };
        },
        signOut: async () => ({}),
      },
    }),
  },
});

const { requestLink } = await import("../src/app/work/[slug]/client/actions.ts");

async function submit(slug: string, email: string) {
  const form = new FormData();
  form.set("email", email);
  try {
    await requestLink(slug, form);
  } catch (error) {
    return (error as { url: string }).url;
  }
  throw new Error("requestLink did not redirect");
}

beforeEach(() => {
  isMember = false;
  rpcError = null;
  sentLinks.length = 0;
  checked.length = 0;
});

test("a member gets a link back to their client page", async () => {
  isMember = true;
  const landed = await submit("client-proj", " Client@Example.com ");

  assert.equal(landed, "/work/client-proj/client?sent=1");
  assert.deepEqual(checked, [{ project: "client-proj", address: "client@example.com" }]);
  assert.equal(sentLinks.length, 1);
  assert.equal(
    sentLinks[0].options.emailRedirectTo,
    "http://localhost:3000/auth/callback?next=%2Fwork%2Fclient-proj%2Fclient",
  );
});

test("a stranger gets the same answer and no email", async () => {
  const landed = await submit("client-proj", "stranger@example.com");

  assert.equal(landed, "/work/client-proj/client?sent=1");
  assert.equal(sentLinks.length, 0);
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

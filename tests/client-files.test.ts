import assert from "node:assert/strict";
import { register } from "node:module";
import { beforeEach, mock, test } from "node:test";

register("./alias-hooks.mjs", import.meta.url);
process.env.SITE_URL = "https://nxthxnael.dev";

// What the fake Supabase answers: the visitor, the row RLS lets through, the signing.
let user: unknown = { id: "u1" };
let userError: unknown = null;
let row: unknown = { storage_path: "client-proj/handover.pdf" };
let rowError: unknown = null;
const queried: string[] = [];
const signed: { path: string; expiresIn: number }[] = [];

mock.module("@/content/projects", {
  namedExports: {
    getProjectBySlug: (slug: string) =>
      slug === "client-proj" ? { slug, clientArea: true } : undefined,
  },
});
mock.module("@/lib/supabase", {
  namedExports: {
    isSupabaseConfigured: true,
    createClient: async () => ({
      auth: { getUser: async () => ({ data: { user }, error: userError }) },
      from: (table: string) => {
        const query = {
          select: () => query,
          eq: (column: string, value: string) => {
            queried.push(`${table}.${column}=${value}`);
            return query;
          },
          maybeSingle: async () => ({ data: row, error: rowError }),
        };
        return query;
      },
      storage: {
        from: () => ({
          createSignedUrl: async (path: string, expiresIn: number) => {
            signed.push({ path, expiresIn });
            return { data: { signedUrl: `https://abc.supabase.co/sign/${path}?token=t` } };
          },
        }),
      },
    }),
  },
});

const { NextRequest } = await import("next/server");
const { GET } = await import("../src/app/work/[slug]/client/files/[id]/route.ts");

const open = (slug = "client-proj", id = "r1", headers: Record<string, string> = {}) =>
  GET(new NextRequest(`https://nxthxnael.dev/work/${slug}/client/files/${id}`, { headers }), {
    params: Promise.resolve({ slug, id }),
  });

beforeEach(() => {
  user = { id: "u1" };
  userError = null;
  row = { storage_path: "client-proj/handover.pdf" };
  rowError = null;
  queried.length = 0;
  signed.length = 0;
});

test("a member's click signs a short-lived link and redirects to it", async () => {
  const response = await open();
  assert.equal(response.status, 303);
  assert.equal(
    response.headers.get("location"),
    "https://abc.supabase.co/sign/client-proj/handover.pdf?token=t",
  );
  assert.deepEqual(queried, [
    "project_resources.id=r1",
    "project_resources.project_slug=client-proj",
    "project_resources.kind=file",
  ]);
  assert.deepEqual(signed, [{ path: "client-proj/handover.pdf", expiresIn: 60 }]);
});

test("a file the member can't see goes back to the client area with an error", async () => {
  row = null;
  const response = await open();
  assert.equal(
    response.headers.get("location"),
    "https://nxthxnael.dev/work/client-proj/client?error=file_unavailable",
  );
  assert.equal(signed.length, 0);
});

test("without a session the click goes back to sign-in", async () => {
  user = null;
  userError = { status: 400, name: "AuthSessionMissingError" };
  const response = await open();
  assert.equal(response.headers.get("location"), "https://nxthxnael.dev/work/client-proj/client");
  assert.equal(queried.length, 0);
});

test("an auth outage reads as unavailable", async () => {
  mock.method(console, "error", () => {});
  user = null;
  userError = { status: 0, name: "AuthRetryableFetchError" };
  const response = await open();
  assert.equal(
    response.headers.get("location"),
    "https://nxthxnael.dev/work/client-proj/client?error=unavailable",
  );
  mock.restoreAll();
});

test("projects without a client area answer 404", async () => {
  assert.equal((await open("qrix")).status, 404);
});

test("a session the proxy just ended for age comes back with the 12-hour notice", async () => {
  user = null;
  userError = { status: 400, name: "AuthSessionMissingError" };
  const response = await open("client-proj", "r1", { "x-client-session-expired": "1" });
  assert.equal(
    response.headers.get("location"),
    "https://nxthxnael.dev/work/client-proj/client?error=session_expired",
  );
});

test("a database failure reads as unavailable and is logged, not as a missing file", async () => {
  const logged = mock.method(console, "error", () => {});
  row = null;
  rowError = { code: "08006", message: "connection failure" };
  const response = await open();
  assert.equal(
    response.headers.get("location"),
    "https://nxthxnael.dev/work/client-proj/client?error=unavailable",
  );
  assert.equal(logged.mock.callCount(), 1);
  mock.restoreAll();
});

test("an id that isn't a uuid is just a missing file", async () => {
  row = null;
  rowError = { code: "22P02", message: "invalid input syntax for type uuid" };
  const response = await open("client-proj", "not-a-uuid");
  assert.equal(
    response.headers.get("location"),
    "https://nxthxnael.dev/work/client-proj/client?error=file_unavailable",
  );
});

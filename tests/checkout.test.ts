import assert from "node:assert/strict";
import { register } from "node:module";
import { after, mock, test } from "node:test";

process.env.PAYSTACK_SECRET_KEY = "sk_test_unit";
delete process.env.UPSTASH_REDIS_REST_URL;

register("./alias-hooks.mjs", import.meta.url);

// Fake Paystack: records each initialize body and answers with a checkout URL.
const initialized: Record<string, unknown>[] = [];
const realFetch = globalThis.fetch;
globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = String(input instanceof Request ? input.url : input);
  if (url !== "https://api.paystack.co/transaction/initialize") {
    throw new Error(`Unexpected fetch in test: ${url}`);
  }
  initialized.push(JSON.parse(String(init?.body)));
  return Response.json({
    status: true,
    data: { authorization_url: "https://checkout.paystack.com/unit", reference: "ref_unit" },
  });
}) as typeof fetch;

after(() => {
  globalThis.fetch = realFetch;
});

mock.method(console, "warn", () => {});
mock.method(console, "error", () => {});

const { NextRequest } = await import("next/server");
const { POST } = await import("../src/app/api/checkout/route.ts");
const { termsVersion } = await import("../src/content/terms.ts");

function checkout(fields: Record<string, string>) {
  return POST(
    new NextRequest("http://localhost/api/checkout", {
      method: "POST",
      body: new URLSearchParams({ kind: "package", email: "buyer@example.com", ...fields }),
      headers: { origin: "http://localhost", "x-real-ip": "203.0.113.9" },
    }),
  );
}

test("a care plan without a plan code is refused, not charged once", async () => {
  delete process.env.PAYSTACK_PLAN_CARE;
  const response = await checkout({ packageId: "care-plan", acceptTerms: "on" });
  assert.match(response.headers.get("location")!, /error=not_configured/);
  assert.equal(initialized.length, 0);
});

test("a care plan subscribes through its plan code, card only, with the terms version", async () => {
  process.env.PAYSTACK_PLAN_CARE = "PLN_care_unit";
  const response = await checkout({ packageId: "care-plan", acceptTerms: "on" });
  assert.equal(response.headers.get("location"), "https://checkout.paystack.com/unit");

  const sent = initialized.at(-1)!;
  assert.equal(sent.plan, "PLN_care_unit");
  assert.deepEqual(sent.channels, ["card"]);
  assert.equal((sent.metadata as Record<string, unknown>).termsAccepted, termsVersion);
});

test("a build without ticking the terms is refused", async () => {
  const before = initialized.length;
  const response = await checkout({ packageId: "starter-site" });
  assert.match(response.headers.get("location")!, /error=terms_required/);
  assert.equal(initialized.length, before);
});

test("a build is a one-off charge with every payment method", async () => {
  await checkout({ packageId: "starter-site", acceptTerms: "on", addCare: "on" });
  const sent = initialized.at(-1)!;
  assert.equal(sent.plan, undefined);
  assert.equal(sent.channels, undefined);
  assert.equal((sent.metadata as Record<string, unknown>).addCare, true);
});

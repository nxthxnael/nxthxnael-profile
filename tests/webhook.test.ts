import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { register } from "node:module";
import { after, mock, test } from "node:test";

const SECRET = "sk_test_unit";
const UPSTASH_URL = "https://fake-upstash.test";
const DISCORD_URL = "https://fake-discord.test/hook";

process.env.PAYSTACK_SECRET_KEY = SECRET;
process.env.DISCORD_WEBHOOK_URL = DISCORD_URL;
process.env.UPSTASH_REDIS_REST_URL = UPSTASH_URL;
process.env.UPSTASH_REDIS_REST_TOKEN = "unit";
process.env.PAYSTACK_PLAN_CARE = "PLN_care_unit";

register("./alias-hooks.mjs", import.meta.url);

// Fake Upstash: only SET and DEL work; anything else (the rate limiter's
// scripts) errors, which the limiter treats as "fail open".
const seen = new Set<string>();
let discordCalls = 0;
let discordStatus = 200;
const discordTitles: string[] = [];
const subscriptionBodies: Record<string, string>[] = [];

const realFetch = globalThis.fetch;
globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = String(input instanceof Request ? input.url : input);

  if (url.startsWith(DISCORD_URL)) {
    discordCalls++;
    discordTitles.push(JSON.parse(String(init?.body)).embeds[0].title);
    return new Response("{}", { status: discordStatus });
  }

  if (url === "https://api.paystack.co/subscription") {
    subscriptionBodies.push(JSON.parse(String(init?.body)));
    return Response.json({ status: true });
  }

  if (url.startsWith(UPSTASH_URL)) {
    // The client batches commands as an array of [command, ...args] to /pipeline.
    const commands = JSON.parse(String(init?.body)) as string[][];
    return Response.json(
      commands.map(([command, key]) => {
        if (command.toLowerCase() === "set") {
          const result = seen.has(key) ? null : "OK";
          seen.add(key);
          return { result };
        }
        if (command.toLowerCase() === "del") {
          return { result: Number(seen.delete(key)) };
        }
        return { error: "unsupported in test" };
      }),
    );
  }

  throw new Error(`Unexpected fetch in test: ${url}`);
}) as typeof fetch;

after(() => {
  globalThis.fetch = realFetch;
});

const { NextRequest } = await import("next/server");
const { POST } = await import("../src/app/api/webhooks/paystack/route.ts");
const { sendDiscordNotification } = await import("../src/lib/discord.ts");

const REFERENCE = "ref_test_12345";

function deliver(data: Record<string, unknown> = {}) {
  const body = JSON.stringify({
    event: "charge.success",
    data: {
      reference: REFERENCE,
      amount: 1_200_000,
      currency: "KES",
      customer: { email: "buyer@example.com" },
      metadata: { kind: "package", packageName: "Website Audit & Fixes" },
      ...data,
    },
  });
  const signature = createHmac("sha512", SECRET).update(body).digest("hex");

  return POST(
    new NextRequest("http://localhost/api/webhooks/paystack", {
      method: "POST",
      body,
      headers: { "x-paystack-signature": signature, "x-real-ip": "203.0.113.7" },
    }),
  );
}

test("a failed Discord post answers 500, clears the dedupe key and lets the retry through", async () => {
  mock.method(console, "error", () => {});

  discordStatus = 500;
  const failed = await deliver();
  assert.equal(failed.status, 500);
  assert.equal(discordCalls, 1);
  assert.equal(seen.has(`webhook-seen:${REFERENCE}`), false, "key was cleared");

  discordStatus = 200;
  const retried = await deliver();
  assert.equal(retried.status, 200);
  assert.equal((await retried.json()).duplicate, undefined);
  assert.equal(discordCalls, 2, "retry was processed, not dropped as a duplicate");

  const replay = await deliver();
  assert.equal((await replay.json()).duplicate, true);
  assert.equal(discordCalls, 2, "a delivered reference is still deduped");

  mock.restoreAll();
});

test("a build with Care subscribes the card once, two months out, even when the alert is retried", async () => {
  mock.method(console, "error", () => {});
  const reference = "ref_care_12345";
  const build = {
    reference,
    customer: { email: "buyer@example.com", customer_code: "CUS_unit" },
    authorization: { authorization_code: "AUTH_unit", reusable: true },
    metadata: { kind: "package", packageName: "Starter Site", addCare: true },
  };

  discordStatus = 500;
  assert.equal((await deliver(build)).status, 500);
  assert.equal(subscriptionBodies.length, 0, "no subscription before the alert succeeds");

  discordStatus = 200;
  assert.equal((await deliver(build)).status, 200);
  assert.equal(subscriptionBodies.length, 1);

  const [subscription] = subscriptionBodies;
  assert.equal(subscription.plan, "PLN_care_unit");
  assert.equal(subscription.customer, "CUS_unit");
  assert.equal(subscription.authorization, "AUTH_unit");
  const days = (Date.parse(subscription.start_date) - Date.now()) / 86_400_000;
  assert.ok(days > 55 && days < 63, `starts in ${days} days`);
  assert.equal(discordTitles.at(-1), "Care plan");

  await deliver(build);
  assert.equal(subscriptionBodies.length, 1, "a replay does not subscribe again");

  mock.restoreAll();
});

test("free months paid on 31 December end on the last day of February", async () => {
  mock.timers.enable({ apis: ["Date"], now: new Date(2026, 11, 31, 12) });
  await deliver({
    reference: "ref_new_year_12345",
    customer: { email: "buyer@example.com", customer_code: "CUS_unit" },
    authorization: { authorization_code: "AUTH_unit", reusable: true },
    metadata: { kind: "package", packageName: "Starter Site", addCare: true },
  });
  const start = new Date(subscriptionBodies.at(-1)!.start_date);
  assert.deepEqual([start.getFullYear(), start.getMonth(), start.getDate()], [2027, 1, 28]);
  mock.timers.reset();
});

test("a build paid by M-Pesa is flagged for manual Care set-up", async () => {
  const before = subscriptionBodies.length;
  await deliver({
    reference: "ref_mpesa_12345",
    authorization: { authorization_code: "AUTH_mpesa", reusable: false },
    metadata: { kind: "package", packageName: "Starter Site", addCare: true },
  });
  assert.equal(subscriptionBodies.length, before);
  assert.equal(discordTitles.at(-1), "Care plan");
});

test("a plan renewal is labelled as a subscription, not a tip", async () => {
  await deliver({ reference: "ref_renewal_12345", plan: { name: "Care" }, metadata: null });
  assert.equal(discordTitles.at(-1), "Subscription renewed");
});

test("the Discord post is aborted after 3 seconds", async () => {
  const controller = new AbortController();
  const timeout = mock.method(AbortSignal, "timeout", () => controller.signal);

  globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) =>
    new Promise((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(init.signal?.reason));
    })) as typeof fetch;

  const pending = sendDiscordNotification({ title: "t", fields: [] });
  controller.abort(new Error("timed out"));

  await assert.rejects(pending, /timed out/);
  assert.deepEqual(timeout.mock.calls[0].arguments, [3000]);

  mock.restoreAll();
});

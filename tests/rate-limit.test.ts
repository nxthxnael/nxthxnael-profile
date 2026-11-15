import assert from "node:assert/strict";
import { mock, test } from "node:test";

delete process.env.UPSTASH_REDIS_REST_URL;
delete process.env.UPSTASH_REDIS_REST_TOKEN;
mock.method(console, "warn", () => {});

const { checkCheckoutRateLimit, checkSignInRateLimit } = await import("../src/lib/rate-limit.ts");

test("without Upstash, checkout fails open but sign-in fails closed", async () => {
  assert.equal(await checkCheckoutRateLimit("203.0.113.1"), true);
  assert.equal(await checkSignInRateLimit("203.0.113.1", "client@example.com"), "unavailable");
});

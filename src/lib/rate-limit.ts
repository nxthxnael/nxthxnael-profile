import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = (() => {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
})();

if (!redis) {
  console.warn(
    "UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN not set — rate " +
      "limiting and webhook replay protection are disabled (failing open).",
  );
}

const checkoutLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "60 s"),
      analytics: true,
      prefix: "ratelimit:checkout",
    })
  : null;

const webhookLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "60 s"),
      analytics: true,
      prefix: "ratelimit:webhook",
    })
  : null;

/** Fails open (allows the request) if Upstash isn't configured yet. */
export async function checkCheckoutRateLimit(ip: string): Promise<boolean> {
  if (!checkoutLimiter) return true;
  const { success } = await checkoutLimiter.limit(ip);
  return success;
}

/** Fails open (allows the request) if Upstash isn't configured yet. */
export async function checkWebhookRateLimit(ip: string): Promise<boolean> {
  if (!webhookLimiter) return true;
  const { success } = await webhookLimiter.limit(ip);
  return success;
}

// Comfortably longer than Paystack's longest documented retry window
// (72 hours for live-mode webhooks), so genuine retries are deduped too.
const WEBHOOK_SEEN_TTL_SECONDS = 60 * 60 * 24 * 7;

/** Fails open (treats as "not a duplicate") if Upstash isn't configured yet. */
export async function isDuplicateWebhookReference(
  reference: string,
): Promise<boolean> {
  if (!redis) return false;

  const result = await redis.set(`webhook-seen:${reference}`, "1", {
    nx: true,
    ex: WEBHOOK_SEEN_TTL_SECONDS,
  });

  return result === null;
}

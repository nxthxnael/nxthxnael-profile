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
      prefix: "ratelimit:checkout",
    })
  : null;

const webhookLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "60 s"),
      prefix: "ratelimit:webhook",
    })
  : null;

/** Fails open (allows the request) if Upstash isn't configured or errors. */
async function checkLimit(limiter: Ratelimit | null, ip: string) {
  if (!limiter) return true;

  try {
    const { success } = await limiter.limit(ip);
    return success;
  } catch (error) {
    console.error("Rate limiter unavailable, allowing request", error);
    return true;
  }
}

export const checkCheckoutRateLimit = (ip: string) =>
  checkLimit(checkoutLimiter, ip);

export const checkWebhookRateLimit = (ip: string) =>
  checkLimit(webhookLimiter, ip);

// Comfortably longer than Paystack's longest documented retry window
// (72 hours for live-mode webhooks), so genuine retries are deduped too.
const WEBHOOK_SEEN_TTL_SECONDS = 60 * 60 * 24 * 7;

// shortcut: per-instance memory only, so a replay can still slip through on a
// cold instance while Redis is down; upgrade if that ever shows up in Discord.
const seenWhileRedisDown = new Set<string>();

/**
 * Fails open (treats as "not a duplicate") if Upstash isn't configured. If it
 * errors, the first delivery goes through and repeats are caught in memory.
 */
export async function isDuplicateWebhookReference(
  reference: string,
): Promise<boolean> {
  if (!redis) return false;

  try {
    const result = await redis.set(`webhook-seen:${reference}`, "1", {
      nx: true,
      ex: WEBHOOK_SEEN_TTL_SECONDS,
    });

    return result === null;
  } catch (error) {
    console.error("Webhook dedupe unavailable, using in-memory check", error);
    if (seenWhileRedisDown.has(reference)) return true;
    if (seenWhileRedisDown.size >= 1000) seenWhileRedisDown.clear();
    seenWhileRedisDown.add(reference);
    return false;
  }
}

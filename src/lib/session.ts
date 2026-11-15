/** Clients are signed out this long after they used their sign-in link. */
export const SESSION_MAX_AGE_MS = 12 * 60 * 60 * 1000;

/**
 * True once this session is older than the limit. The age comes from the
 * session's own JWT `amr` claim (earliest sign-in timestamp, in seconds), which
 * survives token refreshes and, unlike the account-wide `last_sign_in_at`, is
 * not reset by a sign-in on another device. Unknown sign-in times count as expired.
 */
export function isSessionExpired(amr: unknown, now = Date.now()) {
  const timestamps = Array.isArray(amr)
    ? amr.map((entry) => entry?.timestamp).filter((t): t is number => typeof t === "number")
    : [];
  if (timestamps.length === 0) return true;
  return now - Math.min(...timestamps) * 1000 > SESSION_MAX_AGE_MS;
}

/** Clients are signed out this long after they used their sign-in link (also in SQL as 43200 s). */
export const SESSION_MAX_AGE_MS = 12 * 60 * 60 * 1000;

/** Set by the proxy on a request whose session it just ended for being too old. */
export const SESSION_EXPIRED_HEADER = "x-client-session-expired";

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
  // ">=" matches the database's client_session_is_fresh, which needs age < 12 hours.
  return now - Math.min(...timestamps) * 1000 >= SESSION_MAX_AGE_MS;
}

/**
 * True when Supabase Auth itself failed (network, timeout, 5xx), as opposed to a
 * 4xx answer about this visitor: no session, an invalid or expired token, or a
 * used link. Outages should read "unavailable", not "signed out" or "expired".
 */
export function isAuthOutage(error: unknown) {
  if (!error) return false;
  const status = (error as { status?: unknown }).status;
  return !(typeof status === "number" && status >= 400 && status < 500);
}

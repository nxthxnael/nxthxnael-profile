/** Clients are signed out this long after they used their sign-in link. */
export const SESSION_MAX_AGE_MS = 12 * 60 * 60 * 1000;

/** True once a session is older than the limit, or its sign-in time is unknown. */
export function isSessionExpired(lastSignInAt: string | undefined, now = Date.now()) {
  const signedInAt = lastSignInAt ? Date.parse(lastSignInAt) : NaN;
  return Number.isNaN(signedInAt) || now - signedInAt > SESSION_MAX_AGE_MS;
}

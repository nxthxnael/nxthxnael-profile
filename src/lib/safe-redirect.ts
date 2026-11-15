/**
 * Keeps a redirect target on this site: a plain path, never "//host", "/\host",
 * or any whitespace or control character (URL parsing drops tabs and newlines,
 * so "/\t/host" would otherwise become "//host").
 */
export function safeRedirectPath(next: string | null, fallback = "/") {
  if (!next || !next.startsWith("/") || /[\s\x00-\x1f\x7f\\]/.test(next) || next.startsWith("//")) {
    return fallback;
  }
  return next;
}

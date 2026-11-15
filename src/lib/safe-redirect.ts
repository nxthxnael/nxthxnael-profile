/** Keeps a redirect target on this site: a path, never "//host" or "/\host". */
export function safeRedirectPath(next: string | null, fallback = "/") {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return fallback;
  }
  return next;
}

/**
 * The site's canonical origin from SITE_URL, used for every auth redirect so a
 * forged Host header can never steer one off-site. Only https is accepted,
 * except plain http on localhost for development. Null when unset or invalid.
 */
export function siteUrl(value = process.env.SITE_URL): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    if (url.protocol === "https:" || (url.protocol === "http:" && local)) {
      return url.origin;
    }
  } catch {
    // Not a URL; fall through.
  }
  return null;
}

/**
 * Works out the public origin of the site (e.g. https://1mscholars.com) so
 * email-confirmation links point back to the right place.
 *
 * The `Origin` header is not guaranteed on Server Action requests, and
 * `${null}/auth/callback` would silently produce a broken link in the email.
 * Order: Origin header -> forwarded host (proxies like Render/Vercel) ->
 * NEXT_PUBLIC_SITE_URL -> localhost.
 */
export function getSiteUrl(requestHeaders: Headers): string {
  const origin = requestHeaders.get("origin");
  if (origin && origin !== "null") return origin.replace(/\/$/, "");

  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  if (host) {
    const proto =
      requestHeaders.get("x-forwarded-proto") ??
      (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
    return `${proto}://${host}`;
  }

  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  return "http://localhost:3000";
}

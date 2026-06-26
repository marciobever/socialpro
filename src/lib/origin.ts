/**
 * Resolve the public origin (scheme + host) of the incoming request.
 *
 * OAuth redirect URIs must match EXACTLY what the provider has registered,
 * including www vs non-www. Deriving the origin from the actual request host
 * (instead of a fixed NEXTAUTH_URL) means the callback URL always matches the
 * domain the user is browsing — production apex, www, or a Vercel preview —
 * as long as that host is in the provider's allow-list.
 */
export function getRequestOrigin(req: Request): string {
  const proto = req.headers.get('x-forwarded-proto') ?? 'https';
  const host  = req.headers.get('x-forwarded-host') ?? req.headers.get('host');
  if (host) return `${proto}://${host}`;
  return process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
}

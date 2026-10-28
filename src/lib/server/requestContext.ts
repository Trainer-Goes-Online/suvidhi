/**
 * Extract server-side request context for Meta CAPI matching: the real client
 * IP, user-agent, and the _fbc / _fbp cookies. These four are sent RAW (never
 * hashed). Values explicitly passed by the client (e.g. an fbc reconstructed
 * from fbclid) take precedence, with the request cookies as a fallback.
 */

export interface ClientContext {
  clientIp: string
  clientUserAgent: string
  fbc: string
  fbp: string
}

function readCookie(cookieHeader: string, name: string): string {
  if (!cookieHeader) return ''
  const m = cookieHeader.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'))
  return m ? decodeURIComponent(m[1]) : ''
}

export function getClientContext(
  req: Request,
  fallback: { fbc?: string; fbp?: string } = {},
): ClientContext {
  const h = req.headers
  const cookieHeader = h.get('cookie') ?? ''
  const clientIp =
    h.get('x-forwarded-for')?.split(',')[0].trim() ||
    h.get('x-real-ip') ||
    ''
  return {
    clientIp,
    clientUserAgent: h.get('user-agent') ?? '',
    fbc: readCookie(cookieHeader, '_fbc') || fallback.fbc || '',
    fbp: readCookie(cookieHeader, '_fbp') || fallback.fbp || '',
  }
}

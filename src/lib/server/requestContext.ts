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
  /**
   * Already-hashed identity from the first-party `svd_mam` cookie (written by
   * setMetaAdvancedMatching in src/lib/tracking.ts once a form is filled).
   * Lets events that fire with no form in hand — atc_event on a returning
   * visitor, schedule_event — still carry em/ph/fn/ln/ct/country/external_id.
   */
  hashedIdentity: Record<string, string>
}

const HASHED_KEYS = ['em', 'ph', 'fn', 'ln', 'ct', 'country', 'external_id'] as const

function readHashedIdentity(cookieHeader: string): Record<string, string> {
  const raw = readCookie(cookieHeader, 'svd_mam')
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const out: Record<string, string> = {}
    for (const k of HASHED_KEYS) {
      const v = parsed[k]
      // Only accept real SHA-256 hex — never forward anything unhashed.
      if (typeof v === 'string' && /^[a-f0-9]{64}$/.test(v)) out[k] = v
    }
    return out
  } catch {
    return {}
  }
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
    hashedIdentity: readHashedIdentity(cookieHeader),
  }
}

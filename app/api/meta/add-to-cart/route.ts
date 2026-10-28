import { sendAtcEvent, isTrackingEnabled, metaCreds } from '@/lib/server/metaEvents'
import { getClientContext } from '@/lib/server/requestContext'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}

function str(v: unknown): string | undefined {
  return typeof v === 'string' && v ? v : undefined
}

/**
 * Fires the custom `atc_event` — triggered by the first landing-CTA click of a
 * browser's lifetime (client dedups via localStorage; Meta dedups on event_id).
 *
 * _fbc/_fbp come from the request cookies, falling back to the values the
 * browser sent (an fbc rebuilt from fbclid exists before Meta's pixel sets the
 * cookie). IP/UA from headers, hashed identity from the svd_mam cookie.
 * Never fails the click.
 */
export async function POST(req: Request): Promise<Response> {
  let body: Record<string, unknown> = {}
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    body = {}
  }

  if (!isTrackingEnabled()) {
    return json(200, { ok: true, skipped: 'test_mode' })
  }

  const creds = metaCreds()
  if (!creds) {
    console.log('[atc_event] skipped: env_missing')
    return json(200, { ok: true, skipped: 'env_missing' })
  }

  const ctx = getClientContext(req, { fbc: str(body.fbc), fbp: str(body.fbp) })
  const result = await sendAtcEvent(creds, ctx, str(body.eventSourceUrl))

  if (result.ok) {
    console.log('[atc_event] sent')
    return json(200, { ok: true, capi: 'sent' })
  }
  console.error('[atc_event] failed', result.status, result.body.slice(0, 300))
  return json(200, { ok: true, capi: 'error' })
}

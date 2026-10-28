import {
  sendAddToCartEvent,
  isTrackingEnabled,
  metaCreds,
} from '@/lib/server/metaEvents'
import { getClientContext } from '@/lib/server/requestContext'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}

/**
 * Fires Meta `AddToCart` — triggered by the first landing-CTA click of a
 * browser's lifetime (client dedups via localStorage; Meta dedups on event_id).
 *
 * Reads _fbc/_fbp from cookies and IP/UA from headers — the only matching
 * signals that exist at CTA-click time (no PII yet). Never fails the click.
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
    console.log('[atc] skipped: env_missing')
    return json(200, { ok: true, skipped: 'env_missing' })
  }

  const ctx = getClientContext(req)
  const eventSourceUrl =
    typeof body.eventSourceUrl === 'string' ? body.eventSourceUrl : undefined

  const result = await sendAddToCartEvent({
    pixelId: creds.pixelId,
    accessToken: creds.accessToken,
    testEventCode: creds.testEventCode,
    fbc: ctx.fbc,
    fbp: ctx.fbp,
    clientIp: ctx.clientIp,
    clientUserAgent: ctx.clientUserAgent,
    eventSourceUrl,
  })

  if (result.ok) {
    console.log('[atc] AddToCart sent')
    return json(200, { ok: true, capi: 'sent' })
  }
  console.error('[atc] AddToCart failed', result.status, result.body.slice(0, 300))
  return json(200, { ok: true, capi: 'error' })
}

import {
  sendOtoChoiceEvent,
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
 * Fires the OTO plan-choice custom event, triggered when the buyer clicks
 * Continue on /oto (client dedups via localStorage; Meta dedups on event_id):
 *   plan 'call'   → `only_call`
 *   plan 'bundle' → `call_plus_course`
 *
 * No PII exists at this step (the form is on /checkout), so only _fbc/_fbp +
 * IP/UA are sent. Never fails the click.
 */
export async function POST(req: Request): Promise<Response> {
  let body: Record<string, unknown> = {}
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    body = {}
  }

  // Narrow to a real plan; anything unrecognised is the ₹97 call.
  const plan: 'call' | 'bundle' = body.plan === 'bundle' ? 'bundle' : 'call'

  if (!isTrackingEnabled()) {
    return json(200, { ok: true, skipped: 'test_mode' })
  }

  const creds = metaCreds()
  if (!creds) {
    console.log('[oto] skipped: env_missing')
    return json(200, { ok: true, skipped: 'env_missing' })
  }

  const ctx = getClientContext(req)
  const eventSourceUrl =
    typeof body.eventSourceUrl === 'string' ? body.eventSourceUrl : undefined
  const eventName = plan === 'bundle' ? 'call_plus_course' : 'only_call'

  const result = await sendOtoChoiceEvent({
    pixelId: creds.pixelId,
    accessToken: creds.accessToken,
    testEventCode: creds.testEventCode,
    plan,
    fbc: ctx.fbc,
    fbp: ctx.fbp,
    clientIp: ctx.clientIp,
    clientUserAgent: ctx.clientUserAgent,
    eventSourceUrl,
  })

  if (result.ok) {
    console.log(`[oto] ${eventName} sent`)
    return json(200, { ok: true, capi: 'sent' })
  }
  console.error(`[oto] ${eventName} failed`, result.status, result.body.slice(0, 300))
  return json(200, { ok: true, capi: 'error' })
}

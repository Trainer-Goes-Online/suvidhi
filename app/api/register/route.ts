import { createHash } from 'node:crypto'
import { sendPabblyRow } from '@/lib/server/pabbly'
import { hostOnlyUrl } from '@/lib/server/metaCapi'
import { getClientContext } from '@/lib/server/requestContext'
import type { TrackingPayload } from '@/lib/server/purchaseTracking'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}

/**
 * Free Roadmap Call registration — writes the lead's CRM row to Pabbly.
 *
 * The free path never touches Razorpay, so the webhook that writes the row for
 * paid orders never runs for these leads; this route is their equivalent. Same
 * 32-column payload, amount 0, is_test false, and no CAPI conversion — the
 * free booking is tracked as `ic_event` (and later `schedule_event`), never as
 * a `sales` purchase.
 */
export async function POST(req: Request): Promise<Response> {
  let body: Record<string, unknown> = {}
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    body = {}
  }

  const leadId = typeof body.leadId === 'string' ? body.leadId.slice(0, 40) : ''
  const t = (body.tracking ?? {}) as TrackingPayload
  const email = (t.email ?? '').trim()
  if (!leadId || !email) {
    return json(400, { ok: false, error: 'missing_lead' })
  }

  const pabblyUrl = process.env.NEXT_PUBLIC_PABBLY_WEBHOOK_URL ?? ''
  if (!pabblyUrl) {
    return json(200, { ok: true, pabbly: 'skipped' })
  }

  const ctx = getClientContext(req, { fbc: t.fbc, fbp: t.fbp })
  const r = await sendPabblyRow(pabblyUrl, {
    leadId,
    // This route only ever handles the free path — the VIP row comes from
    // the Razorpay webhook once the payment is captured.
    purchaseType: 'call_only',
    createdAt: new Date().toISOString(),
    firstName: t.firstName ?? '',
    lastName: t.lastName ?? '',
    email,
    phone: t.phone ?? '',
    city: t.city ?? '',
    countryCode: t.countryCode ?? '',
    fbc: ctx.fbc,
    fbp: ctx.fbp,
    clientIp: ctx.clientIp,
    clientUserAgent: ctx.clientUserAgent,
    externalId: createHash('sha256').update(email.toLowerCase()).digest('hex'),
    eventSourceUrl: hostOnlyUrl(t.eventSourceUrl ?? ''),
    amount: 0,
    isTest: false,
    purchaseEventId: '',
    utmSource: t.utm_source ?? '',
    utmMedium: t.utm_medium ?? '',
    utmCampaign: t.utm_campaign ?? '',
    utmContent: t.utm_content ?? '',
    utmTerm: t.utm_term ?? '',
    fbclid: t.fbclid ?? '',
  })
  console.log(`[register] leadId=${leadId} Pabbly ${r.ok ? 'sent' : 'error'} (${r.status})`)
  return json(200, { ok: true, pabbly: r.ok ? 'sent' : 'error' })
}

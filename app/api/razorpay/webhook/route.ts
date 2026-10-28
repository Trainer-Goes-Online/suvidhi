import { createHmac, createHash, timingSafeEqual } from 'node:crypto'
import { sendSalesEvent } from '@/lib/server/metaCapi'
import { sendPabblyRow } from '@/lib/server/pabbly'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Razorpay webhook — THE tracking authority for completed purchases.
 *
 * WHY THIS EXISTS: previously Pabbly + Meta CAPI fired from /api/razorpay/verify,
 * which only runs if the buyer's browser comes back from the Razorpay modal. UPI
 * payers (GPay/PhonePe/Paytm) frequently complete payment inside the UPI app and
 * never return — Razorpay took the money and we recorded nothing. This route is
 * server-to-server, so it fires regardless of the browser.
 *
 * Pipeline: HMAC verify → event filter → kind gate → test gate → unpack notes →
 * fire the `sales` CAPI event + write the Pabbly CRM row.
 *
 * The conversion event name (`sales`), its event_id (= payment_id), the
 * external_id formula (sha256(email)) and the 32-column Pabbly payload are all
 * preserved byte-for-byte from the old verify route — only the TRIGGER moved.
 */

const KIND_SENTINEL = 'client_funnel'

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}

function safeParse<T>(raw: unknown): T | Record<string, never> {
  if (typeof raw !== 'string' || !raw) return {}
  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? (parsed as T) : {}
  } catch {
    return {}
  }
}

function str(v: unknown): string {
  return typeof v === 'string' ? v : ''
}

interface CustBlob {
  fn?: string
  ln?: string
  em?: string
  ph?: string
  ct?: string
  co?: string
}
interface UtmBlob {
  s?: string
  m?: string
  c?: string
  n?: string
  t?: string
}

export async function POST(req: Request): Promise<Response> {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET ?? ''
  if (!secret || secret.includes('REPLACE_ME')) {
    console.error('[webhook] RAZORPAY_WEBHOOK_SECRET not configured')
    return json(500, { ok: false, error: 'webhook_secret_not_configured' })
  }

  // 1) HMAC verify — MUST use the raw body bytes, never a re-serialised object.
  const rawBody = await req.text()
  const signature = req.headers.get('x-razorpay-signature') ?? ''
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex')

  const a = createHash('sha256').update(expected).digest()
  const b = createHash('sha256').update(signature).digest()
  if (!signature || !timingSafeEqual(a, b)) {
    console.error('[webhook] invalid signature')
    return json(400, { ok: false, error: 'invalid_signature' })
  }
  console.log('[webhook] signature verified')

  // 2) Event filter
  let evt: Record<string, unknown> = {}
  try {
    evt = JSON.parse(rawBody) as Record<string, unknown>
  } catch {
    return json(400, { ok: false, error: 'bad_json' })
  }
  const eventName = str(evt.event)
  if (eventName !== 'payment.captured') {
    return json(200, { ok: true, ignored: true, reason: 'event_not_captured', event: eventName })
  }

  // 3) Payment entity
  const payload = (evt.payload ?? {}) as Record<string, unknown>
  const paymentWrap = (payload.payment ?? {}) as Record<string, unknown>
  const payment = (paymentWrap.entity ?? null) as Record<string, unknown> | null
  if (!payment) {
    return json(400, { ok: false, error: 'no_payment_entity' })
  }
  const paymentId = str(payment.id)

  // 4) Kind gate — this merchant account may receive payments from other
  //    sources (payment links, invoices, other funnels). Only ours carry the
  //    sentinel that create-order stamps onto the order notes.
  const notes = (payment.notes ?? {}) as Record<string, unknown>
  const kind = str(notes.kind)
  if (kind !== KIND_SENTINEL) {
    console.log(`[webhook] paymentId=${paymentId} ignored: kind_mismatch (${kind || 'none'})`)
    return json(200, { ok: true, ignored: true, reason: 'kind_mismatch', kind })
  }
  console.log(`[webhook] paymentId=${paymentId} kind matched: ${KIND_SENTINEL}`)

  // 5) Unpack the packed notes
  const cust = safeParse<CustBlob>(notes.cust)
  const utm = safeParse<UtmBlob>(notes.utm)
  const isTest = str(notes.tst) === '1'
  const fbc = str(notes.fbc)
  const fbp = str(notes.fbp)
  const clientIp = str(notes.ip)
  const clientUserAgent = str(notes.ua)
  const eventSourceUrl = str(notes.esu)
  const fbclid = str(notes.clid)

  // 6) Server-derived fields
  const rawAmount = payment.amount
  const amountPaise =
    typeof rawAmount === 'number' ? rawAmount : Number(str(rawAmount) || '0')
  const amount = Math.round((Number.isFinite(amountPaise) ? amountPaise : 0) / 100)
  const currency = str(payment.currency) || 'INR'
  const createdAtSec =
    typeof payment.created_at === 'number' ? payment.created_at : Math.floor(Date.now() / 1000)
  const createdAt = new Date(createdAtSec * 1000).toISOString()
  const email = (cust.em ?? '').trim()

  // 7) Meta CAPI — the SAME custom `sales` event as before (never `Purchase`).
  //    Skipped for test orders, exactly like the old verify-route behaviour.
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? ''
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN ?? ''
  const testCodeRaw = process.env.NEXT_PUBLIC_META_TEST_EVENT_CODE ?? ''
  const testEventCode = testCodeRaw && testCodeRaw !== '0' ? testCodeRaw : undefined

  let capi: 'sent' | 'skipped' | 'error' = 'skipped'
  const capiConfigured =
    pixelId && !pixelId.includes('REPLACE_ME') && accessToken && !accessToken.includes('REPLACE_ME')

  if (!isTest && capiConfigured && email) {
    const r = await sendSalesEvent({
      pixelId,
      accessToken,
      testEventCode,
      eventName: 'sales',
      paymentId,
      email,
      phone: cust.ph,
      firstName: cust.fn,
      lastName: cust.ln,
      city: cust.ct,
      countryCode: cust.co,
      eventSourceUrl,
      fbc,
      fbp,
      clientIp,
      clientUserAgent,
      valueRupees: amount,
      currency,
    })
    capi = r.ok ? 'sent' : 'error'
    console.log(
      r.ok
        ? `[webhook] paymentId=${paymentId} Meta CAPI sent (sales)`
        : `[webhook] paymentId=${paymentId} Meta CAPI error ${r.status} ${r.body.slice(0, 200)}`,
    )
  } else {
    console.log(
      `[webhook] paymentId=${paymentId} Meta CAPI skipped (isTest=${isTest} configured=${!!capiConfigured} email=${!!email})`,
    )
  }

  // 8) Pabbly — identical 32-column payload to the old verify route.
  const pabblyUrl = process.env.NEXT_PUBLIC_PABBLY_WEBHOOK_URL ?? ''
  let pabbly: 'sent' | 'skipped' | 'error' = 'skipped'
  if (pabblyUrl) {
    const r = await sendPabblyRow(pabblyUrl, {
      leadId: paymentId,
      createdAt,
      firstName: cust.fn ?? '',
      lastName: cust.ln ?? '',
      email: cust.em ?? '',
      phone: cust.ph ?? '',
      city: cust.ct ?? '',
      countryCode: cust.co ?? '',
      fbc,
      fbp,
      clientIp,
      clientUserAgent,
      externalId: email ? createHash('sha256').update(email.toLowerCase()).digest('hex') : '',
      eventSourceUrl,
      amount,
      isTest,
      purchaseEventId: paymentId,
      utmSource: utm.s ?? '',
      utmMedium: utm.m ?? '',
      utmCampaign: utm.c ?? '',
      utmContent: utm.n ?? '',
      utmTerm: utm.t ?? '',
      fbclid,
    })
    pabbly = r.ok ? 'sent' : 'error'
    console.log(`[webhook] paymentId=${paymentId} Pabbly ${pabbly} (${r.status})`)
  }

  return json(200, { ok: true, paymentId, kind: KIND_SENTINEL, pabbly, capi })
}

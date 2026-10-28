import {
  sendInitiateCheckoutEvent,
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

interface IcCustomer {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  city?: string
  countryCode?: string
  amount?: number
}

/**
 * Fires Meta `InitiateCheckout` — triggered from the checkout submit handler
 * ONLY after client-side validation passes and immediately before the
 * create-order call. The free/coupon QA path never reaches here.
 *
 * Carries the full 11 matching signals (EMQ 9+). Never blocks payment: the
 * client ignores the outcome apart from stamping its dedup flag on success.
 */
export async function POST(req: Request): Promise<Response> {
  let body: Record<string, unknown> = {}
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    body = {}
  }

  const customer = (body.customer ?? {}) as IcCustomer
  const email = (customer.email ?? '').trim()
  if (!email) {
    return json(400, { ok: false, error: 'missing_email' })
  }

  if (!isTrackingEnabled()) {
    return json(200, { ok: true, skipped: 'test_mode' })
  }

  const creds = metaCreds()
  if (!creds) {
    console.log('[ic] skipped: env_missing')
    return json(200, { ok: true, skipped: 'env_missing' })
  }

  const ctx = getClientContext(req)
  const eventSourceUrl =
    typeof body.eventSourceUrl === 'string' ? body.eventSourceUrl : undefined

  const result = await sendInitiateCheckoutEvent({
    pixelId: creds.pixelId,
    accessToken: creds.accessToken,
    testEventCode: creds.testEventCode,
    email,
    phone: customer.phone,
    firstName: customer.firstName,
    lastName: customer.lastName,
    city: customer.city,
    countryCode: customer.countryCode,
    fbc: ctx.fbc,
    fbp: ctx.fbp,
    clientIp: ctx.clientIp,
    clientUserAgent: ctx.clientUserAgent,
    eventSourceUrl,
    value: customer.amount,
  })

  if (result.ok) {
    console.log('[ic] InitiateCheckout sent')
    return json(200, { ok: true, capi: 'sent' })
  }
  console.error('[ic] InitiateCheckout failed', result.status, result.body.slice(0, 300))
  return json(200, { ok: true, capi: 'error' })
}

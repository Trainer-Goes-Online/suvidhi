import { sendIcEvent, isTrackingEnabled, metaCreds } from '@/lib/server/metaEvents'
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

interface IcCustomer {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  city?: string
  countryCode?: string
}

/**
 * Fires the custom `ic_event` from /register, ONLY after client-side
 * validation passes:
 *   • free booking → just before the redirect to /confirmed
 *   • VIP upgrade  → just before the Razorpay order is created
 *
 * Carries the full 11 matching signals. `vip` picks the value server-side
 * (₹0 vs the VIP price) — the browser never supplies an amount.
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
    console.log('[ic_event] skipped: env_missing')
    return json(200, { ok: true, skipped: 'env_missing' })
  }

  const ctx = getClientContext(req, { fbc: str(body.fbc), fbp: str(body.fbp) })
  const result = await sendIcEvent(
    creds,
    ctx,
    {
      email,
      phone: customer.phone,
      firstName: customer.firstName,
      lastName: customer.lastName,
      city: customer.city,
      countryCode: customer.countryCode,
    },
    body.vip === true,
    str(body.eventSourceUrl),
  )

  if (result.ok) {
    console.log(`[ic_event] sent (${body.vip === true ? 'vip' : 'free'})`)
    return json(200, { ok: true, capi: 'sent' })
  }
  console.error('[ic_event] failed', result.status, result.body.slice(0, 300))
  return json(200, { ok: true, capi: 'error' })
}

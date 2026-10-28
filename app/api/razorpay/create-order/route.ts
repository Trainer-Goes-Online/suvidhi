import Razorpay from 'razorpay'
import { getClientContext } from '@/lib/server/requestContext'

// Razorpay's Node SDK is server-only — keep this handler on the Node runtime
// and never statically cached.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? ''
const keySecret = process.env.RAZORPAY_KEY_SECRET ?? ''

// One client per server boot, reused across requests. Null until real
// credentials are present.
const rp =
  keyId && keySecret && !keyId.includes('REPLACE_ME') && !keySecret.includes('REPLACE_ME')
    ? new Razorpay({ key_id: keyId, key_secret: keySecret })
    : null

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}

/** Razorpay caps notes at 15 keys / 256 chars per value. Never send more. */
function trunc(v: unknown, max = 256): string {
  const s = typeof v === 'string' ? v : ''
  return s.length > max ? s.slice(0, max) : s
}

interface CustomerIn {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  city?: string
  countryCode?: string
}
interface UtmIn {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
}

export async function POST(req: Request): Promise<Response> {
  if (!rp) {
    return json(500, {
      error:
        'Razorpay credentials not configured. Add NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env and restart `npm run dev`.',
      code: 'KEY_NOT_CONFIGURED',
    })
  }

  let body: Record<string, unknown> = {}
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    body = {}
  }

  const amountRupees =
    typeof body.amount === 'number' && body.amount > 0 ? (body.amount as number) : 0
  if (amountRupees <= 0) {
    return json(400, {
      error: 'amount must be > 0 (in INR major units)',
      code: 'INVALID_AMOUNT',
    })
  }

  // ── Pack everything the webhook will need into order.notes ──────────────
  // Razorpay copies order notes onto the payment entity, so the webhook (which
  // has no browser context at all) reads identity + attribution from here.
  // Budget: 15 keys / 256 chars each → customer + UTM go in JSON blobs.
  const customer = (body.customer ?? {}) as CustomerIn
  const utm = (body.utm ?? {}) as UtmIn
  const ctx = getClientContext(req)

  // Canonical checkout URL — never window.location.href: real URLs blow past
  // 256 chars with the query string. UTMs are preserved in the `utm` note, and
  // event_source_url is metadata (not a matching signal), so no data is lost.
  let esu = ''
  try {
    esu = `${new URL(req.url).origin}/checkout`
  } catch {
    esu = ''
  }

  const notes: Record<string, string> = {
    kind: 'client_funnel',
    cust: trunc(
      JSON.stringify({
        fn: customer.firstName ?? '',
        ln: customer.lastName ?? '',
        em: customer.email ?? '',
        ph: customer.phone ?? '',
        ct: customer.city ?? '',
        co: customer.countryCode ?? '',
      }),
    ),
    utm: trunc(
      JSON.stringify({
        s: utm.utm_source ?? '',
        m: utm.utm_medium ?? '',
        c: utm.utm_campaign ?? '',
        n: utm.utm_content ?? '',
        t: utm.utm_term ?? '',
      }),
    ),
    clid: trunc(body.fbclid),
    fbc: trunc(ctx.fbc),
    fbp: trunc(ctx.fbp),
    ip: trunc(ctx.clientIp, 45),
    ua: trunc(ctx.clientUserAgent),
    esu: trunc(esu),
    tst: body.isTest === true ? '1' : '0',
  }

  try {
    const order = await rp.orders.create({
      amount: Math.round(amountRupees * 100), // paise
      currency: (body.currency as string) ?? 'INR',
      receipt: body.receipt as string | undefined,
      notes,
    })
    return json(200, order)
  } catch (e) {
    // Razorpay SDK errors carry { statusCode, error: { code, description, ... } }
    const err = e as {
      statusCode?: number
      error?: {
        code?: string
        description?: string
        source?: string
        step?: string
        reason?: string
      }
    }
    console.error('[razorpay] order create failed', err)
    return json(err.statusCode ?? 500, {
      error: err.error?.description ?? String(e),
      code: err.error?.code,
      source: err.error?.source,
      step: err.error?.step,
      reason: err.error?.reason,
      raw: err.error,
    })
  }
}

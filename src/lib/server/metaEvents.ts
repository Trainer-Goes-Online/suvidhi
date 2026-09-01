/**
 * Server-side Meta CAPI — the two UPPER-funnel intent events.
 *
 *   • AddToCart        — landing-page CTA click (no PII available yet)
 *   • InitiateCheckout — checkout Pay click on a validated form (full 11 signals)
 *
 * These are STANDARD Meta event names: this dataset is NOT in a restricted
 * (Health & Wellness) category, so standard names + full hashed PII are allowed.
 * The bottom-of-funnel conversion event stays exactly as it is (custom `sales`
 * in metaCapi.ts) — deliberately unchanged.
 *
 * Fired from our own API routes, triggered by a browser action. Completely
 * independent of the Razorpay webhook (which owns the conversion event).
 * The browser still fires PageView only — no fbq('track') for these.
 */

import crypto from 'node:crypto'

const GRAPH_API_VERSION_DEFAULT = 'v25.0'

function sha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex')
}

/**
 * The funnel-entry price (₹97 call). AddToCart and InitiateCheckout both fire
 * BEFORE the buyer commits to a plan on /oto, so the call price — not the
 * bundle price — is the correct value to report on those events.
 *
 * Kept as its own reader (rather than importing src/lib/config) because that
 * module is client-side and Next only inlines NEXT_PUBLIC_* for the browser
 * bundle; on the server we read process.env directly.
 */
function entryPrice(): number {
  const price = Number(process.env.NEXT_PUBLIC_CALL_PRICE_INR ?? '')
  // Falls back to the same 97 default as PLANS.call in src/lib/config.ts, so an
  // unset env var behaves identically on the server and in the browser.
  return Number.isFinite(price) && price > 0 ? price : 97
}

/** Test-mode gate — mirrors the funnel's `plan.price <= 1` convention. */
export function isTrackingEnabled(): boolean {
  return entryPrice() > 1
}

export function metaCreds(): { pixelId: string; accessToken: string; testEventCode?: string } | null {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? ''
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN ?? ''
  if (!pixelId || pixelId.includes('REPLACE_ME')) return null
  if (!accessToken || accessToken.includes('REPLACE_ME')) return null
  const raw = process.env.NEXT_PUBLIC_META_TEST_EVENT_CODE ?? ''
  return {
    pixelId,
    accessToken,
    testEventCode: raw && raw !== '0' ? raw : undefined,
  }
}

function offerValue(): number {
  return entryPrice()
}

function contentBlock() {
  return {
    content_ids: ['postpartum_restore'],
    // Fallback matches OFFER.name in src/lib/config.ts so an unset env var
    // reports the same product name on the server and in the browser.
    content_name:
      process.env.NEXT_PUBLIC_OFFER_NAME || 'Postpartum Recovery Roadmap Call',
    content_type: 'product',
  }
}

export interface CapiResult {
  ok: boolean
  status: number
  body: string
}

async function postToMeta(
  pixelId: string,
  accessToken: string,
  payload: Record<string, unknown>,
): Promise<CapiResult> {
  const apiVersion = process.env.META_GRAPH_API_VERSION || GRAPH_API_VERSION_DEFAULT
  const url =
    `https://graph.facebook.com/${apiVersion}/${pixelId}/events` +
    `?access_token=${encodeURIComponent(accessToken)}`
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const body = await res.text()
    return { ok: res.ok, status: res.status, body }
  } catch (err) {
    return { ok: false, status: 0, body: String(err) }
  }
}

// ─────────────────────────────────────────────────────────────────────
// AddToCart — no PII exists at CTA-click time. Expected EMQ ~3–5.
// ─────────────────────────────────────────────────────────────────────

export interface AddToCartInput {
  pixelId: string
  accessToken: string
  testEventCode?: string
  fbc?: string
  fbp?: string
  clientIp?: string
  clientUserAgent?: string
  eventSourceUrl?: string
}

export async function sendAddToCartEvent(input: AddToCartInput): Promise<CapiResult> {
  const userData: Record<string, unknown> = {}
  if (input.fbc) userData.fbc = input.fbc
  if (input.fbp) userData.fbp = input.fbp
  if (input.clientIp) userData.client_ip_address = input.clientIp
  if (input.clientUserAgent) userData.client_user_agent = input.clientUserAgent

  // Deterministic per browser so Meta collapses accidental duplicates (48h).
  const eventId = input.fbp
    ? sha256(`${input.fbp}|atc`)
    : `${crypto.randomBytes(8).toString('hex')}_atc`

  const event: Record<string, unknown> = {
    event_name: 'AddToCart',
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId,
    action_source: 'website',
    user_data: userData,
    custom_data: {
      currency: 'INR',
      value: offerValue(),
      ...contentBlock(),
    },
  }
  if (input.eventSourceUrl) event.event_source_url = input.eventSourceUrl

  const payload: Record<string, unknown> = { data: [event] }
  if (input.testEventCode) payload.test_event_code = input.testEventCode

  return postToMeta(input.pixelId, input.accessToken, payload)
}

// ─────────────────────────────────────────────────────────────────────
// InitiateCheckout — full 11 signals. Expected EMQ 9+.
// ─────────────────────────────────────────────────────────────────────

export interface InitiateCheckoutInput {
  pixelId: string
  accessToken: string
  testEventCode?: string
  email: string
  phone?: string
  firstName?: string
  lastName?: string
  city?: string
  /** 2-letter ISO. */
  countryCode?: string
  fbc?: string
  fbp?: string
  clientIp?: string
  clientUserAgent?: string
  eventSourceUrl?: string
  /** Rupees (major units). */
  value?: number
}

export async function sendInitiateCheckoutEvent(
  input: InitiateCheckoutInput,
): Promise<CapiResult> {
  const email = input.email.trim().toLowerCase()
  const hashedEmail = email ? sha256(email) : undefined
  const phoneDigits = (input.phone ?? '').replace(/\D/g, '')
  const fn = (input.firstName ?? '').trim().toLowerCase()
  const ln = (input.lastName ?? '').trim().toLowerCase()
  const ct = (input.city ?? '').trim().toLowerCase().replace(/[^a-z]/g, '')
  const country = (input.countryCode ?? '').trim().toLowerCase()

  const userData: Record<string, unknown> = {}
  if (hashedEmail) {
    userData.em = [hashedEmail]
    // Same derivation as the `sales` conversion event + browser MAM cookie, so
    // Meta resolves one stable identity across every event we send.
    userData.external_id = [hashedEmail]
  }
  if (phoneDigits) userData.ph = [sha256(phoneDigits)]
  if (fn) userData.fn = [sha256(fn)]
  if (ln) userData.ln = [sha256(ln)]
  if (ct) userData.ct = [sha256(ct)]
  if (country) userData.country = [sha256(country)]
  if (input.fbc) userData.fbc = input.fbc
  if (input.fbp) userData.fbp = input.fbp
  if (input.clientIp) userData.client_ip_address = input.clientIp
  if (input.clientUserAgent) userData.client_user_agent = input.clientUserAgent

  const event: Record<string, unknown> = {
    event_name: 'InitiateCheckout',
    event_time: Math.floor(Date.now() / 1000),
    // Same real user → same event_id, even across devices/sessions.
    event_id: sha256(`${email}|ic`),
    action_source: 'website',
    user_data: userData,
    custom_data: {
      currency: 'INR',
      value: typeof input.value === 'number' && input.value > 0 ? input.value : offerValue(),
      ...contentBlock(),
    },
  }
  if (input.eventSourceUrl) event.event_source_url = input.eventSourceUrl

  const payload: Record<string, unknown> = { data: [event] }
  if (input.testEventCode) payload.test_event_code = input.testEventCode

  return postToMeta(input.pixelId, input.accessToken, payload)
}

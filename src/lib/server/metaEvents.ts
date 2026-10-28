/**
 * Server-side Meta CAPI — the three upper-funnel CUSTOM events.
 *
 *   • atc_event      — landing-page CTA click (heads to /register)
 *   • ic_event       — /register submitted: the free booking, or the VIP
 *                      upgrade right before Razorpay opens
 *   • schedule_event — Calendly reports the Roadmap Call is booked
 *
 * Custom names, not AddToCart / InitiateCheckout / Schedule: this is a
 * postpartum funnel, and custom events keep it clear of Meta's Health &
 * Wellness restrictions on standard event names (same posture as the `sales`
 * conversion event in metaCapi.ts, which is unchanged).
 *
 * EMQ: every event carries every signal available at that moment —
 * em/ph/fn/ln/ct/country/external_id (hashed), plus fbc/fbp/IP/UA (raw).
 * When the form values are not in hand, the hashed identity from the
 * first-party `svd_mam` cookie fills the gap (see requestContext.ts).
 *
 * The browser still fires PageView only — no fbq('track') for these.
 */

import crypto from 'node:crypto'
import type { ClientContext } from './requestContext'

const GRAPH_API_VERSION_DEFAULT = 'v25.0'

function sha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex')
}

/**
 * The VIP upgrade price — the only paid thing in the funnel now that the
 * Roadmap Call is free. Read from process.env directly because src/lib/config
 * is client-side; the 497 fallback matches PLANS.bundle there.
 */
export function vipPrice(): number {
  const price = Number(process.env.NEXT_PUBLIC_BUNDLE_PRICE_INR ?? '')
  return Number.isFinite(price) && price > 0 ? price : 497
}

/** Test-mode gate — mirrors the funnel's `price <= 1` convention. */
export function isTrackingEnabled(): boolean {
  return vipPrice() > 1
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
  creds: { pixelId: string; accessToken: string; testEventCode?: string },
  event: Record<string, unknown>,
): Promise<CapiResult> {
  const payload: Record<string, unknown> = { data: [event] }
  if (creds.testEventCode) payload.test_event_code = creds.testEventCode

  const apiVersion = process.env.META_GRAPH_API_VERSION || GRAPH_API_VERSION_DEFAULT
  const url =
    `https://graph.facebook.com/${apiVersion}/${creds.pixelId}/events` +
    `?access_token=${encodeURIComponent(creds.accessToken)}`
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
// user_data — raw identity wins, the hashed cookie fills whatever is missing
// ─────────────────────────────────────────────────────────────────────

export interface RawIdentity {
  email?: string
  phone?: string
  firstName?: string
  lastName?: string
  city?: string
  /** 2-letter ISO. */
  countryCode?: string
}

/**
 * Normalises + hashes per Meta's spec. Phone is digits-only WITH the country
 * code (E.164 minus the "+"), which is what react-phone-number-input yields.
 * external_id = sha256(email) everywhere — the same derivation as the `sales`
 * event, the browser MAM cookie and the Pabbly row, so Meta resolves one
 * person across every event.
 */
function buildUserData(raw: RawIdentity, ctx: ClientContext): Record<string, unknown> {
  const hashed: Record<string, string> = { ...ctx.hashedIdentity }

  const email = (raw.email ?? '').trim().toLowerCase()
  const phone = (raw.phone ?? '').replace(/\D/g, '')
  const fn = (raw.firstName ?? '').trim().toLowerCase()
  const ln = (raw.lastName ?? '').trim().toLowerCase()
  const ct = (raw.city ?? '').trim().toLowerCase().replace(/[^a-z]/g, '')
  const country = (raw.countryCode ?? '').trim().toLowerCase()

  if (email) {
    hashed.em = sha256(email)
    hashed.external_id = hashed.em
  }
  if (phone) hashed.ph = sha256(phone)
  if (fn) hashed.fn = sha256(fn)
  if (ln) hashed.ln = sha256(ln)
  if (ct) hashed.ct = sha256(ct)
  if (country) hashed.country = sha256(country)

  const userData: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(hashed)) userData[k] = [v]
  if (ctx.fbc) userData.fbc = ctx.fbc
  if (ctx.fbp) userData.fbp = ctx.fbp
  if (ctx.clientIp) userData.client_ip_address = ctx.clientIp
  if (ctx.clientUserAgent) userData.client_user_agent = ctx.clientUserAgent
  return userData
}

function customData(value: number): Record<string, unknown> {
  return { currency: 'INR', value, ...contentBlock() }
}

function baseEvent(
  name: string,
  eventId: string,
  userData: Record<string, unknown>,
  data: Record<string, unknown>,
  eventSourceUrl?: string,
): Record<string, unknown> {
  const event: Record<string, unknown> = {
    event_name: name,
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId,
    action_source: 'website',
    user_data: userData,
    custom_data: data,
  }
  if (eventSourceUrl) event.event_source_url = eventSourceUrl
  return event
}

type Creds = NonNullable<ReturnType<typeof metaCreds>>

// ─────────────────────────────────────────────────────────────────────
// atc_event — landing CTA click. No form yet, so EMQ leans on fbc/fbp/IP/UA,
// plus the hashed cookie identity for anyone who has registered before.
// ─────────────────────────────────────────────────────────────────────

export async function sendAtcEvent(
  creds: Creds,
  ctx: ClientContext,
  eventSourceUrl?: string,
): Promise<CapiResult> {
  // Deterministic per browser so Meta collapses accidental duplicates (48h).
  const eventId = ctx.fbp
    ? sha256(`${ctx.fbp}|atc_event`)
    : `${crypto.randomBytes(8).toString('hex')}_atc_event`
  const event = baseEvent(
    'atc_event',
    eventId,
    buildUserData({}, ctx),
    customData(0),
    eventSourceUrl,
  )
  return postToMeta(creds, event)
}

// ─────────────────────────────────────────────────────────────────────
// ic_event — /register submitted on a valid form. Full identity in hand.
// ─────────────────────────────────────────────────────────────────────

export async function sendIcEvent(
  creds: Creds,
  ctx: ClientContext,
  identity: RawIdentity,
  vip: boolean,
  eventSourceUrl?: string,
): Promise<CapiResult> {
  const email = (identity.email ?? '').trim().toLowerCase()
  // Same person + same path → same event_id, even across devices. Free and
  // VIP are different intents, so each gets its own id.
  const eventId = sha256(`${email}|ic_event|${vip ? 'vip' : 'free'}`)
  const event = baseEvent(
    'ic_event',
    eventId,
    buildUserData(identity, ctx),
    // Value is set server-side from the path, never trusted from the browser.
    customData(vip ? vipPrice() : 0),
    eventSourceUrl,
  )
  return postToMeta(creds, event)
}

// ─────────────────────────────────────────────────────────────────────
// schedule_event — Calendly booking confirmed. Identity comes from the
// /register hand-off, with the hashed cookie as a fallback.
// ─────────────────────────────────────────────────────────────────────

export async function sendScheduleEvent(
  creds: Creds,
  ctx: ClientContext,
  identity: RawIdentity,
  /** Calendly invitee UUID — one booking, one event, however it reaches us. */
  inviteeId: string,
  eventSourceUrl?: string,
): Promise<CapiResult> {
  const email = (identity.email ?? '').trim().toLowerCase()
  const eventId = inviteeId
    ? sha256(`schedule_event|${inviteeId}`)
    : sha256(`${email || ctx.hashedIdentity.em || ctx.fbp}|schedule_event`)
  const event = baseEvent(
    'schedule_event',
    eventId,
    buildUserData(identity, ctx),
    // Zero: any VIP money is already reported by the `sales` event.
    customData(0),
    eventSourceUrl,
  )
  return postToMeta(creds, event)
}

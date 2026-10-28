'use client'

/**
 * Client-side TRIGGERS for the three upper-funnel custom Meta events. The
 * client's only job is to tell the server "this happened" — all hashing and
 * the actual Graph API POST happen server-side (src/lib/server/metaEvents.ts).
 *
 *   atc_event      — landing CTA click → /register
 *   ic_event       — /register submitted (free booking, or VIP before payment)
 *   schedule_event — Calendly booking confirmed
 *
 * No `fbq('track', …)` here: the browser still fires PageView only.
 *
 * Dedup is two-layer:
 *   1. localStorage flag (this file) — stops repeat sends from one browser.
 *   2. Meta's deterministic `event_id` dedup (server) — 48h safety net.
 */

import { trackGa4EventOnce } from './ga4'
import { getFbCookies } from './utm'

const ATC_KEY = 'svd_atc_fired'
const IC_KEY = 'svd_ic_fired'
const SCHEDULE_KEY = 'svd_schedule_fired'

/** Where every landing CTA now sends the visitor. */
export const REGISTER_PATH = '/register'

/**
 * The single entry point for every landing CTA that advances to /register.
 * Fires `atc_event` + GA4 `add_to_cart`, each once per browser.
 *
 * GATED ON DESTINATION: in-page scroll links (e.g. href="#offer-card") fire
 * neither event. Never blocks the click — navigation proceeds regardless.
 */
export function trackCheckoutCtaClick(destination: string): void {
  if (!destination || !destination.startsWith(REGISTER_PATH)) return
  fireAddToCartOnce()
  trackGa4EventOnce('add_to_cart')
}

/** SHA-256 hex via Web Crypto (HTTPS + http://localhost). */
async function sha256Hex(value: string): Promise<string> {
  if (typeof crypto === 'undefined' || !crypto.subtle) return value
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function readFlag(key: string): string {
  try {
    return window.localStorage.getItem(key) ?? ''
  } catch {
    return ''
  }
}

function writeFlag(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    /* private mode — best-effort */
  }
}

/**
 * POST that survives the navigation right behind it. sendBeacon first (the
 * browser guarantees delivery after unload); keepalive fetch otherwise.
 */
function beacon(url: string, payload: Record<string, unknown>): void {
  const body = JSON.stringify(payload)
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      if (navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }))) return
    }
  } catch {
    /* fall through to fetch */
  }
  void fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {})
}

/**
 * atc_event — fires on the FIRST landing-CTA click of this browser's lifetime.
 *
 * The flag is stamped OPTIMISTICALLY (before the beacon leaves) so a tab-kill
 * mid-navigation still can't double-fire. Sends the browser's fbc/fbp too: on
 * a first visit the pixel may not have written its cookies yet, but an fbc
 * rebuilt from the ad click's fbclid already exists.
 */
export function fireAddToCartOnce(): void {
  try {
    if (typeof window === 'undefined') return
    if (readFlag(ATC_KEY) === '1') return
    writeFlag(ATC_KEY, '1')
    beacon('/api/meta/add-to-cart', {
      eventSourceUrl: window.location.href,
      ...getFbCookies(),
    })
  } catch {
    /* never break the click */
  }
}

export interface MetaCustomer {
  firstName?: string
  lastName?: string
  email: string
  phone?: string
  city?: string
  /** 2-letter ISO (e.g. "IN"). */
  countryCode?: string
}

/**
 * ic_event — fires ONLY once the /register form passed validation:
 *   • free booking → right before the redirect to /confirmed
 *   • VIP upgrade  → right before the Razorpay order is created
 *
 * Deduped per EMAIL + PATH per browser: a different email, or switching from
 * free to VIP, is genuinely new intent and fires fresh. Delivered as a beacon
 * so the redirect that follows can never cancel it. Never blocks the user.
 */
export async function fireInitiateCheckoutOnce(
  customer: MetaCustomer,
  vip: boolean,
): Promise<void> {
  try {
    if (typeof window === 'undefined') return
    const email = (customer.email ?? '').trim().toLowerCase()
    if (!email) return

    const key = await sha256Hex(`${email}|${vip ? 'vip' : 'free'}`)
    if (readFlag(IC_KEY) === key) return
    writeFlag(IC_KEY, key)

    beacon('/api/meta/initiate-checkout', {
      customer,
      vip,
      eventSourceUrl: window.location.href,
      ...getFbCookies(),
    })
  } catch {
    /* never block the booking */
  }
}

/**
 * schedule_event — fires when Calendly confirms the booking. `inviteeId` (the
 * Calendly invitee UUID) is the dedup key here and on the server, so the
 * embed callback and the /thank-you fallback can never count one booking
 * twice. Identity is whatever /register handed forward; the server tops it up
 * from the hashed svd_mam cookie.
 */
export function fireScheduleOnce(
  customer: Partial<MetaCustomer>,
  inviteeId: string,
): void {
  try {
    if (typeof window === 'undefined') return
    const key = inviteeId || (customer.email ?? '').trim().toLowerCase() || 'unknown'
    const fired = readFlag(SCHEDULE_KEY).split(',')
    if (fired.includes(key)) return
    writeFlag(SCHEDULE_KEY, [...fired.filter(Boolean).slice(-9), key].join(','))

    beacon('/api/meta/schedule', {
      customer,
      inviteeId,
      eventSourceUrl: window.location.href,
      ...getFbCookies(),
    })
  } catch {
    /* analytics must never break the booking screen */
  }
}

/** Pulls the invitee UUID off a Calendly invitee URI (…/invitees/<uuid>). */
export function calendlyInviteeId(uri: unknown): string {
  if (typeof uri !== 'string') return ''
  const m = uri.match(/invitees\/([A-Za-z0-9-]+)/)
  return m ? m[1] : ''
}

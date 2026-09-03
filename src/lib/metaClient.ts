'use client'

/**
 * Client-side TRIGGERS for the two upper-funnel Meta events. The client's only
 * job is to tell the server "this happened" — all hashing and the actual Graph
 * API POST happen server-side (see src/lib/server/metaEvents.ts).
 *
 * No `fbq('track', …)` here: the browser still fires PageView only.
 *
 * Dedup is two-layer:
 *   1. localStorage flag (this file) — one event per browser lifetime.
 *   2. Meta's deterministic `event_id` dedup (server) — 48h safety net.
 */

import { trackGa4EventOnce } from './ga4'
import type { PlanId } from './config'

const ATC_KEY = 'svd_atc_fired'
const IC_KEY = 'svd_ic_fired'
const OTO_ONLY_CALL_KEY = 'svd_only_call_fired'
const OTO_CALL_PLUS_KEY = 'svd_call_plus_course_fired'

/**
 * The single entry point for every landing CTA that advances the funnel.
 * Fires Meta `AddToCart` + GA4 `add_to_cart`, each once per browser.
 *
 * GATED ON DESTINATION: the landing CTAs now head to the plan-selector at /oto
 * (not straight to /checkout), so the gate matches /oto. Any in-page scroll
 * link (e.g. href="#…") deliberately fires neither event.
 *
 * Never blocks the click — navigation proceeds regardless.
 */
export function trackCheckoutCtaClick(destination: string): void {
  if (!destination || !destination.startsWith('/oto')) return
  fireAddToCartOnce()
  trackGa4EventOnce('add_to_cart')
}

/**
 * OTO plan choice — fires when the buyer clicks Continue on /oto:
 *   call   → Meta `only_call`        + GA4 `only_call`
 *   bundle → Meta `call_plus_course` + GA4 `call_plus_course`
 *
 * Each event fires once per browser. Meta goes via a beacon so it survives the
 * navigation to /checkout; GA4 is synchronous. Never blocks the click.
 */
export function fireOtoChoice(plan: PlanId): void {
  try {
    if (typeof window === 'undefined') return
    const eventName = plan === 'bundle' ? 'call_plus_course' : 'only_call'

    // GA4 (dedups per event name internally).
    trackGa4EventOnce(eventName)

    // Meta — dedup per event name via localStorage, then beacon to the server.
    const key = plan === 'bundle' ? OTO_CALL_PLUS_KEY : OTO_ONLY_CALL_KEY
    let already = false
    try {
      already = window.localStorage.getItem(key) === '1'
    } catch {
      already = false
    }
    if (already) return
    try {
      window.localStorage.setItem(key, '1')
    } catch {
      /* private mode — best-effort */
    }

    const url = '/api/meta/oto-select'
    const body = JSON.stringify({ plan, eventSourceUrl: window.location.href })
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }))
      return
    }
    void fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {})
  } catch {
    /* never break the click */
  }
}

/** SHA-256 hex via Web Crypto (HTTPS + http://localhost). */
async function sha256Hex(value: string): Promise<string> {
  if (typeof crypto === 'undefined' || !crypto.subtle) return value
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * AddToCart — fires on the FIRST landing-CTA click of this browser's lifetime.
 *
 * Uses sendBeacon so the request survives the navigation that immediately
 * follows the click. The flag is stamped OPTIMISTICALLY (before the beacon
 * leaves) so a tab-kill mid-navigation still can't double-fire.
 * Never blocks the click.
 */
export function fireAddToCartOnce(): void {
  try {
    if (typeof window === 'undefined') return

    let alreadyFired = false
    try {
      alreadyFired = window.localStorage.getItem(ATC_KEY) === '1'
    } catch {
      alreadyFired = false
    }
    if (alreadyFired) return

    try {
      window.localStorage.setItem(ATC_KEY, '1')
    } catch {
      /* private mode — best-effort */
    }

    const url = '/api/meta/add-to-cart'
    const body = JSON.stringify({ eventSourceUrl: window.location.href })

    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }))
      return
    }
    void fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {})
  } catch {
    /* never break the click */
  }
}

export interface IcCustomer {
  firstName?: string
  lastName?: string
  email: string
  phone?: string
  city?: string
  /** 2-letter ISO (e.g. "IN"). */
  countryCode?: string
  amount?: number
}

/**
 * InitiateCheckout — fires ONLY when the checkout form passed validation and we
 * are about to create the Razorpay order (paid path only; never the free/coupon
 * QA path).
 *
 * Deduped per EMAIL per browser: retrying with a different email is genuinely
 * different intent and fires fresh. The flag is set only on a successful POST,
 * so a failed attempt can retry. Never blocks payment.
 */
export async function fireInitiateCheckoutOnce(customer: IcCustomer): Promise<void> {
  try {
    if (typeof window === 'undefined') return
    const email = (customer.email ?? '').trim().toLowerCase()
    if (!email) return

    const emailHash = await sha256Hex(email)

    let already = ''
    try {
      already = window.localStorage.getItem(IC_KEY) ?? ''
    } catch {
      already = ''
    }
    if (already === emailHash) return

    const res = await fetch('/api/meta/initiate-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer,
        eventSourceUrl: window.location.href,
      }),
    })

    if (res.ok) {
      try {
        window.localStorage.setItem(IC_KEY, emailHash)
      } catch {
        /* private mode — best-effort */
      }
    }
  } catch {
    /* never block payment */
  }
}

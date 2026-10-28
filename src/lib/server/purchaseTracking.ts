/**
 * Shared server-side purchase tracking — fires the custom `sales` CAPI event
 * (real orders only) and writes the Pabbly CRM row. Used by BOTH:
 *   • /api/razorpay/verify        — paid orders, after a valid HMAC signature
 *   • /api/track/free-order       — 100%-off coupon orders (Pabbly only)
 *
 * Neither path blocks the user response on a tracking failure — every task is
 * best-effort and errors are logged, not thrown.
 */

import crypto from 'node:crypto'
import { sendSalesEvent, hostOnlyUrl } from './metaCapi'
import { sendPabblyRow } from './pabbly'
import { getClientContext } from './requestContext'

export interface TrackingPayload {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  city?: string
  /** 2-letter ISO (e.g. "IN"). */
  countryCode?: string
  /** Amount in rupees (major units). */
  amount?: number
  isTest?: boolean
  eventSourceUrl?: string
  fbc?: string
  fbp?: string
  fbclid?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
}

function isPlaceholder(v: string): boolean {
  return !v || v.includes('REPLACE_ME')
}

function sha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex')
}

/**
 * @param fireCapi  whether to attempt the CAPI event. Real paid orders pass
 *                  true; the free/test path passes false (CAPI is also skipped
 *                  automatically for test orders / unconfigured pixel).
 */
export async function firePurchaseTracking(
  req: Request,
  paymentId: string,
  t: TrackingPayload,
  fireCapi: boolean,
): Promise<void> {
  const ctx = getClientContext(req, { fbc: t.fbc, fbp: t.fbp })
  const currency = 'INR'
  const amount = typeof t.amount === 'number' ? t.amount : 0
  const isTest = !!t.isTest

  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? ''
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN ?? ''
  const testEventCode = (() => {
    const v = process.env.NEXT_PUBLIC_META_TEST_EVENT_CODE ?? ''
    return v && v !== '0' ? v : undefined
  })()
  const pabblyUrl = process.env.NEXT_PUBLIC_PABBLY_WEBHOOK_URL ?? ''

  const tasks: Promise<unknown>[] = []

  // CAPI — real orders only, never test/free, never without a pixel + token.
  if (
    fireCapi &&
    !isTest &&
    !isPlaceholder(pixelId) &&
    !isPlaceholder(accessToken) &&
    !!t.email
  ) {
    tasks.push(
      sendSalesEvent({
        pixelId,
        accessToken,
        testEventCode,
        eventName: 'sales',
        paymentId,
        email: t.email,
        phone: t.phone,
        firstName: t.firstName,
        lastName: t.lastName,
        city: t.city,
        countryCode: t.countryCode,
        eventSourceUrl: t.eventSourceUrl,
        fbc: ctx.fbc,
        fbp: ctx.fbp,
        clientIp: ctx.clientIp,
        clientUserAgent: ctx.clientUserAgent,
        valueRupees: amount,
        currency,
      }).then((r) => {
        if (!r.ok) {
          console.error('[capi] sales event failed', r.status, r.body.slice(0, 300))
        }
      }),
    )
  }

  // Pabbly — write the CRM row for every order (test/free flagged via is_test).
  if (pabblyUrl) {
    const email = (t.email ?? '').trim().toLowerCase()
    tasks.push(
      sendPabblyRow(pabblyUrl, {
        leadId: paymentId,
        createdAt: new Date().toISOString(),
        firstName: t.firstName ?? '',
        lastName: t.lastName ?? '',
        email: t.email ?? '',
        phone: t.phone ?? '',
        city: t.city ?? '',
        countryCode: t.countryCode ?? '',
        fbc: ctx.fbc,
        fbp: ctx.fbp,
        clientIp: ctx.clientIp,
        clientUserAgent: ctx.clientUserAgent,
        externalId: email ? sha256(email) : '',
        eventSourceUrl: hostOnlyUrl(t.eventSourceUrl ?? ''),
        amount,
        isTest,
        purchaseEventId: paymentId,
        utmSource: t.utm_source ?? '',
        utmMedium: t.utm_medium ?? '',
        utmCampaign: t.utm_campaign ?? '',
        utmContent: t.utm_content ?? '',
        utmTerm: t.utm_term ?? '',
        fbclid: t.fbclid ?? '',
      }),
    )
  }

  await Promise.allSettled(tasks)
}

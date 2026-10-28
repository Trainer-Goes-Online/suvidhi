// Centralised access to runtime env variables.
//
// Next.js only exposes variables prefixed with NEXT_PUBLIC_ to the client
// bundle, and it inlines them by *static* `process.env.NEXT_PUBLIC_X` lookups
// at build time — dynamic `process.env[key]` access is NOT replaced. So every
// value below reads its own literal `process.env.NEXT_PUBLIC_…` key.
//
// Server-only secrets (e.g. RAZORPAY_KEY_SECRET) are deliberately NOT read
// here — they live only in the API route handlers.

function str(value: string | undefined, fallback = ''): string {
  return typeof value === 'string' && value.length > 0 ? value : fallback
}

function num(value: string | undefined, fallback: number): number {
  const v = str(value)
  if (!v) return fallback
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

function bool(value: string | undefined, fallback = false): boolean {
  const v = str(value).toLowerCase()
  if (!v) return fallback
  return v === '1' || v === 'true' || v === 'yes'
}

function inr(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`
}

export const BRAND = {
  name: str(process.env.NEXT_PUBLIC_BRAND_NAME, 'Suvidhi'),
  email: str(process.env.NEXT_PUBLIC_BRAND_EMAIL, 'innohealthbysush@gmail.com'),
  phone: str(process.env.NEXT_PUBLIC_BRAND_PHONE, '+919810880970'),
  phoneDisplay: str(process.env.NEXT_PUBLIC_BRAND_PHONE_DISPLAY, '+91 98108 80970'),
} as const

// ─── Locked naming (dev spec §1.5) ───────────────────────────────────
// Never "Dr." / "Dt.", never "The Postpartum Restore" as a ₹297 product.
export const NAMING = {
  clinician: 'Suvidhi Pandey',
  clinicianTitle: 'Clinical Nutritionist',
  programme: 'The 90-Day Postpartum Restore Programme',
  programmeShort: '90-Day Postpartum Restore Programme',
  mechanism: 'The 4-System Postpartum Check',
  call: 'Postpartum Recovery Roadmap Call',
  library: 'The Postpartum Restore Video Library',
} as const

// ─── Social proof, stated identically everywhere (dev spec §1.4) ─────
// ONE number the clinician can defend live on a call. Years in practice is a
// separate, non-competing stat — never blended into this count.
export const PROOF = {
  mothers: str(process.env.NEXT_PUBLIC_PROOF_MOTHERS, '200+'),
  rating: str(process.env.NEXT_PUBLIC_PROOF_RATING, '4.9'),
  yearsInPractice: str(process.env.NEXT_PUBLIC_PROOF_YEARS, '7'),
  avgRecoveryWeeks: str(process.env.NEXT_PUBLIC_PROOF_RECOVERY_WEEKS, '12wk'),
} as const

// The paid 90-day programme. Quoted in ONE place only (FAQ Q.07) — it is not
// sold on this page, the ₹97 call is.
export const PROGRAMME = {
  startingPrice: num(process.env.NEXT_PUBLIC_PROGRAMME_START_INR, 14500),
  get startingPriceLabel(): string {
    return inr(this.startingPrice)
  },
} as const

// ─── The two things that can actually be bought here ─────────────────
//
// PRICING MODEL: `bundle` is an ALL-IN price, not ₹97 + ₹497. Selecting the
// bundle on /oto replaces the ₹97 line rather than adding to it. Flip
// NEXT_PUBLIC_BUNDLE_PRICE_INR to 594 if it should ever become additive.
export type PlanId = 'call' | 'bundle'

export interface Plan {
  id: PlanId
  /** Amount actually charged, in INR major units. */
  price: number
  priceLabel: string
  /** Razorpay description + order-summary title. */
  name: string
  /** Short label for chips / breadcrumbs. */
  shortName: string
  /** Order-summary line items. */
  includes: readonly string[]
}

const CALL_PRICE = num(process.env.NEXT_PUBLIC_CALL_PRICE_INR, 97)
const BUNDLE_PRICE = num(process.env.NEXT_PUBLIC_BUNDLE_PRICE_INR, 497)

const CALL_INCLUDES = [
  'A 30-minute 1:1 Postpartum Recovery Roadmap Call with Suvidhi',
  'The 4-System Postpartum Check run against your own reports',
  'Your primary and secondary block identified, and what to do first',
] as const

export const PLANS: Record<PlanId, Plan> = {
  call: {
    id: 'call',
    price: CALL_PRICE,
    priceLabel: inr(CALL_PRICE),
    name: NAMING.call,
    shortName: 'Roadmap Call',
    includes: CALL_INCLUDES,
  },
  bundle: {
    id: 'bundle',
    price: BUNDLE_PRICE,
    priceLabel: inr(BUNDLE_PRICE),
    name: `${NAMING.call} + ${NAMING.library}`,
    shortName: 'Call + Video Library',
    includes: [
      ...CALL_INCLUDES,
      `${NAMING.library} — the amino acid meal framework, the 14-day circadian reset, the supplement absorption fixes and the hair-fall protocol`,
      'The private WhatsApp community of postpartum mothers',
      'Lifetime access, one payment — opens the moment your call ends',
    ],
  },
} as const

export const ADDON_ONLY_PRICE = Math.max(0, BUNDLE_PRICE - CALL_PRICE)
export const ADDON_ONLY_PRICE_LABEL = inr(ADDON_ONLY_PRICE)

/** Narrow anything (query param, sessionStorage blob) to a real plan. */
export function resolvePlan(value: unknown): Plan {
  return value === 'bundle' ? PLANS.bundle : PLANS.call
}

// Razorpay modal metadata + the currency every amount is charged in.
export const OFFER = {
  name: str(process.env.NEXT_PUBLIC_OFFER_NAME, NAMING.call),
  currency: str(process.env.NEXT_PUBLIC_OFFER_CURRENCY, 'INR'),
} as const

// The repeating CTA block's countdown (dev spec §1.3). A near-5-hour window
// reads as a daily offer; the old 15-minute timer read as a trick.
export const OFFER_WINDOW = {
  hours: num(process.env.NEXT_PUBLIC_OFFER_WINDOW_HOURS, 4),
  minutes: num(process.env.NEXT_PUBLIC_OFFER_WINDOW_MINUTES, 59),
  seconds: num(process.env.NEXT_PUBLIC_OFFER_WINDOW_SECONDS, 58),
} as const

export const COUPON = {
  code: str(process.env.NEXT_PUBLIC_TEST_COUPON_CODE, 'tgotest2025').toUpperCase(),
  discountPct: num(process.env.NEXT_PUBLIC_TEST_COUPON_DISCOUNT_PCT, 100),
} as const

export const RAZORPAY = {
  keyId: str(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, ''),
  companyName: str(process.env.NEXT_PUBLIC_RAZORPAY_COMPANY_NAME, 'InnoHealth · Suvidhi'),
  themeColor: str(process.env.NEXT_PUBLIC_RAZORPAY_THEME_COLOR, '#CB4A5D'),
} as const

export const CALENDLY = {
  url: str(process.env.NEXT_PUBLIC_CALENDLY_URL, ''),
  hideGdpr: bool(process.env.NEXT_PUBLIC_CALENDLY_HIDE_GDPR, true),
  hideEventTypeDetails: bool(process.env.NEXT_PUBLIC_CALENDLY_HIDE_EVENT_TYPE_DETAILS, false),
} as const

// Client-safe Meta config. The CAPI access token is intentionally NOT here —
// it's a server-only secret read directly from process.env.META_CAPI_ACCESS_TOKEN
// inside the API routes (see src/lib/server/metaCapi.ts). The pixel ID is not a
// secret (it's inlined for fbq anyway). A test-event code of '0' counts as off.
export const META_PIXEL = {
  id: str(process.env.NEXT_PUBLIC_META_PIXEL_ID, ''),
  testEventCode: (() => {
    const v = str(process.env.NEXT_PUBLIC_META_TEST_EVENT_CODE, '')
    return v === '0' ? '' : v
  })(),
} as const

export const PABBLY = {
  webhookUrl: str(process.env.NEXT_PUBLIC_PABBLY_WEBHOOK_URL, ''),
} as const

export const WHATSAPP = {
  communityUrl: str(process.env.NEXT_PUBLIC_WHATSAPP_COMMUNITY_URL, ''),
} as const

export const SKOOL = {
  url: str(process.env.NEXT_PUBLIC_SKOOL_COMMUNITY_URL, ''),
} as const

export const GA4 = {
  measurementId: str(process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID, ''),
} as const

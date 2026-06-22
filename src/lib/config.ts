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

export const BRAND = {
  name: str(process.env.NEXT_PUBLIC_BRAND_NAME, 'Suvidhi'),
  email: str(process.env.NEXT_PUBLIC_BRAND_EMAIL, 'innohealthbysush@gmail.com'),
  phone: str(process.env.NEXT_PUBLIC_BRAND_PHONE, '+919810880970'),
  phoneDisplay: str(process.env.NEXT_PUBLIC_BRAND_PHONE_DISPLAY, '+91 98108 80970'),
} as const

export const OFFER = {
  name: str(process.env.NEXT_PUBLIC_OFFER_NAME, 'The Postpartum Restore'),
  price: num(process.env.NEXT_PUBLIC_OFFER_PRICE_INR, 497),
  fullPrice: num(process.env.NEXT_PUBLIC_OFFER_FULL_PRICE_INR, 21000),
  currency: str(process.env.NEXT_PUBLIC_OFFER_CURRENCY, 'INR'),
  // For UI display — formatted with Indian numbering
  get priceLabel(): string {
    return `₹${this.price.toLocaleString('en-IN')}`
  },
  get fullPriceLabel(): string {
    return `₹${this.fullPrice.toLocaleString('en-IN')}`
  },
  get savingsLabel(): string {
    const diff = Math.max(0, this.fullPrice - this.price)
    return `₹${diff.toLocaleString('en-IN')}`
  },
  get discountPctLabel(): string {
    if (this.fullPrice <= 0) return ''
    const pct = Math.round(((this.fullPrice - this.price) / this.fullPrice) * 100)
    return `${pct}% off`
  },
} as const

// Itemised value-stack — the "Recap of Everything You Will Get" pricing.
// Every amount reads from env so the entire stack is editable without code.
// The `core` items are the included deliverables; `bonus` items are the free
// add-ons. Labels live here because they're product copy, not pricing.
export interface ValueItem {
  label: string
  amount: number
  kind: 'core' | 'bonus'
}

export const VALUE_STACK: readonly ValueItem[] = [
  { label: 'The Postpartum Restore™ 25-Minute Guided Assessment', amount: num(process.env.NEXT_PUBLIC_VALUE_ASSESSMENT, 5000), kind: 'core' },
  { label: 'The Postpartum Depletion Audit', amount: num(process.env.NEXT_PUBLIC_VALUE_DEPLETION_AUDIT, 1500), kind: 'core' },
  { label: 'The Metabolic Recovery Audit', amount: num(process.env.NEXT_PUBLIC_VALUE_METABOLIC_AUDIT, 1500), kind: 'core' },
  { label: 'The Supplement & Hair Recovery Audit', amount: num(process.env.NEXT_PUBLIC_VALUE_SUPPLEMENT_AUDIT, 1500), kind: 'core' },
  { label: 'The Neuro-Endocrine Reset Audit', amount: num(process.env.NEXT_PUBLIC_VALUE_NEURO_AUDIT, 1500), kind: 'core' },
  { label: '30-Minute Postpartum Assessment Call with Suvidhi', amount: num(process.env.NEXT_PUBLIC_VALUE_CALL, 2500), kind: 'bonus' },
  { label: 'Private Postpartum Mothers Community', amount: num(process.env.NEXT_PUBLIC_VALUE_COMMUNITY, 3000), kind: 'bonus' },
  { label: 'Monthly Group Coaching Sessions', amount: num(process.env.NEXT_PUBLIC_VALUE_COACHING, 4500), kind: 'bonus' },
] as const

export const VALUE_STACK_TOTAL = VALUE_STACK.reduce((sum, i) => sum + i.amount, 0)

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

export const META_PIXEL = {
  id: str(process.env.NEXT_PUBLIC_META_PIXEL_ID, ''),
  capiEndpoint: str(process.env.NEXT_PUBLIC_META_CAPI_ENDPOINT, ''),
  testEventCode: str(process.env.NEXT_PUBLIC_META_TEST_EVENT_CODE, ''),
} as const

export const PABBLY = {
  webhookUrl: str(process.env.NEXT_PUBLIC_PABBLY_WEBHOOK_URL, ''),
} as const

export const WHATSAPP = {
  communityUrl: str(process.env.NEXT_PUBLIC_WHATSAPP_COMMUNITY_URL, ''),
} as const

export const GA4 = {
  measurementId: str(process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID, ''),
} as const

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getFunnelState, setFunnelState } from '@/lib/funnelState'
import PhoneInput, { parsePhoneNumber } from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CalendarCheck,
  Check,
  ChevronDown,
  Clock,
  Hourglass,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Star,
  User,
  X,
} from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Countdown } from '@/components/ui/Countdown'
import { TopMarquee } from '@/components/sections/TopMarquee'
import { Footer } from '@/components/sections/Footer'
import { cn, formatINR } from '@/lib/utils'
import { fadeUp, stagger } from '@/lib/motion'
import { NAMING, PROOF, resolvePlan, type PlanId } from '@/lib/config'
import { startCheckout, type CheckoutTracking } from '@/lib/razorpay'
import { captureUtm, utmPayload, utmQueryString, getFbCookies } from '@/lib/utm'
import { setMetaAdvancedMatching } from '@/lib/tracking'
import { trackGa4EventOnce } from '@/lib/ga4'
import { fireInitiateCheckoutOnce } from '@/lib/metaClient'

interface FormState {
  firstName: string
  lastName: string
  email: string
  phone: string | undefined
  city: string
}

interface CouponState {
  code: string
  applied: boolean
  discountPct: number
  invalid?: boolean
}

const initial: FormState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: undefined,
  city: '',
}

/** Where a completed payment lands, per plan (dev spec + funnel brief). */
const CONFIRMED_ROUTE: Record<PlanId, string> = {
  call: '/confirmed',
  bundle: '/confirmed-plus',
}

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [form, setForm] = useState<FormState>(initial)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  // Coupon UI was removed from checkout; keep the (empty) state so the payment
  // math and free-order path still resolve to the standard no-discount case.
  const [coupon] = useState<CouponState>({
    code: '',
    applied: false,
    discountPct: 0,
  })
  const [submitting, setSubmitting] = useState(false)

  // The plan chosen on /oto. The query string is authoritative because it
  // survives a refresh or a restored tab; sessionStorage is the fallback for a
  // stripped URL. Anything unrecognised falls back to the ₹97 call, so a lost
  // hand-off can never silently charge someone the bundle price.
  const plan = useMemo(() => {
    const fromQuery = searchParams?.get('plan')
    if (fromQuery === 'call' || fromQuery === 'bundle') return resolvePlan(fromQuery)
    const stored = getFunnelState<{ plan?: string }>()
    return resolvePlan(stored?.plan)
  }, [searchParams])

  const isBundle = plan.id === 'bundle'

  // Raw error surfaced from Razorpay's `payment.failed` event so the user
  // sees WHAT went wrong (declined card, blocked transaction, etc.) instead
  // of a silent "nothing happened" state.
  const [paymentError, setPaymentError] = useState<{
    message: string
    code?: string
    reason?: string
  } | null>(null)
  // Mobile-only accordion state for the order summary. Default: closed so the
  // form is visible immediately on entering the page. Ignored on lg+.
  const [summaryOpen, setSummaryOpen] = useState(false)
  // Desktop-only dropdown for the itemised inclusions — open on load; the user
  // can collapse it. On mobile the list is always shown inside the summary
  // accordion (this flag is ignored there).
  const [valueOpen, setValueOpen] = useState(true)

  // Redirect-consent gate. Buyers were completing payment and immediately
  // closing the tab, so they never reached the booking screen — they had paid
  // and, from their side, received nothing. Making them acknowledge the wait
  // before the Pay button unlocks is the cheapest fix for that.
  const [consent, setConsent] = useState(false)
  const [consentError, setConsentError] = useState(false)

  const basePrice = plan.price
  const discountAmount = Math.round((basePrice * coupon.discountPct) / 100)
  const payable = Math.max(0, basePrice - discountAmount)
  const isFreeAfterCoupon = coupon.applied && payable === 0
  const fullName = `${form.firstName} ${form.lastName}`.trim()

  // Generate a session order ID once
  const [orderId] = useState(
    () =>
      'SVD-' +
      Date.now().toString(36).toUpperCase() +
      '-' +
      Math.floor(Math.random() * 1000)
        .toString(36)
        .toUpperCase(),
  )

  useEffect(() => {
    document.title = `Checkout · ${NAMING.call}`
    window.scrollTo({ top: 0 })
    captureUtm()
  }, [])

  // Manual Advanced Matching once the form is valid + filled (debounced 500ms).
  // This is NOT a tracked event — it enriches the only browser event (PageView)
  // with hashed identity for high EMQ. No Purchase/Lead/InitiateCheckout fire on
  // the browser (Health & Wellness preventive posture).
  useEffect(() => {
    const filled =
      form.firstName.trim() &&
      form.lastName.trim() &&
      form.email.trim() &&
      form.city.trim() &&
      form.phone
    if (!filled) return
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return
    const country = form.phone ? parsePhoneNumber(form.phone)?.country ?? '' : ''
    const timer = window.setTimeout(() => {
      void setMetaAdvancedMatching({
        email: form.email,
        phone: form.phone,
        firstName: form.firstName,
        lastName: form.lastName,
        city: form.city,
        country,
      })
    }, 500)
    return () => window.clearTimeout(timer)
  }, [form])

  /**
   * Validates the whole form in ONE pass — the redirect consent included, on
   * exactly the same footing as the name and email fields.
   *
   * Consent is deliberately NOT a second gate that only appears once the other
   * fields pass: a buyer with an empty form and an unticked box should see
   * every outstanding problem at once, not discover a new blocker after fixing
   * the first batch.
   *
   * @returns the id of the element to focus, or null when everything is valid.
   */
  const validate = (): string | null => {
    const next: Partial<Record<keyof FormState, string>> = {}
    if (!form.firstName.trim()) next.firstName = 'Please share your first name'
    if (!form.lastName.trim()) next.lastName = 'Please share your last name'
    if (!form.email.trim()) next.email = 'We need an email to send your access'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = 'That email looks off — please check'
    if (!form.phone) next.phone = 'Please add a reachable number'
    if (!form.city.trim()) next.city = 'Please add your town or city'
    setErrors(next)

    const consentMissing = !consent
    setConsentError(consentMissing)

    // Fields come first in the DOM, so an invalid field wins the focus; the
    // consent box only takes it when it is the sole thing left.
    if (Object.keys(next).length > 0) return 'checkout-form'
    if (consentMissing) return 'redirect-consent'
    return null
  }

  const goToConfirmed = (paymentId?: string) => {
    // Server already fired the CAPI `sales` event + wrote the Pabbly row (webhook
    // for paid, free-order route for coupon). The browser only carries funnel
    // state forward — no Meta events fire here.
    setFunnelState({
      plan: plan.id,
      name: fullName,
      email: form.email,
      phone: form.phone,
      city: form.city,
      orderId,
      paymentId,
      amountPaid: payable,
      coupon: coupon.applied ? coupon.code : undefined,
    })
    router.push(CONFIRMED_ROUTE[plan.id] + utmQueryString())
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()

    // GA4 `initiate_checkout` — fires at the TOP, BEFORE validation, because the
    // signal we want is "did they attempt to pay". A half-filled form that
    // bounces off validation still counts. (Deliberately different from Meta's
    // InitiateCheckout below, which only fires on a VALID form — the two events
    // measure different things and their counts will not match.)
    trackGa4EventOnce('initiate_checkout')

    const focusTarget = validate()
    if (focusTarget) {
      // The sticky mobile pay bar sits far below the fields, so scroll the
      // offending block into view and focus it rather than failing silently.
      const isConsent = focusTarget === 'redirect-consent'
      document.getElementById(focusTarget)?.scrollIntoView({
        behavior: 'smooth',
        block: isConsent ? 'center' : 'start',
      })
      const el = document.querySelector<HTMLElement>(
        isConsent ? '#redirect-consent input' : '#checkout-form input',
      )
      window.setTimeout(() => el?.focus({ preventScroll: true }), 400)
      return
    }

    setSubmitting(true)
    setPaymentError(null)

    const country = form.phone ? parsePhoneNumber(form.phone)?.country ?? '' : ''

    // Refresh Manual Advanced Matching with final values (no event fires).
    void setMetaAdvancedMatching({
      email: form.email,
      phone: form.phone,
      firstName: form.firstName,
      lastName: form.lastName,
      city: form.city,
      country,
    })

    // Identity + attribution the server needs to fire CAPI `sales` + Pabbly.
    const fb = getFbCookies()
    const utm = utmPayload()
    const isTest = isFreeAfterCoupon || plan.price <= 1
    const tracking: CheckoutTracking = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      city: form.city,
      countryCode: country,
      amount: payable,
      isTest,
      eventSourceUrl: typeof window !== 'undefined' ? window.location.href : '',
      fbc: fb.fbc,
      fbp: fb.fbp,
      fbclid: utm.fbclid,
      utm_source: utm.utm_source,
      utm_medium: utm.utm_medium,
      utm_campaign: utm.utm_campaign,
      utm_content: utm.utm_content,
      utm_term: utm.utm_term,
    }

    // 100%-off path → no Razorpay. Write the Pabbly row server-side (no CAPI),
    // then continue. Best-effort; navigation never waits on it.
    if (isFreeAfterCoupon) {
      const freeId = `FREE-${coupon.code}`
      void fetch('/api/track/free-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: freeId, tracking }),
        keepalive: true,
      })
      window.setTimeout(() => goToConfirmed(freeId), 600)
      return
    }

    // Meta `InitiateCheckout` — PAID path only, form already validated, fired
    // immediately before create-order. Carries the full 11 matching signals.
    // Deduped per email per browser. Never blocks payment.
    await fireInitiateCheckoutOnce({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      city: form.city,
      countryCode: country,
      amount: payable,
    })

    // Razorpay: create-order packs the webhook notes → modal opens → signature
    // verified for UX. Pabbly + the CAPI `sales` event now fire from
    // /api/razorpay/webhook (server-to-server), not from the browser round-trip.
    await startCheckout({
      amount: payable,
      receipt: orderId,
      description: plan.name,
      customer: {
        name: fullName,
        email: form.email,
        phone: form.phone,
      },
      tracking,
      onSuccess: (r) => {
        goToConfirmed(r.razorpay_payment_id)
      },
      onDismiss: () => {
        setSubmitting(false)
      },
      onFailure: (failure) => {
        setSubmitting(false)
        setPaymentError({
          message: failure.message,
          code: failure.code,
          reason: failure.reason,
        })
      },
    })
  }

  const payLabel = submitting
    ? isFreeAfterCoupon
      ? 'Confirming…'
      : 'Opening secure payment…'
    : isFreeAfterCoupon
    ? 'Continue to book my slot · Free'
    : `Pay ${formatINR(payable)} securely`

  return (
    <div className="relative min-h-screen flex flex-col">
      <TopMarquee />

      <main className="relative flex-1 py-8 sm:py-12 lg:py-14">
        <Container>
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
            <Link
              href={'/oto' + utmQueryString()}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-600 hover:text-brand-700 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
              Change my selection
            </Link>
            <ol className="flex items-center gap-1.5 sm:gap-2 text-[11.5px] sm:text-xs font-medium">
              <Step label="1. Your start" done />
              <Sep />
              <Step active label="2. Details & payment" />
              <Sep />
              <Step label="3. Book your slot" />
            </ol>
          </div>

          <motion.div
            variants={stagger(0.1, 0.06)}
            initial="hidden"
            animate="show"
            className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-start"
          >
            {/* LEFT — Form */}
            <motion.div
              variants={fadeUp}
              className="lg:col-span-7 order-2 lg:order-1 space-y-4"
            >
              <form
                id="checkout-form"
                onSubmit={onSubmit}
                noValidate
                className="relative rounded-3xl bg-white border border-ink-100 shadow-soft p-6 sm:p-8 space-y-5"
              >
                <div>
                  <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ink-950 leading-tight">
                    Your details
                  </h2>
                  <p className="mt-1.5 text-ink-600 text-sm">
                    Honest answers make the call dramatically more useful.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <Field
                    label="First name"
                    error={errors.firstName}
                    icon={<User className="w-4 h-4" />}
                  >
                    <input
                      className="input"
                      type="text"
                      placeholder="Enter first name"
                      autoComplete="given-name"
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    />
                  </Field>

                  <Field
                    label="Last name"
                    error={errors.lastName}
                    icon={<User className="w-4 h-4" />}
                  >
                    <input
                      className="input"
                      type="text"
                      placeholder="Enter last name"
                      autoComplete="family-name"
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    />
                  </Field>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <Field
                    label="Email address"
                    error={errors.email}
                    icon={<Mail className="w-4 h-4" />}
                  >
                    <input
                      className="input"
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </Field>

                  <Field label="WhatsApp number" error={errors.phone}>
                    <PhoneInput
                      international
                      defaultCountry="IN"
                      countryCallingCodeEditable={false}
                      placeholder="Enter your number"
                      value={form.phone}
                      onChange={(value) => setForm({ ...form, phone: value })}
                    />
                  </Field>
                </div>

                <Field
                  label="Town / City"
                  error={errors.city}
                  icon={<MapPin className="w-4 h-4" />}
                >
                  <input
                    className="input"
                    type="text"
                    placeholder="Enter your city"
                    autoComplete="address-level2"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                </Field>

                {/* ── What happens right after you pay ──────────────────────
                    High-visibility, deliberately hard to scroll past. Buyers
                    were closing the tab the second Razorpay said "success",
                    never reaching the booking screen, and then believing they
                    had paid for nothing. */}
                <RedirectNotice isBundle={isBundle} />

                {/* Razorpay failure banner — surfaces the actual error so users
                    aren't stuck staring at a broken submit state. */}
                <AnimatePresence>
                  {paymentError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -8 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -8 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div
                        role="alert"
                        className="rounded-2xl border border-brand-200 bg-brand-50/80 p-4 flex items-start gap-3"
                      >
                        <span className="mt-0.5 inline-flex w-7 h-7 rounded-full bg-brand-100 text-brand-700 border border-brand-200 items-center justify-center shrink-0">
                          <X className="w-4 h-4" strokeWidth={2.5} />
                        </span>
                        <div className="flex-1 min-w-0 text-[13.5px] leading-relaxed text-ink-800">
                          <div className="font-semibold text-ink-950">
                            Payment didn&apos;t go through
                          </div>
                          <p className="mt-0.5 text-pretty">
                            {paymentError.message}
                          </p>
                          {(paymentError.code || paymentError.reason) && (
                            <p className="mt-1 text-[12.5px] text-ink-600">
                              {paymentError.code && (
                                <code className="font-mono px-1.5 py-0.5 rounded bg-white border border-ink-100 text-[11.5px] mr-1">
                                  {paymentError.code}
                                </code>
                              )}
                              {paymentError.reason}
                            </p>
                          )}
                          <p className="mt-2 text-[12.5px] text-ink-600">
                            Try a different card / UPI ID, or write to{' '}
                            <a
                              href="mailto:innohealthbysush@gmail.com"
                              className="text-brand-700 font-semibold underline-offset-2 hover:underline"
                            >
                              innohealthbysush@gmail.com
                            </a>{' '}
                            and we&apos;ll send you a direct payment link.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Consent — sits immediately above the Pay button so it is the
                    last thing read before paying. */}
                <ConsentCheckbox
                  checked={consent}
                  error={consentError}
                  isBundle={isBundle}
                  onChange={(v) => {
                    setConsent(v)
                    if (v) setConsentError(false)
                  }}
                />

                {/* Inline submit — in the form's natural flow (all screens). On
                    mobile the always-visible sticky bar at the bottom of the
                    viewport mirrors it for one-tap access while scrolling. */}
                <button
                  type="submit"
                  disabled={submitting}
                  className={cn(
                    'group relative w-full inline-flex items-center justify-center gap-2.5',
                    'rounded-full font-semibold tracking-tight whitespace-nowrap',
                    'bg-brand-600 hover:bg-brand-700 text-white',
                    'shadow-elev hover:shadow-glow',
                    'transition-all duration-500 ease-out hover:-translate-y-0.5',
                    'px-6 py-4 text-base',
                    'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30',
                    'overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0',
                  )}
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    style={{
                      background:
                        'radial-gradient(80% 100% at 50% 0%, rgba(255,255,255,.30), transparent 70%)',
                    }}
                  />
                  {submitting ? (
                    <>
                      <span className="relative w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      <span className="relative">{payLabel}</span>
                    </>
                  ) : (
                    <>
                      {isFreeAfterCoupon ? (
                        <Calendar className="w-[18px] h-[18px]" />
                      ) : (
                        <Lock className="w-[18px] h-[18px]" />
                      )}
                      <span className="relative">{payLabel}</span>
                    </>
                  )}
                </button>

                <p className="text-center text-[12.5px] text-ink-500 leading-relaxed">
                  <Lock className="w-3 h-3 inline-block -translate-y-0.5 mr-1 text-brand-600" />
                  256-bit SSL · PCI-DSS gateway · Full money-back if the call
                  doesn&apos;t deliver clarity.
                </p>

                <p className="text-center text-[12px] text-ink-500 leading-relaxed">
                  By continuing you agree to our{' '}
                  <Link
                    href="/terms-and-conditions"
                    className="text-brand-700 underline-offset-2 hover:underline"
                  >
                    terms
                  </Link>
                  ,{' '}
                  <Link
                    href="/privacy-policy"
                    className="text-brand-700 underline-offset-2 hover:underline"
                  >
                    privacy
                  </Link>{' '}
                  &{' '}
                  <Link
                    href="/refund-policy"
                    className="text-brand-700 underline-offset-2 hover:underline"
                  >
                    refund policy
                  </Link>
                  .
                </p>
              </form>
            </motion.div>

            {/* RIGHT — Order Summary
                Mobile: collapsible accordion (closed by default) so the form is
                immediately visible on entering the page. Desktop: standard
                sticky right panel. */}
            <motion.aside
              variants={fadeUp}
              className="lg:col-span-5 order-1 lg:order-2 lg:sticky lg:top-6 lg:space-y-4"
            >
              {/* Mobile-only summary header / toggle */}
              <button
                type="button"
                onClick={() => setSummaryOpen((o) => !o)}
                aria-expanded={summaryOpen}
                aria-controls="checkout-order-body"
                className={cn(
                  'lg:hidden w-full flex items-center justify-between gap-3 rounded-2xl bg-white border border-ink-100 shadow-soft',
                  'px-4 py-3 text-left transition-all duration-300',
                  'hover:border-brand-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20',
                  summaryOpen && 'border-brand-200 shadow-elev',
                )}
              >
                <span className="min-w-0">
                  <span className="block text-[11px] uppercase tracking-[0.18em] font-semibold text-brand-700">
                    Order summary
                  </span>
                  <span className="block text-[12.5px] text-ink-500 mt-0.5 truncate">
                    {plan.shortName} · {summaryOpen ? 'tap to hide' : 'tap to view'}
                  </span>
                </span>
                <span className="flex items-center gap-2.5 shrink-0">
                  <span className="font-display text-xl font-semibold text-brand-600 tabular-nums">
                    {formatINR(payable)}
                  </span>
                  <span
                    className={cn(
                      'w-8 h-8 rounded-full border border-ink-200 flex items-center justify-center transition-colors',
                      summaryOpen && 'bg-brand-50 border-brand-200',
                    )}
                  >
                    <ChevronDown
                      className={cn(
                        'w-4 h-4 text-ink-500 transition-transform duration-300',
                        summaryOpen && 'rotate-180 text-brand-700',
                      )}
                    />
                  </span>
                </span>
              </button>

              {/* Body — collapsible on mobile via CSS grid trick; always on desktop */}
              <div
                id="checkout-order-body"
                className={cn(
                  'grid transition-[grid-template-rows,margin,opacity] duration-500 ease-out',
                  'lg:!grid-rows-[1fr] lg:!opacity-100 lg:!mt-0',
                  summaryOpen
                    ? 'grid-rows-[1fr] opacity-100 mt-3'
                    : 'grid-rows-[0fr] opacity-0 mt-0',
                )}
              >
                <div className="overflow-hidden lg:overflow-visible">
                  <div className="relative rounded-[28px] overflow-hidden shadow-elev border border-white/60">
                    <div
                      aria-hidden
                      className="absolute inset-0"
                      style={{
                        background:
                          'linear-gradient(160deg, #391218 0%, #5d2129 38%, #963543 100%)',
                      }}
                    />
                    <div
                      aria-hidden
                      className="absolute inset-0 opacity-50"
                      style={{
                        background:
                          'radial-gradient(60% 50% at 30% 0%, rgba(236,158,169,.5) 0%, transparent 60%), radial-gradient(40% 40% at 100% 100%, rgba(255,202,74,.2) 0%, transparent 60%)',
                      }}
                    />
                    <div className="relative p-6 sm:p-7 text-cream">
                      <div className="flex items-center justify-between gap-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-[11px] uppercase tracking-[0.22em] font-semibold">
                          <Sparkles className="w-3.5 h-3.5 text-brand-200" />
                          Your order
                        </div>
                        <Link
                          href={'/oto' + utmQueryString()}
                          className="text-[12px] font-semibold text-brand-200 underline-offset-2 hover:underline"
                        >
                          Change
                        </Link>
                      </div>

                      <h2 className="mt-5 font-display text-[1.15rem] sm:text-[1.3rem] font-semibold leading-tight text-balance">
                        {plan.name}
                      </h2>

                      {/* Desktop-only dropdown toggle for the itemised inclusions.
                          Hidden on mobile, where the list is always shown inside
                          the summary accordion. */}
                      <button
                        type="button"
                        onClick={() => setValueOpen((o) => !o)}
                        aria-expanded={valueOpen}
                        aria-controls="checkout-value-items"
                        className="mt-4 hidden lg:flex w-full items-center gap-3 rounded-2xl bg-white/[0.06] border border-white/12 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20"
                      >
                        <span className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                          <Sparkles className="w-4 h-4 text-brand-200" />
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-[13px] font-semibold leading-tight">
                            What&apos;s included
                          </span>
                          <span className="block text-[11.5px] text-cream/65 mt-0.5">
                            {plan.includes.length} items
                          </span>
                        </span>
                        <ChevronDown
                          className={cn(
                            'w-5 h-5 text-cream/70 transition-transform duration-300 shrink-0',
                            valueOpen && 'rotate-180',
                          )}
                        />
                      </button>

                      {/* Itemised inclusions. No rupee values, no struck-through
                          totals, no "bonus" labels — the page sells the outcome
                          and the price is the single number below. */}
                      <div
                        id="checkout-value-items"
                        className={cn(
                          'grid grid-rows-[1fr] opacity-100 transition-[grid-template-rows,opacity] duration-500 ease-out',
                          valueOpen
                            ? 'lg:grid-rows-[1fr] lg:opacity-100'
                            : 'lg:grid-rows-[0fr] lg:opacity-0',
                        )}
                      >
                        <div className="overflow-hidden">
                          <ul className="mt-4 lg:mt-3 divide-y divide-white/10">
                            {plan.includes.map((item) => (
                              <li key={item} className="flex items-start gap-3 py-3">
                                <span className="mt-0.5 inline-flex w-6 h-6 rounded-full bg-white/10 border border-white/15 items-center justify-center shrink-0">
                                  <Check className="w-3.5 h-3.5 text-brand-200" strokeWidth={2.5} />
                                </span>
                                <span className="flex-1 min-w-0 text-[13.5px] text-cream/90 leading-snug text-pretty">
                                  {item}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="my-5 h-px bg-white/10" />

                      <div className="flex items-end justify-between">
                        <div>
                          <div className="text-[11px] uppercase tracking-[0.2em] font-semibold text-cream/60">
                            You pay today
                          </div>
                          <div className="font-display text-4xl sm:text-5xl font-semibold leading-none mt-2 tabular-nums">
                            {payable === 0 ? '₹0' : formatINR(payable)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="inline-flex items-center gap-1">
                            {[0, 1, 2, 3, 4].map((i) => (
                              <Star
                                key={i}
                                className="w-3.5 h-3.5 fill-brand-400 text-brand-400"
                              />
                            ))}
                          </div>
                          <div className="text-[12px] text-cream/60 mt-1">
                            {PROOF.rating}/5 · {PROOF.mothers} mothers
                          </div>
                        </div>
                      </div>

                      {/* Urgency */}
                      <div className="mt-5 rounded-2xl bg-white/8 border border-white/12 p-4 backdrop-blur-md">
                        <div className="flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.2em] font-semibold text-cream/65 mb-3">
                          <Clock className="w-3.5 h-3.5 text-brand-300" /> Offer ends in
                        </div>
                        <Countdown variant="dark" size="sm" />
                      </div>

                      {/* Trust badges */}
                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/8 border border-white/10">
                          <ShieldCheck className="w-4 h-4 text-brand-200" />
                          <span className="text-[12.5px] font-medium">Money-back</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/8 border border-white/10">
                          <Lock className="w-4 h-4 text-brand-200" />
                          <span className="text-[12.5px] font-medium">100% secure</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.aside>
          </motion.div>
        </Container>
      </main>

      <Footer hideCTA />

      {/* Spacer so the fixed mobile pay bar never permanently covers the
          footer's last row. Mobile only. */}
      <div aria-hidden className="h-24 lg:hidden" />

      {/* Mobile sticky pay bar. Submits the checkout form via the `form`
          attribute, so it works even though it lives outside the <form> — and
          therefore runs through the same validation + consent gate. */}
      <div className="fixed inset-x-0 bottom-0 z-50 lg:hidden pb-safe border-t border-ink-100 bg-white/95 backdrop-blur-xl shadow-[0_-8px_30px_-12px_rgba(57,18,24,0.18)]">
        <div className="px-4 py-3">
          {!consent && (
            <p className="mb-2 flex items-center justify-center gap-1.5 text-[11.5px] font-medium text-brand-700">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              Tick the booking confirmation above to continue
            </p>
          )}
          <button
            type="submit"
            form="checkout-form"
            disabled={submitting}
            className={cn(
              'group relative w-full inline-flex items-center justify-center gap-2.5',
              'rounded-full font-semibold tracking-tight whitespace-nowrap',
              'bg-brand-600 hover:bg-brand-700 text-white',
              'shadow-elev hover:shadow-glow transition-all duration-500 ease-out',
              'px-6 py-3.5 text-base',
              'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30',
              'overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed',
            )}
          >
            {submitting ? (
              <>
                <span className="relative w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                <span className="relative">{payLabel}</span>
              </>
            ) : (
              <>
                {isFreeAfterCoupon ? (
                  <Calendar className="w-[18px] h-[18px]" />
                ) : (
                  <Lock className="w-[18px] h-[18px]" />
                )}
                <span className="relative">{payLabel}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * "What happens the moment you pay" — the drop-off fix.
 *
 * Deliberately loud: amber warning styling rather than the brand rose, so it
 * reads as an instruction rather than another marketing panel and does not
 * blend into the card above it.
 */
function RedirectNotice({ isBundle }: { isBundle: boolean }) {
  const steps = [
    {
      icon: Hourglass,
      text: 'Give it up to 2 minutes. Your payment is confirmed in the background — the wait is normal, and nothing is wrong.',
    },
    {
      icon: CalendarCheck,
      text: 'You land on your booking page, where you choose the day and time of your 1:1 call with Suvidhi.',
    },
    ...(isBundle
      ? [
          {
            icon: MessageCircle,
            text: 'That same page carries your invite to the private WhatsApp community, plus your course login details by email.',
          },
        ]
      : []),
  ]

  return (
    <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/90 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-amber-300 bg-amber-100 text-amber-700">
          <AlertTriangle className="h-4 w-4" strokeWidth={2.5} />
        </span>
        <div className="min-w-0">
          <h3 className="font-display text-[15.5px] sm:text-[17px] font-semibold leading-snug text-ink-950">
            Please stay on this page after you pay
          </h3>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-700 text-pretty">
            Payment alone does not book your call. Closing the tab, pressing back
            or refreshing before the redirect finishes means{' '}
            <span className="font-semibold text-ink-950">
              your slot never gets reserved
            </span>
            .
          </p>
        </div>
      </div>

      <ol className="mt-4 space-y-2.5">
        {steps.map((s, i) => {
          const Icon = s.icon
          return (
            <li key={s.text} className="flex items-start gap-2.5">
              <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-amber-300 bg-white text-amber-700">
                <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
              </span>
              <span className="text-[13px] leading-relaxed text-ink-700 text-pretty">
                <span className="font-semibold text-ink-900">Step {i + 1}. </span>
                {s.text}
              </span>
            </li>
          )
        })}
      </ol>

      <p className="mt-3.5 text-[12.5px] leading-relaxed text-ink-600">
        Stuck on the payment screen for longer than that? Don&apos;t pay again —
        email{' '}
        <a
          href="mailto:innohealthbysush@gmail.com"
          className="font-semibold text-brand-700 underline-offset-2 hover:underline"
        >
          innohealthbysush@gmail.com
        </a>{' '}
        and we&apos;ll send your booking link within the hour.
      </p>
    </div>
  )
}

function ConsentCheckbox({
  checked,
  error,
  isBundle,
  onChange,
}: {
  checked: boolean
  error: boolean
  isBundle: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div id="redirect-consent" className="scroll-mt-24">
      {/* Labelled "Required" in the same voice as the field labels above, so it
          reads as part of the form rather than as optional fine print. */}
      <div className="field-label">
        Booking confirmation
        <span className="text-brand-600" aria-hidden>
          *
        </span>
        <span className="ml-1 rounded-full bg-brand-50 border border-brand-200/70 px-2 py-0.5 text-[9.5px] uppercase tracking-[0.14em] font-bold text-brand-700">
          Required
        </span>
      </div>

      <label
        className={cn(
          'flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 transition-colors duration-300',
          error
            ? 'border-brand-500 bg-brand-50'
            : checked
            ? 'border-brand-300 surface-tint'
            : 'border-ink-200 bg-white hover:border-brand-200',
        )}
      >
        <input
          type="checkbox"
          required
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={error || undefined}
          aria-describedby={error ? 'redirect-consent-error' : undefined}
          className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-brand-600"
        />
        <span className="text-[13.5px] leading-relaxed text-ink-800 text-pretty">
          I understand that my payment includes a{' '}
          <span className="font-semibold text-ink-950">
            1:1 call with Suvidhi that I still need to book myself
          </span>
          , and I&apos;ll stay on the page for up to 2 minutes after paying so I
          can choose my slot on the next screen
          {isBundle
            ? ', join the WhatsApp community and pick up my course access.'
            : '.'}
        </span>
      </label>

      <AnimatePresence>
        {error && (
          <motion.p
            id="redirect-consent-error"
            role="alert"
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -4 }}
            transition={{ duration: 0.3 }}
            className="mt-2 flex items-center gap-1.5 text-[12.5px] font-medium text-brand-700"
          >
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            Please confirm this before paying — it&apos;s the step people miss.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

function Step({ active, done, label }: { active?: boolean; done?: boolean; label: string }) {
  return (
    <li
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-colors',
        active
          ? 'bg-brand-50 text-brand-700 border border-brand-200/60'
          : 'bg-white border border-ink-100 text-ink-500',
      )}
    >
      {done && <Check className="w-3 h-3 text-brand-600" strokeWidth={3} />}
      {active && (
        <span className="relative flex w-1.5 h-1.5">
          <span className="absolute inset-0 rounded-full bg-brand-600 animate-ping opacity-75" />
          <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-brand-600" />
        </span>
      )}
      <span className="whitespace-nowrap">{label}</span>
    </li>
  )
}

function Sep() {
  return <span aria-hidden className="hidden sm:block w-4 h-px bg-ink-200" />
}

function Field({
  label,
  error,
  icon,
  children,
}: {
  label: string
  error?: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="field-label">
        {icon}
        {label}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -4 }}
            transition={{ duration: 0.3 }}
            className="mt-2 text-[12.5px] text-brand-700 font-medium"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

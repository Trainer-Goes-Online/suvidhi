'use client'

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import PhoneInput, { parsePhoneNumber } from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  Check,
  ChevronDown,
  Crown,
  Hourglass,
  Lock,
  MessageCircle,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Star,
  Video,
  X,
} from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { CountrySelect } from '@/components/ui/CountrySelect'
import { TopMarquee } from '@/components/sections/TopMarquee'
import { Footer } from '@/components/sections/Footer'
import { cn } from '@/lib/utils'
import { fadeUp, stagger } from '@/lib/motion'
import { BRAND, NAMING, PLANS, PROOF, type PlanId } from '@/lib/config'
import { getFunnelState, setFunnelState } from '@/lib/funnelState'
import { startCheckout, type CheckoutTracking } from '@/lib/razorpay'
import { captureUtm, getFbCookies, utmPayload, utmQueryString } from '@/lib/utm'
import { setMetaAdvancedMatching } from '@/lib/tracking'
import { trackGa4EventOnce } from '@/lib/ga4'
import { fireInitiateCheckoutOnce } from '@/lib/metaClient'

/**
 * /register — the free Roadmap Call booking form, with ONE optional upsell.
 *
 *   Free path → form → ic_event → Pabbly row → /confirmed (book the slot).
 *   VIP path  → form + upgrade ticked → ic_event → Razorpay (₹497)
 *               → /confirmed-plus (book the slot, community, course access).
 *
 * The VIP box sits between the form and the button on purpose: it is the last
 * thing read before committing, and it is animated to be hard to miss. On
 * phones and tablets a sticky bottom bar mirrors the upgrade toggle and the
 * button, and hides itself whenever the in-page versions are on screen.
 */

interface FormState {
  firstName: string
  lastName: string
  email: string
  phone: string | undefined
  city: string
}

const initial: FormState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: undefined,
  city: '',
}

const CONFIRMED_ROUTE: Record<PlanId, string> = {
  call: '/confirmed',
  bundle: '/confirmed-plus',
}

const VIP_PRICE = PLANS.bundle.priceLabel

const VIP_PERKS: { icon: typeof Check; text: string }[] = [
  {
    icon: PlayCircle,
    text: 'The guided protocols Suvidhi walks her 90-day clients through: the amino acid meal framework, the 14-day circadian reset, the supplement absorption fixes and the hair-fall protocol',
  },
  {
    icon: MessageCircle,
    text: 'The private WhatsApp community of postpartum mothers, so you are not doing the weeks between calls alone',
  },
  {
    icon: Sparkles,
    text: 'One payment, yours for life — no subscription, no renewal',
  },
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Leading id for the free path's CRM row (paid rows use the Razorpay id). */
function newLeadId(): string {
  return (
    'SVD-' +
    Date.now().toString(36).toUpperCase() +
    '-' +
    Math.floor(Math.random() * 1296)
      .toString(36)
      .toUpperCase()
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const reduce = useReducedMotion() ?? false

  const [form, setForm] = useState<FormState>(initial)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [paymentError, setPaymentError] = useState<{
    message: string
    code?: string
    reason?: string
  } | null>(null)
  // Mobile/tablet-only accordion for the booking summary — closed by default so
  // the form is the first thing on screen. Ignored on lg+.
  const [summaryOpen, setSummaryOpen] = useState(false)

  // The upgrade starts ticked only when a link explicitly asks for it
  // (?vip=1, or a legacy /checkout?plan=bundle redirect).
  const [vip, setVip] = useState<boolean>(() => {
    const q = searchParams?.get('vip')
    if (q === '1' || q === 'true') return true
    if (searchParams?.get('plan') === 'bundle') return true
    return getFunnelState<{ plan?: string }>()?.plan === 'bundle'
  })

  const plan = vip ? PLANS.bundle : PLANS.call
  const [leadId] = useState(newLeadId)
  const fullName = `${form.firstName} ${form.lastName}`.trim()

  // Sticky mobile bar hides while the in-page upgrade + button are visible, so
  // the same controls are never on screen twice.
  const actionsRef = useRef<HTMLDivElement>(null)
  const [actionsInView, setActionsInView] = useState(false)
  useEffect(() => {
    const el = actionsRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      ([entry]) => setActionsInView(entry.isIntersecting),
      { threshold: 0.25 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    document.title = `Book your free ${NAMING.call}`
    window.scrollTo({ top: 0 })
    captureUtm()
  }, [])

  // Manual Advanced Matching once the form is filled (debounced). Enriches the
  // browser PageView with hashed identity and writes the svd_mam cookie that
  // the server-side events fall back on — no tracked event fires here.
  useEffect(() => {
    const filled =
      form.firstName.trim() &&
      form.lastName.trim() &&
      form.email.trim() &&
      form.city.trim() &&
      form.phone
    if (!filled || !EMAIL_RE.test(form.email)) return
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

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {}
    if (!form.firstName.trim()) next.firstName = 'Please share your first name'
    if (!form.lastName.trim()) next.lastName = 'Please share your last name'
    if (!form.email.trim()) next.email = 'We need an email to send your booking'
    else if (!EMAIL_RE.test(form.email)) next.email = 'That email looks off — please check'
    if (!form.phone) next.phone = 'Please add a reachable WhatsApp number'
    if (!form.city.trim()) next.city = 'Please add your town or city'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const goToConfirmed = (planId: PlanId, countryCode: string, paymentId?: string) => {
    setFunnelState({
      plan: planId,
      name: fullName,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone,
      city: form.city.trim(),
      countryCode,
      orderId: leadId,
      paymentId,
      amountPaid: PLANS[planId].price,
    })
    router.push(CONFIRMED_ROUTE[planId] + utmQueryString())
  }

  const onSubmit = async (e?: FormEvent) => {
    e?.preventDefault()
    if (submitting) return

    // GA4 counts the attempt, valid or not (its own definition of the event).
    trackGa4EventOnce('initiate_checkout')

    if (!validate()) {
      // The sticky bar sits far below the fields — bring the form into view.
      document.getElementById('register-form')?.scrollIntoView({
        behavior: reduce ? 'auto' : 'smooth',
        block: 'start',
      })
      window.setTimeout(
        () =>
          document
            .querySelector<HTMLElement>('#register-form [aria-invalid="true"]')
            ?.focus({ preventScroll: true }),
        400,
      )
      return
    }

    setSubmitting(true)
    setPaymentError(null)

    const countryCode = form.phone ? parsePhoneNumber(form.phone)?.country ?? '' : ''
    const customer = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone,
      city: form.city.trim(),
      countryCode,
    }

    // Final identity for the PageView pixel + the svd_mam cookie.
    void setMetaAdvancedMatching({ ...customer, country: countryCode })

    // ic_event — beacon, so neither the redirect nor the Razorpay modal can
    // cancel it.
    void fireInitiateCheckoutOnce(customer, vip)

    const fb = getFbCookies()
    const utm = utmPayload()
    const tracking: CheckoutTracking = {
      ...customer,
      amount: plan.price,
      isTest: vip && plan.price <= 1,
      purchaseType: vip ? 'call_video_library' : 'call_only',
      eventSourceUrl: window.location.href,
      fbc: fb.fbc,
      fbp: fb.fbp,
      fbclid: utm.fbclid,
      utm_source: utm.utm_source,
      utm_medium: utm.utm_medium,
      utm_campaign: utm.utm_campaign,
      utm_content: utm.utm_content,
      utm_term: utm.utm_term,
    }

    // ── Free path: CRM row, then straight to the booking calendar ──
    if (!vip) {
      void fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, tracking }),
        keepalive: true,
      }).catch(() => {})
      goToConfirmed('call', countryCode)
      return
    }

    // ── VIP path: Razorpay. The webhook owns the `sales` event + CRM row. ──
    await startCheckout({
      amount: plan.price,
      receipt: leadId,
      description: plan.name,
      customer: { name: fullName, email: customer.email, phone: form.phone },
      tracking,
      onSuccess: (r) => goToConfirmed('bundle', countryCode, r.razorpay_payment_id),
      onDismiss: () => setSubmitting(false),
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

  const toggleVip = () => {
    setVip((v) => !v)
    setPaymentError(null)
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <TopMarquee />

      <main className="relative flex-1 py-6 sm:py-10 lg:py-14">
        <Container>
          {/* Breadcrumb */}
          <div className="mb-5 sm:mb-6 flex items-center justify-between flex-wrap gap-3">
            <Link
              href={'/' + utmQueryString()}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-600 hover:text-brand-700 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
              Back
            </Link>
            <ol className="flex items-center gap-1.5 sm:gap-2 text-[11.5px] sm:text-xs font-medium">
              <Step active label="1. Your details" />
              <span aria-hidden className="w-4 h-px bg-ink-200" />
              <Step label="2. Pick your slot" />
            </ol>
          </div>

          <motion.div
            variants={stagger(0.08, 0.06)}
            initial="hidden"
            animate="show"
            className="grid lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 items-start"
          >
            {/* LEFT — form + upgrade + button */}
            <motion.div variants={fadeUp} className="lg:col-span-7 order-2 lg:order-1">
              <form
                id="register-form"
                onSubmit={onSubmit}
                noValidate
                className="relative scroll-mt-4 rounded-3xl bg-white border border-ink-100 shadow-soft p-5 sm:p-8 space-y-5"
              >
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1 text-[10.5px] sm:text-[11px] uppercase tracking-[0.18em] font-bold text-white shadow-soft">
                    <Lock className="h-3 w-3" />
                    Free registration
                  </span>
                  <h1 className="mt-3.5 font-display text-[1.6rem] sm:text-3xl font-semibold text-ink-950 leading-tight text-balance">
                    Book Your Free{' '}
                    <span className="grad-text">Recovery Roadmap Call</span>
                  </h1>
                  <p className="mt-2 text-ink-600 text-[14px] sm:text-[15px] leading-relaxed text-pretty">
                    Fill in your details — you&apos;ll pick your 30-minute slot with
                    Suvidhi on the very next screen.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                  <Field label="First name" error={errors.firstName}>
                    <input
                      className="input"
                      type="text"
                      placeholder="Aanya"
                      autoComplete="given-name"
                      aria-invalid={!!errors.firstName || undefined}
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    />
                  </Field>
                  <Field label="Last name" error={errors.lastName}>
                    <input
                      className="input"
                      type="text"
                      placeholder="Kapoor"
                      autoComplete="family-name"
                      aria-invalid={!!errors.lastName || undefined}
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    />
                  </Field>
                </div>

                <Field label="Email" error={errors.email}>
                  <input
                    className="input"
                    type="email"
                    inputMode="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    aria-invalid={!!errors.email || undefined}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </Field>

                <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                  <Field label="Town / City" error={errors.city}>
                    <input
                      className="input"
                      type="text"
                      placeholder="Mumbai"
                      autoComplete="address-level2"
                      aria-invalid={!!errors.city || undefined}
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                    />
                  </Field>
                  <Field label="WhatsApp number" error={errors.phone}>
                    <PhoneInput
                      international
                      defaultCountry="IN"
                      countryCallingCodeEditable={false}
                      countrySelectComponent={CountrySelect}
                      placeholder="98765 43210"
                      aria-invalid={!!errors.phone || undefined}
                      value={form.phone}
                      onChange={(value) => setForm({ ...form, phone: value })}
                    />
                  </Field>
                </div>

                {/* ── Upgrade + button: observed to hide the sticky bar ── */}
                <div ref={actionsRef} className="space-y-4 pt-1">
                  <VipUpgradeBox checked={vip} onToggle={toggleVip} reduce={reduce} />

                  <AnimatePresence initial={false}>
                    {vip && (
                      <motion.div
                        key="stay"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <StayOnPageNote />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {paymentError && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <PaymentErrorBanner error={paymentError} />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <SubmitButton vip={vip} submitting={submitting} reduce={reduce} />

                  <p className="text-center text-[12.5px] text-ink-500 leading-relaxed">
                    <ShieldCheck className="w-3.5 h-3.5 inline-block -translate-y-0.5 mr-1 text-brand-600" />
                    {vip
                      ? '256-bit SSL · PCI-DSS secure Razorpay checkout'
                      : 'No payment needed · Your details are never shared'}
                  </p>
                </div>

                <p className="text-center text-[12px] text-ink-500 leading-relaxed">
                  By continuing you agree to our{' '}
                  <Link href="/terms-and-conditions" className="text-brand-700 underline-offset-2 hover:underline">
                    terms
                  </Link>
                  ,{' '}
                  <Link href="/privacy-policy" className="text-brand-700 underline-offset-2 hover:underline">
                    privacy
                  </Link>{' '}
                  &{' '}
                  <Link href="/refund-policy" className="text-brand-700 underline-offset-2 hover:underline">
                    refund policy
                  </Link>
                  .
                </p>
              </form>
            </motion.div>

            {/* RIGHT — booking summary. Accordion on phones/tablets, sticky
                panel on desktop. */}
            <motion.aside
              variants={fadeUp}
              className="lg:col-span-5 order-1 lg:order-2 lg:sticky lg:top-6"
            >
              <button
                type="button"
                onClick={() => setSummaryOpen((o) => !o)}
                aria-expanded={summaryOpen}
                aria-controls="register-summary"
                className={cn(
                  'lg:hidden w-full flex items-center justify-between gap-3 rounded-2xl bg-white border border-ink-100 shadow-soft',
                  'px-4 py-3 text-left transition-all duration-300',
                  'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20',
                  summaryOpen && 'border-brand-200 shadow-elev',
                )}
              >
                <span className="min-w-0">
                  <span className="block font-display text-[15px] font-semibold text-ink-950">
                    Booking details
                  </span>
                  <span className="block text-[12px] text-ink-500 mt-0.5 truncate">
                    {plan.shortName} · {summaryOpen ? 'tap to hide' : 'tap to view'}
                  </span>
                </span>
                <span className="flex items-center gap-2.5 shrink-0">
                  <PriceTag vip={vip} className="font-display text-xl font-semibold" />
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

              <div
                id="register-summary"
                className={cn(
                  'grid transition-[grid-template-rows,margin,opacity] duration-500 ease-out',
                  'lg:!grid-rows-[1fr] lg:!opacity-100 lg:!mt-0',
                  summaryOpen ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0 mt-0',
                )}
              >
                <div className="overflow-hidden lg:overflow-visible">
                  <BookingSummary vip={vip} />
                </div>
              </div>
            </motion.aside>
          </motion.div>
        </Container>
      </main>

      <Footer hideCTA />

      {/* Spacer so the sticky bar never covers the footer's last row. */}
      <div aria-hidden className="h-44 lg:hidden" />

      {/* Phones + tablets: sticky upgrade toggle + button (image-2 pattern). */}
      <AnimatePresence>
        {!actionsInView && (
          <motion.div
            key="sticky"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: reduce ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 bottom-0 z-50 lg:hidden pb-safe border-t border-ink-100 bg-white/95 backdrop-blur-xl shadow-[0_-10px_30px_-12px_rgba(57,18,24,0.22)]"
          >
            <div className="mx-auto max-w-2xl px-3 sm:px-5 pt-2.5 pb-2.5 space-y-2">
              <StickyVipToggle checked={vip} onToggle={toggleVip} reduce={reduce} />
              <SubmitButton
                vip={vip}
                submitting={submitting}
                reduce={reduce}
                compact
                onClick={() => void onSubmit()}
              />
              <p className="text-center text-[11px] font-medium text-emerald-700">
                {vip
                  ? 'Secure payment · Lifetime access to the library'
                  : '100% free · Pick your slot on the next screen'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// Submit button — the label follows the upgrade, and shortens on phones
// ─────────────────────────────────────────────────────────────────────

function SubmitButton({
  vip,
  submitting,
  reduce,
  compact,
  onClick,
}: {
  vip: boolean
  submitting: boolean
  reduce: boolean
  compact?: boolean
  /** The sticky copy lives outside the <form>, so it submits by callback. */
  onClick?: () => void
}) {
  const full = vip
    ? `Recovery Roadmap Call + Postpartum Restore Video Library · ${VIP_PRICE}`
    : 'Book My Free Recovery Roadmap Call'
  const short = vip ? 'Recovery Roadmap Call + Video Library' : 'Book A Recovery Roadmap Call'
  const busy = vip ? 'Opening secure payment…' : 'Reserving your call…'

  return (
    <motion.button
      type={onClick ? 'button' : 'submit'}
      onClick={onClick}
      disabled={submitting}
      whileTap={submitting ? undefined : { scale: 0.98 }}
      className={cn(
        'group relative w-full inline-flex items-center justify-center gap-2 overflow-hidden',
        'rounded-full font-semibold tracking-tight leading-snug text-balance text-center',
        'text-white shadow-elev hover:shadow-glow',
        'transition-[background-color,box-shadow,transform] duration-500 ease-out',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30',
        'disabled:opacity-75 disabled:cursor-not-allowed',
        vip ? 'bg-ink-950 hover:bg-ink-900' : 'bg-brand-600 hover:bg-brand-700',
        compact ? 'px-4 py-3.5 text-[14.5px] sm:text-[15px]' : 'px-5 sm:px-6 py-4 text-[14.5px] sm:text-base',
      )}
    >
      {!reduce && !submitting && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-12"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.35), transparent)',
          }}
          animate={{ x: ['-150%', '350%'] }}
          transition={{ duration: 1.1, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1.6 }}
        />
      )}
      {submitting ? (
        <>
          <span className="relative w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin shrink-0" />
          <span className="relative">{busy}</span>
        </>
      ) : (
        <>
          {vip ? (
            <Crown className="relative w-[18px] h-[18px] shrink-0 text-accent-300" />
          ) : (
            <CalendarCheck className="relative w-[18px] h-[18px] shrink-0" />
          )}
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={vip ? 'vip' : 'free'}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: reduce ? 0 : 0.25 }}
              className="relative"
            >
              {/* Phones get the short label; the full one from sm up. */}
              <span className="sm:hidden">{short}</span>
              <span className="hidden sm:inline">{full}</span>
            </motion.span>
          </AnimatePresence>
          <ArrowRight className="relative w-[18px] h-[18px] shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" />
        </>
      )}
    </motion.button>
  )
}

// ─────────────────────────────────────────────────────────────────────
// The VIP upgrade box — deliberately the loudest thing on the page
// ─────────────────────────────────────────────────────────────────────

/** Fixed burst vectors, so the confetti looks the same on every render. */
const BURST = [
  [-46, -38], [0, -54], [46, -38], [58, 4], [40, 42], [-40, 42], [-58, 4], [18, -50],
] as const

function VipUpgradeBox({
  checked,
  onToggle,
  reduce,
}: {
  checked: boolean
  onToggle: () => void
  reduce: boolean
}) {
  // Bumped on every tick-ON so the confetti remounts and replays.
  const [burst, setBurst] = useState(0)
  const toggle = () => {
    if (!checked) setBurst((b) => b + 1)
    onToggle()
  }

  return (
    <motion.div
      role="checkbox"
      aria-checked={checked}
      aria-label={`Upgrade to VIP: add ${NAMING.library} for ${VIP_PRICE}`}
      tabIndex={0}
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault()
          toggle()
        }
      }}
      // Unticked: a slow breathing glow + a periodic nudge to catch the eye.
      animate={
        reduce || checked
          ? { scale: 1, boxShadow: '0 12px 40px -18px rgba(5,150,105,0.45)' }
          : {
              scale: [1, 1.012, 1, 1, 1],
              boxShadow: [
                '0 0 0 0 rgba(249,142,7,0.0)',
                '0 0 0 6px rgba(249,142,7,0.16)',
                '0 0 0 0 rgba(249,142,7,0.0)',
                '0 0 0 0 rgba(249,142,7,0.0)',
                '0 0 0 0 rgba(249,142,7,0.0)',
              ],
            }
      }
      transition={
        reduce || checked
          ? { duration: 0.3 }
          : { duration: 3.2, repeat: Infinity, ease: 'easeInOut' }
      }
      whileHover={reduce ? undefined : { y: -2 }}
      className={cn(
        'relative cursor-pointer select-none rounded-[22px] p-4 sm:p-6 transition-colors duration-500',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-400/40',
        checked ? 'bg-emerald-50/70' : 'bg-accent-50/80',
      )}
    >
      {/* Marching-ants border while unticked; solid once chosen. */}
      <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          rx="22"
          ry="22"
          fill="none"
          strokeWidth="2.5"
          strokeDasharray={checked ? undefined : '10 7'}
          className={cn(
            'transition-[stroke] duration-500',
            checked ? 'stroke-emerald-500' : 'stroke-accent-400',
            !checked && !reduce && 'animate-dash',
          )}
        />
      </svg>

      {/* Shine sweep */}
      {!reduce && !checked && (
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[22px]">
          <motion.div
            className="absolute inset-y-0 w-1/3 -skew-x-12"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.7), transparent)',
            }}
            animate={{ x: ['-120%', '420%'] }}
            transition={{ duration: 1.4, ease: 'easeInOut', repeat: Infinity, repeatDelay: 2.4 }}
          />
        </div>
      )}

      <div className="relative">
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Checkbox */}
          <span className="relative mt-0.5 shrink-0">
            {!checked && !reduce && (
              <span aria-hidden className="absolute inset-0 rounded-lg bg-accent-400 animate-pulseRing" />
            )}
            <motion.span
              animate={checked && !reduce ? { scale: [1, 1.25, 1] } : { scale: 1 }}
              transition={{ duration: 0.4 }}
              className={cn(
                'relative grid h-7 w-7 place-items-center rounded-lg border-2 transition-colors duration-300',
                checked
                  ? 'border-emerald-600 bg-emerald-600 text-white'
                  : 'border-accent-500 bg-white',
              )}
            >
              <AnimatePresence>
                {checked && (
                  <motion.span
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                  >
                    <Check className="h-4 w-4" strokeWidth={3.5} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.span>

            {/* Confetti on tick-on */}
            {!reduce && burst > 0 && (
              <span key={burst} aria-hidden className="pointer-events-none absolute left-1/2 top-1/2">
                {BURST.map(([x, y], i) => (
                  <motion.span
                    key={i}
                    className={cn(
                      'absolute h-1.5 w-1.5 rounded-full',
                      i % 3 === 0 ? 'bg-accent-400' : i % 3 === 1 ? 'bg-emerald-500' : 'bg-brand-500',
                    )}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    animate={{ x, y, opacity: 0, scale: 0.4 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                  />
                ))}
              </span>
            )}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-2.5 py-1 text-[9.5px] sm:text-[10px] uppercase tracking-[0.14em] font-bold text-white">
                <span className="relative flex h-1.5 w-1.5">
                  {!reduce && <span className="absolute inset-0 rounded-full bg-white animate-ping opacity-75" />}
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
                </span>
                Recommended
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-accent-300 to-accent-500 px-2.5 py-1 text-[9.5px] sm:text-[10px] uppercase tracking-[0.14em] font-bold text-ink-950">
                <Crown className="h-3 w-3" />
                VIP upgrade
              </span>
            </div>

            <div className="mt-2.5 flex items-start justify-between gap-3">
              <h3 className="font-display text-[15.5px] sm:text-[18px] font-semibold leading-snug text-ink-950 text-balance">
                Add {NAMING.library}
              </h3>
              <div className="shrink-0 text-right">
                <div className="font-display text-[18px] sm:text-[22px] font-bold leading-none text-accent-600 tabular-nums">
                  + {VIP_PRICE}
                </div>
                <div className="mt-1 text-[10.5px] sm:text-[11px] font-medium text-ink-500">one-time</div>
              </div>
            </div>

            <p className="mt-2 text-[13px] sm:text-[14px] leading-relaxed text-ink-700 text-pretty">
              Walk out of your call with Suvidhi&apos;s protocols already waiting
              for you, and the mothers&apos; community with you between calls.
            </p>
          </div>
        </div>

        <p className="mt-4 inline-flex items-center gap-1.5 text-[10.5px] sm:text-[11px] uppercase tracking-[0.14em] font-bold text-emerald-700">
          <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
          Everything in your free call, plus:
        </p>
        <ul className="mt-2.5 space-y-2">
          {VIP_PERKS.map((p, i) => {
            const Icon = p.icon
            return (
              <motion.li
                key={p.text}
                initial={reduce ? false : { opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.12, duration: 0.4 }}
                className="flex items-start gap-2.5"
              >
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-emerald-700 border border-emerald-200">
                  <Icon className="h-3 w-3" strokeWidth={2.5} />
                </span>
                <span className="text-[12.5px] sm:text-[13.5px] leading-snug text-ink-700 text-pretty">
                  {p.text}
                </span>
              </motion.li>
            )
          })}
        </ul>

        <p className="mt-3.5 flex items-start gap-2 rounded-xl bg-white/70 border border-ink-100 px-3 py-2.5 text-[12px] sm:text-[12.5px] leading-relaxed text-ink-600 text-pretty">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />
          <span>
            <span className="font-semibold text-ink-900">Library opens the moment your call ends</span>{' '}
            — so Suvidhi can point you at the exact protocols for your result.
          </span>
        </p>

        <AnimatePresence mode="wait" initial={false}>
          {checked ? (
            <motion.p
              key="added"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="mt-3.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] sm:text-[12.5px] font-bold uppercase tracking-[0.1em] text-emerald-700"
            >
              <Check className="h-4 w-4" strokeWidth={3} />
              VIP added to your booking
              <span className="font-medium normal-case tracking-normal text-ink-500">(tap to remove)</span>
            </motion.p>
          ) : (
            <motion.p
              key="add"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="mt-3.5 flex items-center gap-2 text-[12px] sm:text-[12.5px] font-bold uppercase tracking-[0.1em] text-brand-700"
            >
              <span aria-hidden className={cn('inline-block text-base', !reduce && 'animate-nudgeX')}>
                👉
              </span>
              Tap to add for {VIP_PRICE}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

/** The compact sticky-bar version of the upgrade (one tappable row). */
function StickyVipToggle({
  checked,
  onToggle,
  reduce,
}: {
  checked: boolean
  onToggle: () => void
  reduce: boolean
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onToggle}
      className={cn(
        'relative w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors duration-300',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-400/40',
        checked ? 'bg-emerald-50' : 'bg-accent-50',
      )}
    >
      <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          rx="12"
          ry="12"
          fill="none"
          strokeWidth="1.75"
          strokeDasharray={checked ? undefined : '8 5'}
          className={cn(
            checked ? 'stroke-emerald-500' : 'stroke-accent-400',
            !checked && !reduce && 'animate-dash',
          )}
        />
      </svg>
      <span
        className={cn(
          'relative grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 transition-colors',
          checked ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-accent-500 bg-white',
        )}
      >
        {checked && <Check className="h-3.5 w-3.5" strokeWidth={3.5} />}
      </span>
      <span className="relative inline-flex shrink-0 items-center gap-1 rounded-full bg-gradient-to-r from-accent-300 to-accent-500 px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] font-bold text-ink-950">
        <Crown className="h-2.5 w-2.5" />
        VIP
      </span>
      {/* Wraps to two lines on the narrowest phones rather than truncating. */}
      <span className="relative min-w-0 flex-1 text-[12.5px] sm:text-[13px] font-semibold leading-tight text-ink-900">
        Postpartum Recovery Video Library
      </span>
      <span className="relative shrink-0 font-display text-[14px] font-bold text-accent-600 tabular-nums">
        +{VIP_PRICE}
      </span>
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────
// Summary panel
// ─────────────────────────────────────────────────────────────────────

function PriceTag({ vip, className }: { vip: boolean; className?: string }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={vip ? 'vip' : 'free'}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.2 }}
        className={cn('tabular-nums', vip ? 'text-ink-950' : 'text-emerald-600', className)}
      >
        {vip ? VIP_PRICE : 'FREE'}
      </motion.span>
    </AnimatePresence>
  )
}

function BookingSummary({ vip }: { vip: boolean }) {
  const extras = PLANS.bundle.includes.slice(PLANS.call.includes.length)

  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-white border border-ink-100 shadow-soft p-5 sm:p-6">
        <div className="text-[11px] uppercase tracking-[0.2em] font-semibold text-brand-700">
          Your booking
        </div>

        <div className="mt-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-display text-[15px] font-semibold leading-snug text-ink-950">
              {NAMING.call}
            </div>
            <div className="mt-0.5 text-[12.5px] text-ink-500">30 min · 1:1 with Suvidhi · Google Meet</div>
          </div>
          <span className="shrink-0 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11.5px] font-bold text-emerald-700">
            FREE
          </span>
        </div>

        <AnimatePresence initial={false}>
          {vip && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-1.5 font-display text-[15px] font-semibold leading-snug text-ink-950">
                    <Crown className="h-4 w-4 shrink-0 text-accent-500" />
                    {NAMING.library}
                  </div>
                  <div className="mt-0.5 text-[12.5px] text-ink-500">VIP upgrade · lifetime access</div>
                </div>
                <span className="shrink-0 font-display text-[15px] font-semibold text-ink-950 tabular-nums">
                  {VIP_PRICE}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="my-4 h-px bg-ink-100" />

        <div className="flex items-center justify-between">
          <span className="font-display text-[17px] font-semibold text-ink-950">Total today</span>
          <PriceTag vip={vip} className="font-display text-2xl font-bold" />
        </div>
      </div>

      <div className="rounded-3xl border border-emerald-200 bg-emerald-50/60 p-5 sm:p-6">
        <div className="flex items-center gap-2 font-display text-[15px] font-semibold text-emerald-800">
          <Sparkles className="h-4 w-4" />
          What&apos;s included
        </div>
        <ul className="mt-3 space-y-2.5">
          {PLANS.call.includes.map((item) => (
            <SummaryItem key={item}>{item}</SummaryItem>
          ))}
          <AnimatePresence initial={false}>
            {vip &&
              extras.map((item) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-400 text-ink-950">
                      <Crown className="h-3 w-3" strokeWidth={2.5} />
                    </span>
                    <span className="text-[13px] leading-snug text-ink-700 text-pretty">{item}</span>
                  </div>
                </motion.li>
              ))}
          </AnimatePresence>
        </ul>
      </div>

      <div className="rounded-3xl border border-dashed border-emerald-300 bg-white p-5 sm:p-6">
        <div className="flex items-center gap-2 font-display text-[15px] font-semibold text-emerald-800">
          <Video className="h-4 w-4" />
          How it works
        </div>
        <ol className="mt-3 space-y-2 text-[13px] leading-snug text-ink-700">
          <li><span className="font-semibold text-ink-950">1.</span> Fill in your details here</li>
          <li><span className="font-semibold text-ink-950">2.</span> Pick a slot that suits you on the next screen</li>
          <li><span className="font-semibold text-ink-950">3.</span> Meet Suvidhi 1:1 on Google Meet — bring your reports</li>
        </ol>
      </div>

      <div className="flex items-center justify-center gap-2 text-[12.5px] text-ink-600">
        <span className="inline-flex items-center gap-0.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} className="w-3.5 h-3.5 fill-accent-400 text-accent-400" />
          ))}
        </span>
        {PROOF.rating}/5 · {PROOF.mothers} mothers coached
      </div>
    </div>
  )
}

function SummaryItem({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
        <Check className="h-3 w-3" strokeWidth={3} />
      </span>
      <span className="text-[13px] leading-snug text-ink-700 text-pretty">{children}</span>
    </li>
  )
}

// ─────────────────────────────────────────────────────────────────────
// Small pieces
// ─────────────────────────────────────────────────────────────────────

/**
 * VIP only. Buyers used to close the tab the second Razorpay said "success",
 * never reaching the booking calendar — so this says, before they pay, that
 * the redirect is part of the purchase.
 */
function StayOnPageNote() {
  return (
    <div className="flex items-start gap-2.5 rounded-2xl border border-amber-300 bg-amber-50/90 px-4 py-3">
      <Hourglass className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
      <p className="text-[12.5px] sm:text-[13px] leading-relaxed text-ink-700 text-pretty">
        <span className="font-semibold text-ink-950">After paying, stay on the page for up to 2 minutes.</span>{' '}
        You&apos;ll be taken straight to pick your call slot — closing the tab
        early means your slot isn&apos;t reserved.
      </p>
    </div>
  )
}

function PaymentErrorBanner({
  error,
}: {
  error: { message: string; code?: string; reason?: string }
}) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-brand-200 bg-brand-50/80 p-4 flex items-start gap-3"
    >
      <span className="mt-0.5 inline-flex w-7 h-7 rounded-full bg-brand-100 text-brand-700 border border-brand-200 items-center justify-center shrink-0">
        <X className="w-4 h-4" strokeWidth={2.5} />
      </span>
      <div className="flex-1 min-w-0 text-[13.5px] leading-relaxed text-ink-800">
        <div className="font-semibold text-ink-950">Payment didn&apos;t go through</div>
        <p className="mt-0.5 text-pretty">{error.message}</p>
        {(error.code || error.reason) && (
          <p className="mt-1 text-[12.5px] text-ink-600 break-words">
            {error.code && (
              <code className="font-mono px-1.5 py-0.5 rounded bg-white border border-ink-100 text-[11.5px] mr-1">
                {error.code}
              </code>
            )}
            {error.reason}
          </p>
        )}
        <p className="mt-2 text-[12.5px] text-ink-600">
          Try a different card / UPI ID, untick the upgrade to book your free
          call now, or write to{' '}
          <a
            href={`mailto:${BRAND.email}`}
            className="text-brand-700 font-semibold underline-offset-2 hover:underline break-all"
          >
            {BRAND.email}
          </a>
          .
        </p>
      </div>
    </div>
  )
}

function Step({ active, label }: { active?: boolean; label: string }) {
  return (
    <li
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-colors',
        active
          ? 'bg-brand-50 text-brand-700 border border-brand-200/60'
          : 'bg-white border border-ink-100 text-ink-500',
      )}
    >
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

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <div>
      <label className="block text-[13.5px] font-semibold text-ink-900 mb-1.5">
        {label} <span className="text-brand-600" aria-hidden>*</span>
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            role="alert"
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -4 }}
            transition={{ duration: 0.3 }}
            className="mt-1.5 flex items-center gap-1.5 text-[12.5px] text-brand-700 font-medium"
          >
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

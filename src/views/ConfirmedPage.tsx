'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  CalendarCheck,
  Check,
  CheckCircle2,
  Mail,
  MessageCircle,
  MessageSquareHeart,
  Sparkles,
} from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { TopMarquee } from '@/components/sections/TopMarquee'
import { Footer } from '@/components/sections/Footer'
import { BookACallStickyCTA } from '@/components/sections/BookACallStickyCTA'
import { getFunnelState } from '@/lib/funnelState'
import { fadeUp, stagger, VIEWPORT_ONCE } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { BRAND, CALENDLY, NAMING, SKOOL, WHATSAPP, type PlanId } from '@/lib/config'
import { appendUtm, loadUtm } from '@/lib/utm'
import { trackGa4EventOnce } from '@/lib/ga4'

/**
 * The post-payment confirmation page, in two variants:
 *
 *   plan="call"    → one step: book the call.
 *   plan="bundle"  → three steps: book the call, join the WhatsApp community,
 *                    then collect the course credentials from email.
 *
 * Step 1 is the same in both, and it is deliberately the FIRST thing on the
 * page in both. Payment does not book anything on its own — this screen is
 * where the slot actually gets reserved, which is exactly why /checkout now
 * makes buyers acknowledge that they have to arrive here.
 */

interface CheckoutState {
  plan?: string
  name?: string
  email?: string
  phone?: string
  orderId?: string
  paymentId?: string
  amountPaid?: number
  coupon?: string
}

function buildCalendlyUrl(state: CheckoutState): string {
  if (!CALENDLY.url) return ''
  const url = new URL(CALENDLY.url)
  if (state.name) url.searchParams.set('name', state.name)
  if (state.email) url.searchParams.set('email', state.email)
  if (state.phone) url.searchParams.set('a1', state.phone)
  if (state.orderId) url.searchParams.set('a2', state.orderId)

  const utm = loadUtm()
  if (utm.utm_source) url.searchParams.set('utm_source', utm.utm_source)
  if (utm.utm_medium) url.searchParams.set('utm_medium', utm.utm_medium)
  if (utm.utm_campaign) url.searchParams.set('utm_campaign', utm.utm_campaign)
  if (utm.utm_term) url.searchParams.set('utm_term', utm.utm_term)
  if (utm.utm_content) url.searchParams.set('utm_content', utm.utm_content)

  if (CALENDLY.hideGdpr) url.searchParams.set('hide_gdpr_banner', '1')
  if (CALENDLY.hideEventTypeDetails)
    url.searchParams.set('hide_event_type_details', '1')
  url.searchParams.set('background_color', 'ffffff')
  url.searchParams.set('text_color', '1f1e1e')
  url.searchParams.set('primary_color', 'CB4A5D')

  return url.toString()
}

interface ConfirmedPageProps {
  plan: PlanId
}

export default function ConfirmedPage({ plan }: ConfirmedPageProps) {
  const [checkoutState] = useState<CheckoutState>(
    () => getFunnelState<CheckoutState>() ?? {},
  )
  // Flipped by the Calendly embed's postMessage. Step 1 turns green in place
  // rather than navigating away, because the bundle still has steps 2 and 3
  // below it and we must not strand anyone mid-list.
  const [booked, setBooked] = useState(false)

  const isBundle = plan === 'bundle'
  const calendlyUrl = useMemo(() => buildCalendlyUrl(checkoutState), [checkoutState])
  const communityUrl = WHATSAPP.communityUrl ? appendUtm(WHATSAPP.communityUrl) : ''
  const courseUrl = SKOOL.url ? appendUtm(SKOOL.url) : ''
  const firstName = checkoutState.name?.split(' ')[0]
  const totalSteps = isBundle ? 3 : 1

  useEffect(() => {
    document.title = `You're in · Book your ${NAMING.call}`
    window.scrollTo({ top: 0 })

    const onMessage = (ev: MessageEvent) => {
      // Booking happens inside the Calendly iframe — there's no button of ours
      // to attach to, so we listen for the embed's postMessage. Origin-checked
      // so any other frame on the page can't spoof a booking.
      let host = ''
      try {
        host = new URL(ev.origin).hostname
      } catch {
        return
      }
      if (host !== 'calendly.com' && !host.endsWith('.calendly.com')) return

      const data = ev.data
      if (!data || typeof data !== 'object') return
      if ((data as { event?: string }).event === 'calendly.event_scheduled') {
        // GA4 only — fires on an ACTUAL booking, once per browser. No browser
        // Meta event fires here: the downstream QualifiedLead CAPI event is
        // fired by the CRM Apps Script when the sales team marks the lead
        // qualified in the Sheet.
        trackGa4EventOnce('book_a_call')
        setBooked(true)
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  return (
    <div className="relative min-h-screen flex flex-col">
      <TopMarquee />

      <main className="relative flex-1">
        {/* ── Confirmation hero ── */}
        <section className="relative isolate overflow-hidden">
          <div aria-hidden className="absolute inset-0 -z-10">
            <div
              className="absolute -top-32 left-1/2 -translate-x-1/2 w-[120%] h-[55vh] blur-3xl opacity-70"
              style={{
                background:
                  'radial-gradient(closest-side, rgba(236,158,169,.55), transparent 70%)',
              }}
            />
          </div>

          <Container className="relative pt-10 pb-8 sm:pt-14 sm:pb-10">
            <motion.div
              variants={stagger(0.08, 0.06)}
              initial="hidden"
              animate="show"
              className="mx-auto max-w-3xl text-center"
            >
              <motion.span
                variants={fadeUp}
                className="inline-flex items-center gap-2 rounded-full bg-brand-50 border border-brand-200/70 px-3.5 py-2 text-[11px] uppercase tracking-[0.18em] font-bold text-brand-700"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Payment received
              </motion.span>

              <motion.h1 variants={fadeUp} className="h-display mt-5 text-balance">
                {firstName ? `${firstName}, your ` : 'Your '}
                <span className="grad-text">payment is confirmed</span>.
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="mx-auto mt-5 max-w-2xl text-[16px] sm:text-[17.5px] leading-relaxed text-ink-700 text-pretty"
              >
                {isBundle ? (
                  <>
                    Three things left, and they take about two minutes together.
                    Work down the list in order —{' '}
                    <strong className="text-ink-950">
                      your call is not booked until you pick a slot in Step 1
                    </strong>
                    .
                  </>
                ) : (
                  <>
                    One thing left.{' '}
                    <strong className="text-ink-950">
                      Your call is not booked until you pick a slot below
                    </strong>{' '}
                    — it takes about thirty seconds.
                  </>
                )}
              </motion.p>

              {checkoutState.paymentId && (
                <motion.p
                  variants={fadeUp}
                  className="mt-4 text-[12.5px] text-ink-500"
                >
                  Order reference{' '}
                  <code className="rounded bg-cream-dark border border-ink-100 px-1.5 py-0.5 font-mono text-[11.5px] text-ink-700">
                    {checkoutState.paymentId}
                  </code>
                </motion.p>
              )}
            </motion.div>
          </Container>
        </section>

        {/* ── STEP 1 — book the call (both variants) ── */}
        <section id="calendar" className="relative pb-12 sm:pb-16 scroll-mt-4">
          <Container>
            <StepHeader
              n={1}
              of={totalSteps}
              icon={CalendarCheck}
              title="Book your Postpartum Recovery Roadmap Call"
              desc="30 minutes, 1:1 with Suvidhi, on Google Meet. Pick the time that actually works around your day."
              done={booked}
            />

            <div className="relative mx-auto mt-6 max-w-5xl overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-elev">
              <div className="flex items-center gap-3 border-b border-ink-100 bg-cream-dark/40 px-5 py-4 sm:px-7 sm:py-5">
                <span className="icon-tile h-10 w-10 rounded-xl">
                  <CalendarCheck className="h-4 w-4" strokeWidth={2} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-display text-[16px] font-semibold leading-tight text-ink-950">
                    Pick a time that works for you
                  </div>
                  <div className="text-[12.5px] text-ink-600">
                    30-min 1:1 with Suvidhi · Google Meet
                  </div>
                </div>
                <span className="hidden items-center gap-1.5 rounded-full border border-brand-200/60 bg-brand-50 px-2.5 py-1 text-[11.5px] uppercase tracking-[0.18em] font-semibold text-brand-700 sm:inline-flex">
                  <Sparkles className="h-3 w-3" /> Live calendar
                </span>
              </div>

              {calendlyUrl ? (
                <iframe
                  src={calendlyUrl}
                  title="Schedule your Postpartum Recovery Roadmap Call"
                  width="100%"
                  height="780"
                  frameBorder={0}
                  loading="lazy"
                  className="block w-full min-h-[680px]"
                />
              ) : (
                <CalendlyPlaceholder />
              )}
            </div>

            <p className="mt-5 text-center text-[13px] text-ink-600">
              Trouble seeing the calendar? Disable your ad-blocker, or write to us
              at{' '}
              <a
                href={`mailto:${BRAND.email}`}
                className="font-semibold text-brand-700 underline-offset-2 hover:underline break-all"
              >
                {BRAND.email}
              </a>
              .
            </p>
          </Container>
        </section>

        {/* ── STEPS 2 & 3 — bundle only ── */}
        {isBundle && (
          <section className="relative pb-14 sm:pb-18">
            <Container>
              <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-2">
                {/* Step 2 — WhatsApp community */}
                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={VIEWPORT_ONCE}
                  className="flex flex-col card p-6 sm:p-7"
                >
                  <StepBadge n={2} of={totalSteps} />
                  <span className="mt-4 icon-tile-lg">
                    <MessageCircle className="h-6 w-6" strokeWidth={1.75} />
                  </span>
                  <h2 className="mt-4 font-display text-xl font-semibold leading-tight text-ink-950 sm:text-2xl text-balance">
                    Join the private WhatsApp community
                  </h2>
                  <p className="mt-2.5 flex-1 text-[14.5px] leading-relaxed text-ink-700 text-pretty">
                    This is where the mothers already inside the programme ask
                    their questions between calls. Join now so you are not
                    hunting for the link later.
                  </p>

                  {communityUrl ? (
                    <a
                      href={communityUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        'group relative mt-6 inline-flex items-center justify-center gap-2.5 overflow-hidden',
                        'rounded-full px-6 py-3.5 text-[15px] font-semibold tracking-tight',
                        'bg-brand-600 text-white hover:bg-brand-700',
                        'shadow-elev transition-all duration-500 ease-out hover:-translate-y-0.5 hover:shadow-glow',
                        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30',
                      )}
                    >
                      <MessageCircle className="h-[18px] w-[18px]" />
                      Join the community
                    </a>
                  ) : (
                    <p className="mt-6 rounded-2xl border border-ink-100 bg-cream-dark/50 p-4 text-[13px] leading-relaxed text-ink-600">
                      Your invite link is on its way by email and WhatsApp. (Set{' '}
                      <code className="rounded bg-white border border-ink-100 px-1.5 py-0.5 font-mono text-[11.5px]">
                        NEXT_PUBLIC_WHATSAPP_COMMUNITY_URL
                      </code>{' '}
                      to show the join button here.)
                    </p>
                  )}
                </motion.div>

                {/* Step 3 — course credentials by email */}
                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={VIEWPORT_ONCE}
                  className="flex flex-col card p-6 sm:p-7"
                >
                  <StepBadge n={3} of={totalSteps} />
                  <span className="mt-4 icon-tile-lg">
                    <Mail className="h-6 w-6" strokeWidth={1.75} />
                  </span>
                  <h2 className="mt-4 font-display text-xl font-semibold leading-tight text-ink-950 sm:text-2xl text-balance">
                    Check your inbox for your course access
                  </h2>
                  <p className="mt-2.5 text-[14.5px] leading-relaxed text-ink-700 text-pretty">
                    Your login details for {NAMING.library} are on their way to{' '}
                    {checkoutState.email ? (
                      <span className="font-semibold text-ink-950 break-all">
                        {checkoutState.email}
                      </span>
                    ) : (
                      'the email address you used at checkout'
                    )}
                    .
                  </p>

                  <ul className="mt-4 flex-1 space-y-2.5">
                    {[
                      'The email arrives from the community platform — accept the invite to set your password.',
                      'Not there in 10 minutes? Check spam and promotions, then search for the sender.',
                      'The library unlocks the moment your call ends, so Suvidhi can point you at the exact protocols for your result.',
                    ].map((t) => (
                      <li key={t} className="flex items-start gap-2.5">
                        <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-brand-200/60 bg-brand-50 text-brand-700">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                        <span className="text-[13.5px] leading-snug text-ink-700 text-pretty">
                          {t}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Direct link to the course platform, so nobody is stuck
                      waiting on an email that landed in spam. Hidden until
                      NEXT_PUBLIC_SKOOL_COMMUNITY_URL is set. */}
                  {courseUrl && (
                    <a
                      href={courseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        'group relative mt-5 inline-flex items-center justify-center gap-2.5 overflow-hidden',
                        'rounded-full px-6 py-3.5 text-[15px] font-semibold tracking-tight',
                        'border-2 border-brand-600 text-brand-700 hover:bg-brand-50',
                        'transition-all duration-500 ease-out hover:-translate-y-0.5',
                        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30',
                      )}
                    >
                      <Mail className="h-[18px] w-[18px]" />
                      Open the course platform
                    </a>
                  )}

                  <p className="mt-5 text-[12.5px] leading-relaxed text-ink-600">
                    Still nothing? Email{' '}
                    <a
                      href={`mailto:${BRAND.email}`}
                      className="font-semibold text-brand-700 underline-offset-2 hover:underline break-all"
                    >
                      {BRAND.email}
                    </a>{' '}
                    and we&apos;ll add you manually.
                  </p>
                </motion.div>
              </div>
            </Container>
          </section>
        )}

        {/* ── A note from Suvidhi ── */}
        <section className="relative pb-14 sm:pb-16">
          <Container size="narrow">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={VIEWPORT_ONCE}
              className="relative mx-auto max-w-2xl"
            >
              <div className="relative overflow-hidden rounded-[28px] border border-brand-200/60 surface-tint p-7 text-center shadow-soft sm:p-9 lg:p-10">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full opacity-50 blur-3xl"
                  style={{
                    background:
                      'radial-gradient(closest-side, rgba(236,158,169,.6), transparent 70%)',
                  }}
                />
                <div className="relative inline-flex eyebrow">
                  <MessageSquareHeart className="h-3 w-3" />
                  A personal note from Suvidhi
                </div>

                <div className="relative mt-6 space-y-4 text-[1.05rem] leading-relaxed text-brand-800 text-pretty sm:text-[1.2rem]">
                  <p className="font-script">
                    I run every Roadmap Call myself, so bring your most recent
                    blood report if you have one.
                  </p>
                  <p className="font-script">
                    If you don&apos;t, come anyway — I&apos;ll tell you exactly
                    which panel to get.
                  </p>
                  <p className="font-script">
                    My calendar is limited each week, so please pick your slot
                    while you are here.
                  </p>
                </div>
              </div>
            </motion.div>
          </Container>
        </section>
      </main>

      <Footer hideCTA />
      {/* Only nags while the slot is still unbooked. */}
      {!booked && <BookACallStickyCTA targetId="calendar" />}
    </div>
  )
}

function StepBadge({ n, of }: { n: number; of: number }) {
  return (
    <span className="inline-flex w-fit items-center gap-2 rounded-full border border-brand-200/60 bg-brand-50 px-3 py-1 text-[10.5px] uppercase tracking-[0.18em] font-bold text-brand-700">
      Step {n} of {of}
    </span>
  )
}

function StepHeader({
  n,
  of,
  icon: Icon,
  title,
  desc,
  done,
}: {
  n: number
  of: number
  icon: typeof CalendarCheck
  title: string
  desc: string
  done?: boolean
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT_ONCE}
      className="mx-auto flex max-w-3xl flex-col items-center text-center"
    >
      <div className="flex items-center gap-2.5">
        {/* "Step 1 of 1" reads as noise — only label steps when there is a list. */}
        {of > 1 && <StepBadge n={n} of={of} />}
        {done && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10.5px] uppercase tracking-[0.18em] font-bold text-emerald-700">
            <Check className="h-3 w-3" strokeWidth={3} />
            Slot booked
          </span>
        )}
      </div>

      <span className="mt-4 icon-tile-lg">
        <Icon className="h-6 w-6" strokeWidth={1.75} />
      </span>

      <h2 className="mt-4 h-sub text-balance">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-ink-600 text-pretty sm:text-[16px]">
        {desc}
      </p>
    </motion.div>
  )
}

function CalendlyPlaceholder() {
  return (
    <div className="p-8 text-center sm:p-12">
      <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-200/60 bg-brand-50 text-brand-700">
        <CalendarCheck className="h-7 w-7" strokeWidth={1.75} />
      </span>
      <h4 className="mt-4 font-display text-xl font-semibold text-ink-950">
        Calendar coming up
      </h4>
      <p className="mx-auto mt-2 max-w-sm text-[14.5px] leading-relaxed text-ink-600">
        Add your Calendly event URL to{' '}
        <code className="rounded border border-ink-100 bg-cream-dark px-1.5 py-0.5 text-[12.5px] text-ink-800">
          NEXT_PUBLIC_CALENDLY_URL
        </code>{' '}
        in the <code>.env</code> file and reload to embed the live booking widget
        here.
      </p>
      <p className="mt-4 text-[13px] text-ink-600">
        In the meantime,{' '}
        <Link
          href="/"
          className="font-semibold text-brand-700 underline-offset-2 hover:underline"
        >
          head back to the landing page
        </Link>
        .
      </p>
    </div>
  )
}

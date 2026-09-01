'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Lock,
  MessageCircle,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Star,
} from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { TopMarquee } from '@/components/sections/TopMarquee'
import { Footer } from '@/components/sections/Footer'
import { cn } from '@/lib/utils'
import { fadeUp, stagger } from '@/lib/motion'
import {
  ADDON_ONLY_PRICE_LABEL,
  NAMING,
  PLANS,
  PROOF,
  type PlanId,
} from '@/lib/config'
import { captureUtm, utmQueryString } from '@/lib/utm'
import { setFunnelState } from '@/lib/funnelState'

/**
 * The OTO step — the only place the buyer chooses what they are paying for.
 *
 * The ₹97 Roadmap Call is MANDATORY and pre-selected: both options include it,
 * so there is no path through this page that does not book a call. The upgrade
 * swaps in the all-in bundle price rather than adding a second line item.
 *
 * The chosen plan is handed to /checkout two ways — the query string (survives
 * a refresh, a shared link, a restored tab) and sessionStorage (survives a
 * stripped URL). Checkout treats the query string as authoritative and falls
 * back to `call`, so a lost hand-off can never silently upsell anyone.
 */

interface Perk {
  icon: typeof Check
  text: string
}

const CALL_PERKS: Perk[] = [
  {
    icon: Clock,
    text: 'A 30-minute 1:1 Postpartum Recovery Roadmap Call with Suvidhi',
  },
  {
    icon: ShieldCheck,
    text: `${NAMING.mechanism} run against your own reports — depletion, metabolism, absorption, neuro-endocrine`,
  },
  {
    icon: Check,
    text: 'Your primary and secondary block identified, and exactly what to do first',
  },
]

const BUNDLE_PERKS: Perk[] = [
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

export default function OtoPage() {
  const router = useRouter()
  const [plan, setPlan] = useState<PlanId>('call')

  useEffect(() => {
    document.title = `Choose your start · ${NAMING.call}`
    window.scrollTo({ top: 0 })
    captureUtm()
  }, [])

  const goToCheckout = () => {
    // Belt and braces: sessionStorage for a stripped URL, query string for a
    // refresh. Checkout prefers the query string.
    setFunnelState({ plan })
    const utm = utmQueryString()
    const sep = utm ? '&' : '?'
    router.push(`/checkout${utm}${sep}plan=${plan}`)
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <TopMarquee />

      <main className="relative flex-1 py-8 sm:py-12">
        <Container>
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-600 hover:text-brand-700 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
              Back to landing
            </Link>
            <ol className="flex items-center gap-1.5 sm:gap-2 text-[11.5px] sm:text-xs font-medium">
              <Step active label="1. Your start" />
              <Sep />
              <Step label="2. Details & payment" />
              <Sep />
              <Step label="3. Book your slot" />
            </ol>
          </div>

          <motion.div
            variants={stagger(0.08, 0.05)}
            initial="hidden"
            animate="show"
            className="mx-auto max-w-4xl"
          >
            <motion.div variants={fadeUp} className="text-center">
              <span className="eyebrow">One step before you pick your slot</span>
              <h1 className="h-section mt-4 text-balance">
                How Would You Like To{' '}
                <span className="grad-text">Start?</span>
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-[15px] sm:text-[16.5px] leading-relaxed text-ink-600 text-pretty">
                Your {PLANS.call.priceLabel}{' '}
                Roadmap Call is included either way. The only question is whether
                you want Suvidhi&apos;s protocols and the mothers&apos; community
                waiting for you the moment that call ends.
              </p>
            </motion.div>

            {/* ── The two options ── */}
            <motion.div
              variants={fadeUp}
              role="radiogroup"
              aria-label="Choose how to start"
              // gap-7 stacked so the "Most chosen" ribbon, which hangs above
              // its card, never crowds the card before it.
              className="mt-9 grid gap-7 sm:mt-11 lg:grid-cols-2 lg:gap-5"
            >
              <OptionCard
                id="call"
                selected={plan === 'call'}
                onSelect={setPlan}
                title={NAMING.call}
                price={PLANS.call.priceLabel}
                priceNote="to start"
                blurb="The clinical assessment on its own. You leave the call knowing which of the four systems is your block and what to do first."
                perks={CALL_PERKS}
              />

              <OptionCard
                id="bundle"
                selected={plan === 'bundle'}
                onSelect={setPlan}
                recommended
                title={`${NAMING.call} + ${NAMING.library}`}
                price={PLANS.bundle.priceLabel}
                priceNote="all in"
                blurb={`Everything in the call, plus the protocols and the community — ${ADDON_ONLY_PRICE_LABEL} more than the call on its own, and you keep the library for life.`}
                perks={BUNDLE_PERKS}
                inheritsFrom={NAMING.call}
              />
            </motion.div>

            {/* Access timing — this is the whole reason the bump works as a
                show-up incentive rather than a reason to skip the call. */}
            <motion.p
              variants={fadeUp}
              className="mx-auto mt-6 flex max-w-2xl items-start gap-2.5 rounded-2xl border border-brand-200/60 surface-tint p-4 text-[13.5px] leading-relaxed text-ink-700 text-pretty"
            >
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
              <span>
                <span className="font-semibold text-ink-950">
                  Library access opens the moment your call ends
                </span>
                , not at payment — so Suvidhi can point you at the exact
                protocols for your result while they are still fresh. You can
                start the same evening.
              </span>
            </motion.p>

            {/* ── Continue ── */}
            <motion.div
              variants={fadeUp}
              className="mt-8 flex flex-col items-center gap-4"
            >
              <button
                type="button"
                onClick={goToCheckout}
                className={cn(
                  'group relative inline-flex w-full max-w-md items-center justify-center gap-2.5 overflow-hidden',
                  'rounded-full px-6 py-4 text-[15px] sm:text-base font-semibold tracking-tight',
                  'bg-brand-600 text-white hover:bg-brand-700',
                  'shadow-elev transition-all duration-500 ease-out hover:-translate-y-0.5 hover:shadow-glow',
                  'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30',
                )}
              >
                <span className="relative">
                  Continue · {PLANS[plan].priceLabel}
                </span>
                <ArrowRight className="relative h-[18px] w-[18px] transition-transform duration-300 group-hover:translate-x-0.5" />
              </button>

              <ul className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-2">
                {[
                  { icon: ShieldCheck, label: '100% Money-Back Guarantee' },
                  { icon: Star, label: `${PROOF.mothers} Success Stories` },
                  { icon: Lock, label: 'Secure PCI-DSS payment' },
                ].map(({ icon: Icon, label }) => (
                  <li
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-ink-100 bg-white px-3 py-1.5 text-[11.5px] font-semibold text-ink-700 shadow-soft sm:text-[12.5px]"
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0 text-brand-600" strokeWidth={2} />
                    {label}
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        </Container>
      </main>

      <Footer hideCTA />
    </div>
  )
}

function OptionCard({
  id,
  selected,
  onSelect,
  title,
  price,
  priceNote,
  blurb,
  perks,
  recommended,
  inheritsFrom,
}: {
  id: PlanId
  selected: boolean
  onSelect: (id: PlanId) => void
  title: string
  price: string
  priceNote: string
  blurb: string
  perks: Perk[]
  recommended?: boolean
  /** Renders an "everything in X, plus:" line above the perk list. */
  inheritsFrom?: string
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(id)}
      className={cn(
        'relative flex h-full flex-col rounded-[28px] border p-6 text-left transition-all duration-300 sm:p-7',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/25',
        selected
          ? 'border-brand-400 bg-white shadow-elev ring-2 ring-brand-500/25'
          : 'border-ink-100 bg-white/80 shadow-soft hover:border-brand-200 hover:shadow-elev',
      )}
    >
      {recommended && (
        <span className="absolute -top-3 right-5 inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-3 py-1 text-[10px] uppercase tracking-[0.18em] font-bold text-white shadow-soft">
          <Sparkles className="h-3 w-3" />
          Most chosen
        </span>
      )}

      <div className="flex items-start gap-3.5">
        {/* Radio */}
        <span
          aria-hidden
          className={cn(
            'mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition-colors duration-300',
            selected ? 'border-brand-600 bg-brand-600 text-white' : 'border-ink-200 bg-white',
          )}
        >
          {selected && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
        </span>

        <div className="min-w-0 flex-1">
          <h2 className="font-display text-[1.05rem] sm:text-[1.2rem] font-semibold leading-tight text-ink-950 text-balance">
            {title}
          </h2>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-3xl font-semibold leading-none text-brand-600 tabular-nums">
              {price}
            </span>
            <span className="text-[12.5px] font-medium text-ink-500">{priceNote}</span>
          </div>
        </div>
      </div>

      <p className="mt-4 text-[14px] leading-relaxed text-ink-600 text-pretty sm:text-[14.5px]">
        {blurb}
      </p>

      {inheritsFrom && (
        <p className="mt-4 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] font-bold text-brand-700">
          <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
          Everything in the {inheritsFrom}, plus:
        </p>
      )}

      <ul className={cn('space-y-2.5', inheritsFrom ? 'mt-3' : 'mt-4')}>
        {perks.map((p) => {
          const Icon = p.icon
          return (
            <li key={p.text} className="flex items-start gap-2.5">
              <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700 border border-brand-200/60">
                <Icon className="h-3 w-3" strokeWidth={2.5} />
              </span>
              <span className="text-[13.5px] leading-snug text-ink-700 text-pretty">
                {p.text}
              </span>
            </li>
          )
        })}
      </ul>
    </button>
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

function Sep() {
  return <span aria-hidden className="hidden sm:block w-4 h-px bg-ink-200" />
}

import { motion } from 'framer-motion'
import { ShieldCheck, Star, Trophy } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import Image from 'next/image'
import { CtaBlock } from '@/components/ui/CtaBlock'
import { fadeUp, scaleIn, stagger } from '@/lib/motion'
import { NAMING, PLANS, PROOF } from '@/lib/config'

// Conditions the audience is fighting alongside weight loss — rendered as
// pills *below* the sub-copy, the way the reference layout stacks
// headline → sub-headline → proof line → pills.
const PAIN_POINTS = [
  'Thyroid Issues',
  'Insulin Resistance',
  'Excessive Hair Fall',
  'Low Energy',
  'Diastasis Recti',
  'Brain Fog',
]

// Badge row above the eyebrow (dev spec §2, Section 1).
const BADGES = [
  { icon: Star, label: `${PROOF.rating} Review`, stars: true },
  { icon: Trophy, label: `${PROOF.mothers} Success Stories`, stars: false },
  { icon: ShieldCheck, label: '100% Money-Back Guarantee', stars: false },
]

export function Hero() {
  return (
    <section id="top" className="relative isolate overflow-hidden">
      {/* Ambient backdrop */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[120%] h-[60vh] blur-3xl opacity-70"
          style={{
            background:
              'radial-gradient(closest-side, rgba(236,158,169,.55), transparent 70%)',
          }}
        />
        <div
          className="absolute top-40 -right-20 w-[40vw] h-[40vw] rounded-full blur-3xl opacity-40"
          style={{
            background:
              'radial-gradient(closest-side, rgba(255,202,74,.30), transparent 70%)',
          }}
        />
      </div>

      <Container className="relative pt-8 pb-12 sm:pt-12 sm:pb-16 lg:pt-8 lg:pb-16">
        {/* ── Title block ── */}
        <motion.div
          variants={stagger(0.07, 0.06)}
          initial={false}
          animate="show"
          className="mx-auto max-w-4xl text-center flex flex-col items-center"
        >
          {/* Badge row — sits ABOVE the eyebrow */}
          <motion.ul
            variants={fadeUp}
            className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5"
          >
            {BADGES.map(({ icon: Icon, label, stars }) => (
              <li
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full bg-white border border-ink-100 shadow-soft px-3 py-1.5 text-[11.5px] sm:text-[12.5px] font-semibold text-ink-700"
              >
                {stars ? (
                  <span className="inline-flex items-center gap-0.5" aria-hidden>
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} className="w-3 h-3 fill-brand-500 text-brand-500" />
                    ))}
                  </span>
                ) : (
                  <Icon className="w-3.5 h-3.5 text-brand-600" strokeWidth={2} />
                )}
                {label}
              </li>
            ))}
          </motion.ul>

          {/* Eyebrow — live dot only */}
          <motion.span
            variants={fadeUp}
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-brand-50 border border-brand-200/70 text-brand-700 px-3.5 py-2 sm:px-4 text-[12px] sm:text-[13px] font-semibold leading-snug"
          >
            <span className="relative flex w-2 h-2 shrink-0">
              <span className="absolute inline-flex w-full h-full rounded-full bg-brand-400 opacity-70 animate-ping" />
              <span className="relative inline-flex w-2 h-2 rounded-full bg-brand-600" />
            </span>
            For Women 3–24 Months Postpartum Who Still Don&apos;t Feel Fully
            Recovered
          </motion.span>

          {/* Title — outcome-led headline. Line 1 sits in a tinted box, the
              "Up To 40%" claim carries the brand gradient. Each line is a
              block so the three-line stack holds on desktop; long lines still
              wrap naturally on narrow phones. */}
          <motion.h1
            variants={fadeUp}
            className="font-display font-semibold leading-[1.16] tracking-tight text-ink-950 mt-5 text-[1.8rem] xs:text-[2.05rem] sm:text-[2.45rem] lg:text-[2.95rem] text-balance"
          >
            <span className="block">
              <span className="inline-block rounded-2xl bg-brand-50 border border-brand-200/70 px-3 py-0.5 sm:px-4 sm:py-1">
                <span className="grad-text">Lose 5-15 Kilos</span>
              </span>
            </span>
            <span className="block mt-1.5 sm:mt-2">Reduce Mummy Belly</span>
            <span className="block">
              &amp; Diastasis Recti By{' '}
              <span className="grad-text">Up To 40%</span>
            </span>
          </motion.h1>

          {/* Sub-headline — attaches the headline promise to the 90-day
              PROGRAMME, not to a digital product. That one word is what makes
              the rest of the funnel congruent (dev spec §2, Section 1). */}
          <motion.p
            variants={fadeUp}
            className="mt-4 font-display font-semibold text-brand-700 text-[15px] sm:text-[17px] lg:text-[19px] leading-snug max-w-3xl mx-auto text-balance"
          >
            Through the{' '}
            <span className="text-brand-800">{NAMING.programmeShort}</span>,
            designed to help postpartum women recover, rebuild &amp; lose weight
            sustainably.
          </motion.p>

          {/* Proof line — leads into the condition pills below */}
          <motion.p
            variants={fadeUp}
            className="mt-3.5 text-ink-600 text-[13.5px] sm:text-[15px] leading-relaxed sm:leading-loose max-w-3xl mx-auto text-pretty"
          >
            <span className="font-semibold text-ink-900">
              {PROOF.mothers} postpartum moms globally
            </span>{' '}
            have achieved{' '}
            {/* inline-block keeps the tinted box from splitting across lines */}
            <span className="inline-block rounded-md bg-brand-50 border border-brand-200/70 px-1.5 py-0.5 font-semibold text-brand-700">
              lasting weight loss
            </span>{' '}
            while overcoming challenges such as:
          </motion.p>

          {/* Condition pills */}
          <motion.div
            variants={fadeUp}
            className="mt-4 flex flex-wrap justify-center gap-2 sm:gap-2.5"
          >
            {PAIN_POINTS.map((p) => (
              <span
                key={p}
                className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-white border border-ink-100 shadow-soft px-3.5 py-1.5 sm:px-4 sm:py-2 text-[13px] sm:text-[14.5px] font-semibold text-ink-800"
              >
                <span className="relative flex w-2 h-2">
                  <span className="absolute inline-flex w-full h-full rounded-full bg-brand-400 opacity-70 animate-ping" />
                  <span className="relative inline-flex w-2 h-2 rounded-full bg-brand-600" />
                </span>
                {p}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* ── Hero graphic — occupies the slot the reference pages give a VSL.
            There is no video, so there is deliberately no "watch the short
            video below" line above it: a designed static panel instead of a
            broken expectation (dev spec Part 3). ── */}
        <motion.div
          variants={scaleIn}
          initial={false}
          animate="show"
          className="relative mx-auto mt-9 sm:mt-11 w-full max-w-3xl"
        >
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[28px] border border-brand-200/60 shadow-elev bg-ink-950">
            <Image
              src="/images/suvidhi/dsc00257.jpg"
              alt={`${NAMING.clinician} — ${NAMING.clinicianTitle}`}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover object-top"
              priority
            />
            {/* Legibility scrim — bottom-weighted so the overlay copy reads */}
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(180deg, rgba(33,30,30,.55) 0%, rgba(33,30,30,.05) 35%, rgba(57,18,24,.85) 100%)',
              }}
            />

            {/* Top-left credential badge */}
            <span className="absolute left-3 top-3 sm:left-5 sm:top-5 inline-flex items-center gap-1.5 rounded-full bg-white/12 border border-white/25 backdrop-blur-md px-2.5 sm:px-3.5 py-1.5 text-[9.5px] sm:text-[11px] uppercase tracking-[0.16em] font-bold text-cream">
              UK-Trained Clinical Nutritionist
            </span>

            {/* Overlay headline */}
            <p className="absolute inset-x-4 sm:inset-x-8 bottom-14 sm:bottom-[4.5rem] font-display text-[15px] xs:text-[17px] sm:text-[22px] lg:text-[26px] font-semibold leading-snug text-cream text-balance">
              30 minutes. Your blood report. The four reasons your body is still
              stuck.
            </p>

            {/* Bottom bar */}
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 border-t border-white/15 bg-ink-950/45 px-4 sm:px-7 py-2.5 sm:py-3.5 backdrop-blur-md">
              <span className="text-[9.5px] sm:text-[11.5px] uppercase tracking-[0.16em] font-bold text-cream/85 truncate">
                {NAMING.mechanism}
              </span>
              <span className="shrink-0 font-display text-[15px] sm:text-[19px] font-semibold text-cream">
                {PLANS.call.priceLabel}
              </span>
            </div>
          </div>
        </motion.div>

        {/* ── CTA block #1 of 6 ── */}
        <div className="mt-9 sm:mt-11">
          <CtaBlock />
        </div>
      </Container>
    </section>
  )
}

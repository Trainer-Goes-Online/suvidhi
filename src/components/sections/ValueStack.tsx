import { motion } from 'framer-motion'
import { Check, Clock, Gift, ShieldCheck, Sparkles } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { PrimaryCTA } from '@/components/ui/PrimaryCTA'
import { Countdown } from '@/components/ui/Countdown'
import Image from 'next/image'
import { fadeUp, stagger, VIEWPORT_ONCE } from '@/lib/motion'
import { OFFER, VALUE_STACK, VALUE_STACK_TOTAL } from '@/lib/config'
import { formatINR } from '@/lib/utils'

export function ValueStack() {
  return (
    <section className="relative section-pad">
      <Container size="narrow">
        <SectionHeading
          eyebrow="Recap of everything you'll get"
          title={
            <>
              {formatINR(VALUE_STACK_TOTAL)} of clinical value,{' '}
              <span className="grad-text">yours today for {OFFER.priceLabel}</span>
            </>
          }
          subtitle="One enrolment. Lifetime access to the audits and community. No subscription, no auto-renewal."
        />

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT_ONCE}
          className="mt-12 sm:mt-14 relative rounded-[28px] overflow-hidden border border-ink-100 shadow-elev bg-white"
        >
          <div className="p-6 sm:p-8 lg:p-10">
            {/* Everything-you-get product collage */}
            <div className="relative mb-7 w-full aspect-[16/7] rounded-2xl overflow-hidden bg-cream-dark">
              <Image
                src="/Value_Stack_Collage/Value_Stack_Collage1.1.png"
                alt="Everything you get — the assessment, 4 clinical audits and 3 bonuses"
                fill
                sizes="(max-width: 1024px) 100vw, 800px"
                className="object-cover"
              />
            </div>

            {/* Itemised list */}
            <motion.ul
              variants={stagger(0.04, 0.05)}
              initial="hidden"
              whileInView="show"
              viewport={VIEWPORT_ONCE}
              className="divide-y divide-ink-100"
            >
              {VALUE_STACK.map((item) => (
                <motion.li
                  key={item.label}
                  variants={fadeUp}
                  className="flex items-center gap-4 py-3.5 first:pt-0"
                >
                  <span
                    className={
                      item.kind === 'bonus'
                        ? 'inline-flex w-7 h-7 rounded-full bg-brand-50 text-brand-700 border border-brand-200/60 items-center justify-center shrink-0'
                        : 'inline-flex w-7 h-7 rounded-full bg-brand-50 text-brand-700 border border-brand-200/60 items-center justify-center shrink-0'
                    }
                  >
                    {item.kind === 'bonus' ? (
                      <Gift className="w-3.5 h-3.5" strokeWidth={2.5} />
                    ) : (
                      <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                    )}
                  </span>
                  <span className="flex-1 min-w-0 text-ink-800 text-[14.5px] sm:text-[15px] leading-snug">
                    {item.label}
                    {item.kind === 'bonus' && (
                      <span className="ml-2 align-middle text-[10.5px] uppercase tracking-[0.16em] font-semibold text-brand-700">
                        Bonus
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 font-semibold text-ink-900 tabular-nums text-[14.5px] sm:text-[15px]">
                    {formatINR(item.amount)}
                  </span>
                </motion.li>
              ))}
            </motion.ul>

            {/* Total */}
            <div className="mt-5 pt-5 border-t-2 border-dashed border-ink-200 flex items-center justify-between gap-4">
              <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] font-semibold text-ink-600">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                Total value
              </span>
              <span className="font-display text-2xl sm:text-3xl font-semibold text-ink-400 line-through tabular-nums">
                {formatINR(VALUE_STACK_TOTAL)}
              </span>
            </div>
          </div>

          {/* Offer footer */}
          <div className="relative overflow-hidden">
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(160deg, #391218 0%, #5d2129 40%, #963543 100%)',
              }}
            />
            <div
              aria-hidden
              className="absolute inset-0 opacity-50"
              style={{
                background:
                  'radial-gradient(60% 60% at 30% 0%, rgba(236,158,169,.45) 0%, transparent 60%), radial-gradient(40% 40% at 100% 100%, rgba(255,202,74,.2) 0%, transparent 60%)',
              }}
            />
            <div className="relative p-6 sm:p-8 lg:p-10 text-cream grid grid-cols-1 sm:grid-cols-[1.1fr_1fr] gap-6 sm:gap-8 items-center">
              <div className="text-center sm:text-left">
                <div className="text-[11px] uppercase tracking-[0.22em] font-semibold text-brand-200">
                  Get everything today for
                </div>
                <div className="mt-2 flex items-baseline justify-center sm:justify-start gap-3 flex-wrap">
                  <span className="font-display text-5xl sm:text-6xl font-semibold leading-none">
                    {OFFER.priceLabel}
                  </span>
                  <span className="text-cream/60 text-base font-medium">
                    one-time
                  </span>
                </div>
                <p className="mt-3 text-cream/80 text-sm">
                  You save{' '}
                  <span className="font-semibold text-brand-200">
                    {OFFER.savingsLabel}
                  </span>{' '}
                  ({OFFER.discountPctLabel})
                </p>
              </div>

              <div className="w-full min-w-0 space-y-4">
                <div className="min-w-0">
                  <div className="flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.2em] font-semibold text-cream/65 mb-3">
                    <Clock className="w-3.5 h-3.5 text-brand-300" /> Offer expires in
                  </div>
                  <Countdown minutes={15} variant="dark" />
                </div>
                <PrimaryCTA
                  size="lg"
                  label="Get Instant Access"
                  showPrice={false}
                  className="w-full !bg-white !text-brand-700 hover:!bg-cream-dark hover:!text-brand-800"
                />
                <div className="flex items-center justify-center gap-2 text-[12.5px] text-cream/80">
                  <ShieldCheck className="w-4 h-4 text-brand-200" />
                  14-Day money-back guarantee
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  )
}

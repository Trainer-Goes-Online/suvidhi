import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, CalendarCheck, ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMagnetic, useNearPageBottom, usePastHero } from '@/lib/hooks'
import { PLANS, PROOF } from '@/lib/config'
import { utmQueryString } from '@/lib/utm'
import { trackCheckoutCtaClick } from '@/lib/metaClient'
import { CTA_DESTINATION, CTA_LABEL } from '@/components/ui/PrimaryCTA'
import { CTA_ATTENTION_ANIMATE, CTA_ATTENTION_TRANSITION } from '@/lib/motion'

export function StickyCTA() {
  const pastHero = usePastHero()
  const nearBottom = useNearPageBottom(420)
  // Show after hero, hide once the closing CTA enters the viewport so the two
  // never collide visually.
  const show = pastHero && !nearBottom
  const router = useRouter()
  const reduce = useReducedMotion()
  const btnRef = useMagnetic<HTMLButtonElement>(0.12)

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-0 bottom-0 z-50 pb-safe pointer-events-none"
          aria-live="polite"
        >
          <div className="mx-auto max-w-2xl px-3 pb-3 sm:pb-4">
            <div
              className="pointer-events-auto relative rounded-2xl bg-white/95 backdrop-blur-xl
                         border border-ink-100 shadow-elev overflow-hidden"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-100"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(253,243,244,0.4) 100%)',
                }}
              />
              {/* Stacked, not side-by-side: the CTA label is the exact spec
                  string (§1.1, "no variations"), which cannot fit beside the
                  price on a phone. Info row on top, full-width button below. */}
              <div className="relative p-2.5 sm:p-3 flex flex-col gap-2.5">
                {/* Top — what the call is, and the single price on the page */}
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div
                    aria-hidden
                    className="relative shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center shadow-soft"
                  >
                    <CalendarCheck className="w-5 h-5" />
                    <span
                      aria-hidden
                      className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-brand-500 border-2 border-white"
                    >
                      <span className="absolute inset-0 rounded-full bg-brand-500 animate-ping opacity-75" />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10.5px] uppercase tracking-[0.16em] font-semibold text-brand-700 truncate">
                      Postpartum Recovery Roadmap Call
                    </div>
                    <div className="flex items-baseline gap-1.5 leading-tight">
                      <span className="font-display text-[18px] sm:text-xl font-semibold text-ink-950">
                        {PLANS.call.priceLabel}
                      </span>
                      <span className="text-ink-500 text-[11.5px] sm:text-[12.5px] font-medium">
                        to start
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom — CTA, carrying the exact spec label */}
                <motion.button
                  ref={btnRef}
                  onClick={() => {
                    // Meta AddToCart + GA4 add_to_cart (once per browser).
                    trackCheckoutCtaClick(CTA_DESTINATION)
                    router.push(CTA_DESTINATION + utmQueryString())
                  }}
                  whileTap={{ scale: 0.97 }}
                  animate={reduce ? undefined : CTA_ATTENTION_ANIMATE}
                  transition={reduce ? undefined : CTA_ATTENTION_TRANSITION}
                  className="magnet group relative inline-flex w-full items-center justify-center gap-1.5
                             rounded-xl px-4 sm:px-5 py-2.5 sm:py-3
                             bg-brand-600 hover:bg-brand-700 text-white
                             text-[12.5px] sm:text-sm font-semibold tracking-tight leading-snug text-balance
                             shadow-soft hover:shadow-elev hover:-translate-y-0.5
                             transition-all duration-300 ease-out
                             focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30
                             overflow-hidden"
                >
                  {/* Continuous shine sweep to draw the eye */}
                  <motion.span
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-12"
                    style={{
                      background:
                        'linear-gradient(90deg, transparent, rgba(255,255,255,.45), transparent)',
                    }}
                    animate={{ x: ['-150%', '350%'] }}
                    transition={{ duration: 1, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.4 }}
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    style={{
                      background:
                        'radial-gradient(80% 100% at 50% 0%, rgba(255,255,255,.3), transparent 70%)',
                    }}
                  />
                  <span className="relative">{CTA_LABEL}</span>
                  <ArrowRight className="relative w-4 h-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" />
                </motion.button>
              </div>

              {/* Trust strip */}
              <div className="relative border-t border-ink-100 px-3 py-1.5 flex items-center justify-center gap-3 sm:gap-4 text-[10.5px] sm:text-[11px] text-ink-600">
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-brand-600" />
                  100% Money-back
                </span>
                <span className="w-1 h-1 rounded-full bg-ink-300" aria-hidden />
                <span className="inline-flex items-center gap-1">
                  <span className="relative flex w-1.5 h-1.5">
                    <span className="absolute inset-0 rounded-full bg-brand-500 animate-ping opacity-75" />
                    <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-brand-600" />
                  </span>
                  Limited slots this week
                </span>
                <span className="w-1 h-1 rounded-full bg-ink-300 hidden sm:inline-block" aria-hidden />
                <span className="hidden sm:inline-flex items-center gap-1">
                  {PROOF.rating}★ · {PROOF.mothers} mothers
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

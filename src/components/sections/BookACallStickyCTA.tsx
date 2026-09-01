import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowDown, CalendarCheck, Sparkles } from 'lucide-react'
import { useMagnetic, useNearPageBottom, useScrolledPastSticky } from '@/lib/hooks'
import { CTA_ATTENTION_ANIMATE, CTA_ATTENTION_TRANSITION } from '@/lib/motion'

interface BookACallStickyCTAProps {
  /** ID of the target section to scroll to. Defaults to the calendar block. */
  targetId?: string
}

export function BookACallStickyCTA({
  targetId = 'calendar',
}: BookACallStickyCTAProps) {
  // Appear after a short scroll, but tuck away as the footer comes into view so
  // the bar never overlaps it.
  const past = useScrolledPastSticky(260)
  const nearBottom = useNearPageBottom(200)
  const show = past && !nearBottom
  const reduce = useReducedMotion()
  const btnRef = useMagnetic<HTMLButtonElement>(0.1)

  const handleClick = () => {
    const el = document.getElementById(targetId)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

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
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(253,243,244,0.4) 100%)',
                }}
              />
              <div className="relative p-2.5 sm:p-3 flex items-center gap-2.5 sm:gap-3">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
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
                    <div className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.18em] font-semibold text-brand-700">
                      <Sparkles className="w-3 h-3" />
                      Step 1 · Not booked yet
                    </div>
                    <div className="text-[14px] sm:text-[15px] font-semibold text-ink-950 leading-tight">
                      Reserve your call slot
                    </div>
                  </div>
                </div>

                <motion.button
                  ref={btnRef}
                  onClick={handleClick}
                  whileTap={{ scale: 0.97 }}
                  animate={reduce ? undefined : CTA_ATTENTION_ANIMATE}
                  transition={reduce ? undefined : CTA_ATTENTION_TRANSITION}
                  className="magnet group relative inline-flex items-center justify-center gap-1.5
                             rounded-xl px-4 sm:px-5 py-2.5 sm:py-3
                             bg-brand-600 hover:bg-brand-700 text-white
                             text-[13px] sm:text-sm font-semibold tracking-tight whitespace-nowrap
                             shadow-soft hover:shadow-elev hover:-translate-y-0.5
                             transition-all duration-300 ease-out
                             focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30
                             overflow-hidden"
                >
                  {/* Continuous shine sweep to draw the eye */}
                  {!reduce && (
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
                  )}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    style={{
                      background:
                        'radial-gradient(80% 100% at 50% 0%, rgba(255,255,255,.3), transparent 70%)',
                    }}
                  />
                  <span className="relative">Book your slot</span>
                  <ArrowDown className="relative w-4 h-4 transition-transform duration-300 group-hover:translate-y-0.5" />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

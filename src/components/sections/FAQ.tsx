import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Minus, Plus } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { cn } from '@/lib/utils'
import { fadeUp, stagger, VIEWPORT_ONCE } from '@/lib/motion'
import { NAMING, PROGRAMME } from '@/lib/config'

/**
 * FAQ (dev spec §2, Section 10). Same accordion component, reordered and
 * rewritten around the ₹97 call rather than a ₹297 digital product.
 *
 * NOTE ON Q.07 — none of the three reference pages disclose programme price on
 * the page at all. Including it here is a deliberate choice to kill the sticker
 * shock that has been ending calls, and the FAQ is the least disruptive place
 * for it. This is the ONE line to remove if the pure template gets tested
 * (dev spec Part 8, Test 3): watch call show-rate and Calendly tier
 * distribution, not booking volume.
 */
const faqs: { q: string; a: string; badge?: string }[] = [
  {
    q: 'Is this a sales call?',
    badge: 'Most asked',
    a: `No. This is a clinical assessment. Suvidhi will look at your reports, your symptoms, your feeding status, your sleep and the patterns that may be keeping your recovery stuck, and tell you which of the four systems is your primary block. The goal of the call is clarity. If she genuinely feels the 90-day programme is not the right next step for you, she will tell you honestly. No pressure either way.`,
  },
  {
    q: 'Is this for me if my doctor says everything is normal?',
    a: 'Yes. That is exactly who this is for. Most women who book this call have already been told their bloodwork and recovery look normal while still dealing with exhaustion, hair fall, brain fog, stubborn weight and the feeling that something is not right. Suvidhi reads your markers against postpartum ranges rather than general population ranges, which is usually where the answer has been sitting the whole time.',
  },
  {
    q: 'How postpartum should I be for this to apply?',
    a: 'Anywhere from 3 months to 2 years. The mothers who see the biggest change are often the ones furthest out, because they have been running on empty the longest and nobody has ever looked at why.',
  },
  {
    q: 'What if I don’t have recent blood work?',
    a: 'Book anyway and mention it when you fill your form. Suvidhi will either tell you the exact panel to get before your call, or run the call on your symptoms and history and tell you what to test.',
  },
  {
    q: 'I’m still breastfeeding. Is this safe?',
    a: 'Yes. Nothing Suvidhi recommends will ask you to stop or cut down feeding. Every protocol she builds is designed around your feeding status, not in spite of it.',
  },
  {
    q: 'Will I just get a diet chart?',
    a: 'No. You will get a protocol built off your reports, your markers and your life. If a chart is what you are looking for, there are cheaper places to get one.',
  },
  {
    q: 'What does the 90-day programme cost?',
    a: `${NAMING.programme} starts at ${PROGRAMME.startingPriceLabel} including your blood test, with higher levels of support available above that. You will see the full range when you pick your slot, before you pay, so nothing on the call comes as a surprise.`,
  },
]

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="relative pt-10 pb-7 sm:pt-12 sm:pb-9 lg:pt-16">
      <Container size="narrow">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT_ONCE}
          className="flex flex-col items-center gap-4 text-center"
        >
          <span className="eyebrow">Straight Answers. No Sales Spin.</span>
          <h2 className="h-section text-balance">
            Common Questions From{' '}
            <span className="grad-text">Postpartum Mothers</span>
          </h2>
        </motion.div>

        <motion.div
          variants={stagger(0.05, 0.06)}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT_ONCE}
          className="mt-8 sm:mt-10 space-y-3"
        >
          {faqs.map((f, i) => {
            const isOpen = open === i
            const num = `Q.${(i + 1).toString().padStart(2, '0')}`
            return (
              <motion.div
                key={f.q}
                variants={fadeUp}
                className={cn(
                  'rounded-2xl border bg-white shadow-soft overflow-hidden transition-all duration-500',
                  isOpen
                    ? 'border-brand-200 shadow-elev'
                    : 'border-ink-100 hover:border-brand-200 hover:shadow-elev',
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="w-full text-left px-5 sm:px-6 py-5 flex items-center gap-4 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/15 rounded-2xl"
                >
                  <span className="flex-1 min-w-0">
                    <span className="mr-2 font-mono text-[11px] font-bold tracking-[0.16em] text-brand-600">
                      {num}
                    </span>
                    <span className="text-[1rem] sm:text-[1.08rem] font-medium text-ink-900 leading-snug">
                      {f.q}
                    </span>
                    {f.badge && (
                      <span className="ml-2 inline-block align-middle rounded-full bg-brand-50 border border-brand-200/70 px-2 py-0.5 text-[9.5px] uppercase tracking-[0.14em] font-bold text-brand-700">
                        {f.badge}
                      </span>
                    )}
                  </span>
                  <span
                    className={cn(
                      'shrink-0 inline-flex w-9 h-9 items-center justify-center rounded-full border transition-all duration-500',
                      isOpen
                        ? 'bg-brand-600 text-white border-brand-600 shadow-soft'
                        : 'bg-white text-ink-700 border-ink-200',
                    )}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={isOpen ? 'minus' : 'plus'}
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        {isOpen ? (
                          <Minus className="w-4 h-4" strokeWidth={2.5} />
                        ) : (
                          <Plus className="w-4 h-4" strokeWidth={2.5} />
                        )}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 sm:px-6 pb-6 text-ink-700 text-[15.5px] leading-relaxed text-pretty">
                        {f.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </motion.div>
      </Container>
    </section>
  )
}

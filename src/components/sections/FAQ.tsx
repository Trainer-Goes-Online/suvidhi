import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Minus, Plus } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { cn } from '@/lib/utils'
import { fadeUp, stagger, VIEWPORT_ONCE } from '@/lib/motion'

const faqs = [
  {
    q: 'Is The Postpartum Restore™ for me if my doctor says everything is normal?',
    a: "Yes. In fact, that's exactly who this assessment was created for. Many women are told their blood work, checkups and recovery look \"normal\" while still experiencing exhaustion, brain fog, hair loss, stubborn weight gain and the feeling that something isn't quite right. The Postpartum Restore helps you identify the recovery gaps that may not have been explored yet.",
  },
  {
    q: 'How postpartum should I be for this to apply to me?',
    a: "The Postpartum Restore is designed for women who are between 3 and 24 months postpartum. Whether you're 3 months, 12 months or 2 years after having your baby, the assessment is designed to help you understand what may still be affecting your recovery.",
  },
  {
    q: "What if I don't have recent blood work?",
    a: "That's completely fine. You can still complete the assessment and all four audits. If you do have a recent blood report, you'll be able to get even more value from certain sections, but it is not required to benefit from the programme.",
  },
  {
    q: 'How quickly will I get access?',
    a: "Immediately. As soon as you enrol, you'll receive instant access to The Postpartum Restore, all 4 Clinical Audits, the Private Postpartum Mothers Community, Monthly Group Coaching Sessions, and instructions for booking your 30-Minute Postpartum Assessment Call with Suvidhi.",
  },
  {
    q: 'Do I need any medical knowledge to understand the programme?',
    a: "Not at all. Everything is explained in simple, practical language designed for busy mothers. You do not need to understand hormones, blood markers or nutrition science to benefit from the assessment.",
  },
  {
    q: 'Will I receive personalised guidance?',
    a: "Yes. In addition to the assessment, audits and monthly coaching sessions, you'll also receive a 30-Minute Postpartum Assessment Call with Suvidhi, where you'll get personalised guidance based on your situation and recovery patterns.",
  },
]

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="relative pt-10 pb-7 sm:pt-12 sm:pb-9 lg:pt-16">
      <Container size="narrow">
        <SectionHeading
          title={
            <>
              Frequently <span className="grad-text">Asked Questions</span>
            </>
          }
        />

        <motion.div
          variants={stagger(0.05, 0.06)}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT_ONCE}
          className="mt-8 sm:mt-10 space-y-3"
        >
          {faqs.map((f, i) => {
            const isOpen = open === i
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
                  <span className="flex-1 text-[1rem] sm:text-[1.08rem] font-medium text-ink-900 leading-snug">
                    {f.q}
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

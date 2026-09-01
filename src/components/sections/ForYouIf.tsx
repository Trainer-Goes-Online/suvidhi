import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { CtaBlock } from '@/components/ui/CtaBlock'
import { fadeUp, stagger, VIEWPORT_ONCE } from '@/lib/motion'

/**
 * "This Is For You If" (dev spec §2, Section 3) — replaces the old eight-bullet
 * "Does this sound like you?" grid.
 *
 * Five items, each a BOLD qualifying statement followed by a lighter
 * explanatory line. The bold line forces a self-identification; the line under
 * it immediately deepens it. That is why this format converts where a list of
 * short pain bullets does not.
 */
const ITEMS: { claim: string; detail: string }[] = [
  {
    claim: 'Your reports came back normal and you still don’t feel normal.',
    detail:
      'The gynae said you’re fine. The physician said you’re fine. You’re still exhausted after eight hours of sleep, still finding hair in your hands every wash, and nobody has explained why.',
  },
  {
    claim:
      'The weight came off your face and your arms, but the belly hasn’t moved since delivery.',
    detail:
      'You may also be dealing with a gap in your abdominal wall that no amount of walking or dieting is going to close, because it is a structural problem, not a calorie one.',
  },
  {
    claim:
      'You’ve bought the iron, the biotin, the multivitamin and the collagen, and nothing changed.',
    detail:
      'Taking a supplement and absorbing it are two different events. Most postpartum supplement stacks fail on timing, pairing and gut status, not on the supplement itself.',
  },
  {
    claim:
      'You’re running the house, the baby and often a job, and your own recovery keeps getting pushed to next month.',
    detail:
      'You need something that fits into the life you actually have, not one that assumes you have two free hours and a quiet kitchen.',
  },
  {
    claim: 'You want to know the reason, not get handed another diet chart.',
    detail:
      'You’re done guessing from Instagram. You want someone clinically trained to look at your actual reports and tell you what’s happening in your body and what to do about it.',
  },
]

export function ForYouIf() {
  return (
    <section className="relative section-pad">
      <Container size="narrow">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT_ONCE}
          className="flex flex-col items-center gap-4 text-center"
        >
          <span className="eyebrow text-balance">
            For Mothers 3 To 24 Months Postpartum, In India And Abroad
          </span>
          <h2 className="h-section text-balance">
            This Is <span className="grad-text">For You If:</span>
          </h2>
        </motion.div>

        <motion.ul
          variants={stagger(0.07, 0.07)}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT_ONCE}
          className="mt-10 sm:mt-12 space-y-3.5 sm:space-y-4"
        >
          {ITEMS.map((item) => (
            <motion.li
              key={item.claim}
              variants={fadeUp}
              className="flex items-start gap-3.5 rounded-2xl border border-white/12 bg-white/[0.06] p-5 backdrop-blur-md sm:gap-4 sm:p-6"
            >
              <span className="mt-0.5 inline-flex w-7 h-7 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-brand-200">
                <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />
              </span>
              <div className="min-w-0">
                <p className="font-display text-[15.5px] sm:text-[17px] font-semibold leading-snug text-cream text-balance">
                  {item.claim}
                </p>
                <p className="mt-2 text-[14px] sm:text-[15px] leading-relaxed text-cream/75 text-pretty">
                  {item.detail}
                </p>
              </div>
            </motion.li>
          ))}
        </motion.ul>

        {/* ── CTA block #2 of 6 ── */}
        <div className="mt-11 sm:mt-14">
          <CtaBlock variant="dark" />
        </div>
      </Container>
    </section>
  )
}

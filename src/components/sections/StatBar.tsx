import { motion } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { fadeUp, stagger, VIEWPORT_ONCE } from '@/lib/motion'
import { PLANS, PROOF } from '@/lib/config'

/**
 * The four-tile stat bar (dev spec §2, Section 2), sitting directly below the
 * hero CTA block.
 *
 * The ₹97 tile is THE ONLY place a price appears on this page. No price
 * section, no comparison table, no struck-through "was ₹21,000" — the page
 * sells the outcome and the price stays a footnote small enough that it never
 * becomes the decision.
 */
const STATS = [
  { value: PROOF.mothers, label: 'Mothers Coached Globally' },
  { value: PROOF.avgRecoveryWeeks, label: 'Avg. Recovery Time' },
  { value: `${PROOF.rating}★`, label: 'Client Rating' },
  { value: PLANS.call.priceLabel, label: 'To Start' },
]

export function StatBar() {
  return (
    <section className="relative pb-2 pt-2 sm:pb-4">
      <Container>
        <motion.ul
          variants={stagger(0.07, 0.05)}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT_ONCE}
          // 2x2 on mobile (per the QA checklist), 4-across from sm up.
          className="mx-auto grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
        >
          {STATS.map((s) => (
            <motion.li
              key={s.label}
              variants={fadeUp}
              className="rounded-2xl border border-ink-100 bg-white px-3 py-4 sm:px-4 sm:py-5 text-center shadow-soft"
            >
              <div className="font-display text-2xl sm:text-[2rem] font-semibold leading-none text-ink-950 tabular-nums">
                {s.value}
              </div>
              <div className="mt-2 text-[9.5px] sm:text-[10.5px] uppercase tracking-[0.14em] font-semibold text-ink-500 leading-snug text-balance">
                {s.label}
              </div>
            </motion.li>
          ))}
        </motion.ul>
      </Container>
    </section>
  )
}

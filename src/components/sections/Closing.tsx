import { motion } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { CtaBlock } from '@/components/ui/CtaBlock'
import { fadeUp, VIEWPORT_ONCE } from '@/lib/motion'

/**
 * Closing identity line + the final CTA block (dev spec §2, Section 11).
 * All three reference pages close on an identity statement, not on a feature.
 */
export function Closing() {
  return (
    <section className="relative section-pad">
      <Container size="narrow">
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT_ONCE}
          className="h-section mx-auto max-w-3xl text-center text-balance"
        >
          Become The Mother Who{' '}
          <span className="grad-text">Stopped Waiting</span> To Feel Like Herself
          Again.
        </motion.h2>

        {/* ── CTA block #6 of 6 ── */}
        <div className="mt-10 sm:mt-12">
          <CtaBlock size="xl" variant="dark" />
        </div>
      </Container>
    </section>
  )
}

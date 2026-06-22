import { motion } from 'framer-motion'
import { ShieldCheck } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { GradientCTA } from '@/components/ui/GradientCTA'
import { fadeUp, scaleIn, stagger, VIEWPORT_ONCE } from '@/lib/motion'
import { BRAND, OFFER } from '@/lib/config'

export function Guarantee() {
  return (
    <section className="relative section-pad">
      <Container size="narrow">
        <motion.div
          variants={stagger(0.06, 0.1)}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT_ONCE}
          className="relative rounded-[28px] sm:rounded-[36px] bg-white border border-ink-100 shadow-elev overflow-hidden p-7 sm:p-10 lg:p-12 text-center flex flex-col items-center"
        >
          {/* soft brand wash */}
          <div
            aria-hidden
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-[120%] h-56 blur-3xl opacity-60 pointer-events-none"
            style={{
              background:
                'radial-gradient(closest-side, rgba(236,158,169,.4), transparent 70%)',
            }}
          />

          <motion.h2 variants={fadeUp} className="relative h-section text-balance">
            <span className="grad-text">14-Day Money-Back</span> Guarantee
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="relative mt-3 text-ink-700 text-[16px] sm:text-lg font-medium"
          >
            Try The Postpartum Restore™ completely risk-free
          </motion.p>

          {/* Refund seal */}
          <motion.div variants={scaleIn} className="relative mt-8 mb-2">
            <RefundSeal />
          </motion.div>

          {/* Body copy */}
          <motion.div
            variants={fadeUp}
            className="relative mt-6 space-y-4 max-w-xl text-ink-700 text-[15.5px] sm:text-[16px] leading-relaxed text-pretty"
          >
            <p>
              <span className="font-semibold text-ink-950">
                Get immediate access to The Postpartum Restore™
              </span>
              , all 4 Recovery Audits, the Postpartum Mothers Community, and your bonus
              resources, and see what insights you uncover about your own recovery.
            </p>
            <p>
              If you genuinely feel The Postpartum Restore wasn't valuable, simply email{' '}
              <a
                href={`mailto:${BRAND.email}`}
                className="font-semibold text-brand-700 underline-offset-2 hover:underline break-all"
              >
                {BRAND.email}
              </a>{' '}
              within 14 days of your purchase and we'll refund your{' '}
              {OFFER.priceLabel} in full.
            </p>
            <p className="font-display text-lg font-semibold text-ink-950">
              No questions asked!
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="relative mt-8 w-full max-w-md">
            <GradientCTA className="w-full" />
          </motion.div>
        </motion.div>
      </Container>
    </section>
  )
}

function RefundSeal() {
  return (
    <div
      className="flex flex-col items-center gap-3 select-none"
      aria-label="14-day full money-back guarantee"
    >
      <div className="relative grid place-items-center w-28 h-28 sm:w-32 sm:h-32">
        {/* soft neon halo */}
        <span aria-hidden className="absolute inset-2 rounded-full bg-brand-300/40 blur-xl" />
        {/* rotating dashed ring */}
        <motion.span
          aria-hidden
          animate={{ rotate: 360 }}
          transition={{ duration: 20, ease: 'linear', repeat: Infinity }}
          className="absolute inset-0 rounded-full border-[3px] border-dashed border-brand-300/70"
        />
        {/* static inner ring */}
        <span aria-hidden className="absolute inset-3 rounded-full border border-brand-200/70" />
        {/* glossy brand core — icon only */}
        <div
          className="relative grid place-items-center w-[5.25rem] h-[5.25rem] sm:w-[6rem] sm:h-[6rem] rounded-full text-white"
          style={{
            background: 'linear-gradient(160deg, #de6976 0%, #CB4A5D 52%, #963543 100%)',
            boxShadow:
              'inset 0 2px 3px rgba(255,255,255,.45), inset 0 -4px 8px rgba(57,18,24,.35), 0 12px 26px -8px rgba(203,74,93,.6)',
          }}
        >
          <ShieldCheck className="w-9 h-9 sm:w-10 sm:h-10 drop-shadow" strokeWidth={2} />
        </div>
      </div>
      {/* label below the seal */}
      <span className="text-[12px] sm:text-[13px] font-bold uppercase tracking-[0.16em] text-brand-700">
        14-Day Money-Back Guarantee
      </span>
    </div>
  )
}

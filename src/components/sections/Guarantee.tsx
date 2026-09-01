import { motion } from 'framer-motion'
import { ShieldCheck } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { fadeUp, scaleIn, stagger, VIEWPORT_ONCE } from '@/lib/motion'

/**
 * The outcome guarantee (dev spec §2, Section 9).
 *
 * Replaces the old 14-day money-back on a ₹297 product that no longer exists —
 * a refund window makes no sense on a call you have already taken. The
 * reference pages guarantee the PROGRAMME OUTCOME and pair it with a "What We
 * Ask In Return" list; those conditions are what make a bold guarantee safe to
 * make, because they do the qualifying.
 *
 * NOTE FOR THE CLIENT: the wording deliberately guarantees "improvement against
 * an agreed baseline" rather than a fixed kilo figure — a hard weight promise
 * would be clinically inappropriate for a postpartum and breastfeeding
 * population. This needs Suvidhi's explicit sign-off before it ships.
 */
const CONDITIONS: { title: string; desc: string }[] = [
  {
    title: 'Your baseline is set in week one.',
    desc: 'Bloodwork, measurements, symptom scores, energy, sleep and feeding status recorded before anything starts, and your goal agreed with Suvidhi at that point.',
  },
  {
    title: 'You follow the protocol.',
    desc: 'Nutrition protocol followed, supplement protocol followed, movement protocol completed as prescribed for your stage.',
  },
  {
    title: 'You attend your scheduled reviews.',
    desc: 'Progress updates, logs and requested measurements shared on schedule.',
  },
  {
    title: 'Your progress is tracked throughout.',
    desc: 'Results are reviewed against your week-one baseline, with the protocol adjusted based on how your body responds.',
  },
  {
    title: 'The 90 days run from your programme start date.',
    desc: 'Your window opens the day your protocol begins, not the day you book.',
  },
]

export function Guarantee() {
  return (
    <section className="relative section-pad">
      <Container size="narrow">
        <motion.div
          variants={stagger(0.06, 0.1)}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT_ONCE}
          className="relative overflow-hidden rounded-[28px] border border-ink-100 bg-white p-7 shadow-elev sm:rounded-[36px] sm:p-10 lg:p-12"
        >
          {/* soft brand wash */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 h-56 w-[120%] -translate-x-1/2 opacity-60 blur-3xl"
            style={{
              background:
                'radial-gradient(closest-side, rgba(236,158,169,.4), transparent 70%)',
            }}
          />

          <div className="relative flex flex-col items-center text-center">
            <motion.span variants={fadeUp} className="eyebrow">
              The Risk Is Ours. Not Yours.
            </motion.span>

            <motion.h2 variants={fadeUp} className="mt-4 h-section text-balance">
              Measurable Recovery In 90 Days.{' '}
              <span className="grad-text">Or You Get Your Money Back.</span>
            </motion.h2>

            <motion.div variants={scaleIn} className="mt-8 mb-2">
              <RefundSeal />
            </motion.div>

            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-xl text-[15.5px] leading-relaxed text-ink-700 text-pretty sm:text-[16px]"
            >
              If you complete your 90-day programme and your tracked markers and
              measurements show{' '}
              <span className="font-semibold text-ink-950">
                no improvement against the baseline set in week one
              </span>
              , we refund every rupee you paid us.
            </motion.p>
          </div>

          {/* What We Ask In Return */}
          <motion.div variants={fadeUp} className="relative mt-10 sm:mt-12">
            <h3 className="text-center font-display text-xl font-semibold leading-tight text-ink-950 sm:text-2xl">
              What We Ask In Return
            </h3>

            <motion.ul
              variants={stagger(0.06, 0.06)}
              initial="hidden"
              whileInView="show"
              viewport={VIEWPORT_ONCE}
              className="mt-6 space-y-3"
            >
              {CONDITIONS.map((c) => (
                <motion.li
                  key={c.title}
                  variants={fadeUp}
                  className="rounded-2xl border border-brand-200/50 surface-tint p-4 sm:p-5"
                >
                  <p className="font-display text-[15px] font-semibold leading-snug text-ink-950 sm:text-[16px]">
                    {c.title}
                  </p>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-ink-700 text-pretty sm:text-[14.5px]">
                    {c.desc}
                  </p>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  )
}

function RefundSeal() {
  return (
    <div
      className="flex select-none flex-col items-center gap-3"
      aria-label="Money-back guarantee on measurable 90-day recovery"
    >
      <div className="relative grid h-28 w-28 place-items-center sm:h-32 sm:w-32">
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
          className="relative grid h-[5.25rem] w-[5.25rem] place-items-center rounded-full text-white sm:h-[6rem] sm:w-[6rem]"
          style={{
            background: 'linear-gradient(160deg, #de6976 0%, #CB4A5D 52%, #963543 100%)',
            boxShadow:
              'inset 0 2px 3px rgba(255,255,255,.45), inset 0 -4px 8px rgba(57,18,24,.35), 0 12px 26px -8px rgba(203,74,93,.6)',
          }}
        >
          <ShieldCheck className="h-9 w-9 drop-shadow sm:h-10 sm:w-10" strokeWidth={2} />
        </div>
      </div>
      <span className="text-[12px] font-bold uppercase tracking-[0.16em] text-brand-700 sm:text-[13px]">
        100% Money-Back Guarantee
      </span>
    </div>
  )
}

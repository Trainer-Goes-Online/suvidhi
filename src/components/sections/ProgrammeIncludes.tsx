import { motion } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { CtaBlock } from '@/components/ui/CtaBlock'
import { fadeUp, stagger, VIEWPORT_ONCE } from '@/lib/motion'
import { NAMING } from '@/lib/config'

/**
 * What's Included In Your 90-Day Programme (dev spec §2, Section 8).
 *
 * This replaces the entire ₹21,000 value stack and the 5-module architecture.
 * Seven numbered components, plain descriptions, and deliberately ZERO prices,
 * ZERO rupee values, ZERO "bonus" labels and ZERO struck-through numbers —
 * describe the programme so the reader wants it, then send her to a call to
 * find out how to get it.
 */
const COMPONENTS: { n: string; title: string; desc: string }[] = [
  {
    n: '01',
    title: NAMING.mechanism,
    desc: 'Your full clinical assessment. Bloodwork, symptoms, feeding status, sleep, stress and history reviewed together to identify which of the four systems is your primary block and which is secondary.',
  },
  {
    n: '02',
    title: 'Your Personalised Postpartum Nutrition Protocol',
    desc: 'Built around your markers, your feeding status, your family’s food and your actual schedule. Nothing that asks you to cook separately or give up roti and rice.',
  },
  {
    n: '03',
    title: 'Clinical Bloodwork, Included',
    desc: 'Your blood test is part of the programme. Baseline at the start, retest at the end, so progress is measured against markers and not just how you feel on a given day.',
  },
  {
    n: '04',
    title: 'Supplement & Absorption Protocol',
    desc: 'What to take, when to take it, what to stop taking, and what to pair it with so it actually reaches your cells. Breastfeeding-safe throughout.',
  },
  {
    n: '05',
    title: 'Core & Diastasis Recovery Protocol',
    desc: 'Structured postpartum-safe movement to rebuild the abdominal wall and close the gap, sequenced so you start where your body actually is, not where a general fitness plan assumes it is.',
  },
  {
    n: '06',
    title: 'Regular 1:1 Reviews With Suvidhi',
    desc: 'Scheduled reviews to check your progress, adjust your protocol based on how your body is responding, and keep you moving when the weeks get hard.',
  },
  {
    n: '07',
    title: 'Progress Tracking Beyond The Scale',
    desc: 'Energy, sleep, hair, mood, measurements, waist and abdominal separation, tracked alongside your markers, so you can see what is changing even in the weeks the scale is quiet.',
  },
]

export function ProgrammeIncludes() {
  return (
    <section className="relative section-pad">
      <Container>
        <SectionHeading
          title={
            <>
              What&apos;s Included In Your{' '}
              <span className="grad-text">90-Day Programme</span>
            </>
          }
          subtitle="Everything working together, so the recovery actually holds."
        />

        <motion.ol
          variants={stagger(0.06, 0.06)}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT_ONCE}
          className="mx-auto mt-12 grid max-w-4xl gap-4 sm:mt-14 md:grid-cols-2 md:gap-5"
        >
          {COMPONENTS.map(({ n, title, desc }, i) => (
            <motion.li
              key={n}
              variants={fadeUp}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className={
                'group relative flex flex-col card card-hover p-5 sm:p-6' +
                // The odd 7th component centres itself on the 2-col grid.
                (i === COMPONENTS.length - 1 && COMPONENTS.length % 2 === 1
                  ? ' md:col-span-2 md:mx-auto md:w-[calc(50%-0.625rem)]'
                  : '')
              }
            >
              <span className="font-mono text-[11px] font-bold tracking-[0.2em] text-brand-600">
                {n}
              </span>
              <h3 className="mt-2 font-display text-[1.05rem] sm:text-[1.15rem] font-semibold leading-tight text-ink-950 text-balance">
                {title}
              </h3>
              <p className="mt-2 flex-1 text-[14px] sm:text-[14.5px] leading-relaxed text-ink-700 text-pretty">
                {desc}
              </p>
            </motion.li>
          ))}
        </motion.ol>

        {/* ── CTA block #5 of 6 ── */}
        <div className="mt-12 sm:mt-14">
          <CtaBlock />
        </div>
      </Container>
    </section>
  )
}

import { motion } from 'framer-motion'
import { Battery, Flame, Pill, Waves, type LucideIcon } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { fadeUp, stagger, VIEWPORT_ONCE } from '@/lib/motion'
import { NAMING } from '@/lib/config'

/**
 * The 4-System Postpartum Check (dev spec §2, Section 7).
 *
 * This is the named mechanism. The four audits stop being four separate
 * products and become one diagnostic Suvidhi can say out loud on a call — and
 * it is the only thing on the page a competitor cannot copy in an afternoon,
 * because it maps to what she actually does clinically.
 */
interface System {
  n: string
  icon: LucideIcon
  name: string
  claim: string
  detail: string
}

const SYSTEMS: System[] = [
  {
    n: '01',
    icon: Battery,
    name: 'Depletion',
    claim: 'What your pregnancy took and nobody put back.',
    detail:
      'A ferritin of 15 reads as normal on a lab range built for a 45-year-old man. It is not normal for a woman who grew a human and then fed one. Same story for B12, D and zinc. Most hair fall and most of the fatigue actually live here.',
  },
  {
    n: '02',
    icon: Flame,
    name: 'Metabolism',
    claim: 'Whether your body is repairing or storing.',
    detail:
      'Past a certain amount of stress and under-eating, the body stops treating food as building material and starts treating it as something to hold onto. That is when the belly stops moving no matter what you do. It is reversible. It is not reversible by eating less.',
  },
  {
    n: '03',
    icon: Pill,
    name: 'Absorption',
    claim: 'Whether your supplements are reaching your cells.',
    detail:
      'Taking iron and absorbing iron are two different events. Most postpartum supplement stacks fail on timing, pairing and gut status, not on the supplement itself. The thyroid-to-hair connection sits here too.',
  },
  {
    n: '04',
    icon: Waves,
    name: 'Neuro-Endocrine',
    claim: 'Whether your body thinks the emergency is over.',
    detail:
      'Broken sleep, constant alertness, no real recovery window. Cortisol keeps pulling raw material away from the hormones that are supposed to be rebuilding you. This is the one that shows up as flat mood and the 4pm crash.',
  },
]

export function FourSystemCheck() {
  return (
    <section className="relative section-pad">
      <Container>
        <SectionHeading
          title={
            <>
              There Are Only <span className="grad-text">Four Reasons</span> A
              Postpartum Body Stays Stuck
            </>
          }
          subtitle={
            <>
              Suvidhi calls it {NAMING.mechanism}. On your call she goes through
              all four, against your actual reports, in this order.
            </>
          }
        />

        <motion.ol
          variants={stagger(0.08, 0.07)}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT_ONCE}
          className="mt-12 sm:mt-14 grid gap-4 md:grid-cols-2 md:gap-5"
        >
          {SYSTEMS.map(({ n, icon: Icon, name, claim, detail }) => (
            <motion.li
              key={n}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              // Glass-on-dark, matching the other sections in the burgundy
              // band. A white `.card` here goes muddy pink against the
              // background and drops the body copy's contrast.
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/12 bg-white/[0.06] p-6 backdrop-blur-md transition-colors duration-300 hover:bg-white/[0.1] sm:p-7"
            >
              <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-brand-400" />

              <div className="flex items-center gap-3.5">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/15 bg-white/10 text-brand-200 transition-transform duration-500 group-hover:scale-110">
                  <Icon className="h-5 w-5" strokeWidth={1.9} />
                </span>
                <div className="min-w-0">
                  <div className="font-mono text-[11px] font-bold tracking-[0.2em] text-brand-300">
                    {n}
                  </div>
                  <h3 className="font-display text-xl sm:text-[1.4rem] font-semibold uppercase tracking-tight text-cream leading-tight">
                    {name}
                  </h3>
                </div>
              </div>

              <p className="mt-4 font-display text-[15.5px] sm:text-[16.5px] font-semibold leading-snug text-cream text-balance">
                {claim}
              </p>
              <p className="mt-2.5 text-[14.5px] sm:text-[15px] leading-relaxed text-cream/75 text-pretty">
                {detail}
              </p>
            </motion.li>
          ))}
        </motion.ol>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT_ONCE}
          className="mx-auto mt-10 max-w-2xl text-center font-display text-[16px] sm:text-[18px] font-semibold leading-snug text-ink-900 text-balance"
        >
          Every mother is stuck on at least one of these. Most are stuck on two.{' '}
          <span className="grad-text">Which two is the entire question</span> —
          and it is not a guess worth making off Instagram.
        </motion.p>
      </Container>
    </section>
  )
}

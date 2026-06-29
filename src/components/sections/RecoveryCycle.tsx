import { motion } from 'framer-motion'
import {
  Droplets,
  Flame,
  Activity,
  HeartPulse,
  Pill,
  CloudRain,
  HelpCircle,
  type LucideIcon,
} from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { fadeUp, stagger, VIEWPORT_ONCE } from '@/lib/motion'

interface Consequence {
  icon: LucideIcon
  text: string
}

// Each "main pointer" gets its own relevant, eye-catching icon.
const consequences: Consequence[] = [
  { icon: Droplets, text: 'Ferritin and B12 sitting in the "normal" range while your hair keeps falling out' },
  { icon: Flame, text: 'A metabolism that has quietly shifted into storage mode instead of repair mode' },
  { icon: Activity, text: 'A thyroid that is technically functioning but not converting hormones at the cell level' },
  { icon: HeartPulse, text: 'A cortisol pattern that keeps stealing raw materials away from your recovery hormones' },
  { icon: Pill, text: 'A supplement stack that was never actually reaching your cells to begin with' },
  { icon: CloudRain, text: 'Growing resignation that this is just what being a mum feels like' },
  { icon: HelpCircle, text: "Wondering whether you'll ever feel like yourself again, or whether that version of you is gone" },
]

export function RecoveryCycle() {
  return (
    <section className="relative section-pad">
      <Container>
        {/* Big display heading — matches the "Does this sound like you?" style. */}
        <SectionHeading
          title={
            <>
              Left unaddressed, <span className="grad-text">this leads to…</span>
            </>
          }
        />

        <motion.ul
          variants={stagger(0.07, 0.07)}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT_ONCE}
          className="mx-auto mt-10 grid grid-cols-1 max-w-4xl gap-3 sm:mt-12 sm:grid-cols-2"
        >
          {consequences.map((c, i) => {
            const Icon = c.icon
            const isLastOdd =
              consequences.length % 2 === 1 && i === consequences.length - 1
            return (
              <motion.li
                key={c.text}
                variants={fadeUp}
                className={
                  // Translucent glass-on-dark so it sits INTO the burgundy band
                  // instead of floating as a light card.
                  'group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-white/12 bg-white/[0.06] py-4 pl-6 pr-5 backdrop-blur-md transition-colors duration-300 hover:bg-white/[0.1]' +
                  (isLastOdd
                    ? ' sm:col-span-2 sm:mx-auto sm:w-[calc(50%-0.375rem)]'
                    : '')
                }
              >
                <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-brand-400" />
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/15 bg-white/10 text-brand-200">
                  <Icon className="h-5 w-5" strokeWidth={1.9} />
                </span>
                <span className="text-pretty text-[14.5px] leading-relaxed text-cream/85 sm:text-[15px]">
                  {c.text}
                </span>
              </motion.li>
            )
          })}
        </motion.ul>

        {/* ── Manifesto ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT_ONCE}
          className="mx-auto mt-12 max-w-xl sm:mt-14"
        >
          <div className="relative rounded-2xl border border-white/12 bg-white/[0.06] px-5 py-5 text-center backdrop-blur-md sm:px-7 sm:py-6">
            <p className="text-[13px] text-cream/65 sm:text-[13.5px]">
              The problem was never that something was wrong with you.
            </p>
            <p className="mt-2 font-display text-[1.05rem] font-semibold leading-snug text-cream text-balance sm:text-[1.2rem]">
              The problem is that postpartum recovery is a{' '}
              <span className="grad-text">24-month biological project</span>. And no one
              gave you the manual.
            </p>
          </div>
        </motion.div>
      </Container>
    </section>
  )
}

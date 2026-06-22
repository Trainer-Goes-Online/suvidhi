import { motion } from 'framer-motion'
import {
  AlertTriangle,
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
        {/* ── Over time, this can lead to ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT_ONCE}
          className="flex items-center justify-center gap-2 sm:gap-3"
        >
          <span aria-hidden className="hidden sm:inline-block h-px w-12 bg-brand-200" />
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[10.5px] sm:text-[13px] uppercase tracking-[0.14em] sm:tracking-[0.18em] font-bold text-brand-700">
            <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
            Left unaddressed, this leads to
          </span>
          <span aria-hidden className="hidden sm:inline-block h-px w-12 bg-brand-200" />
        </motion.div>

        <motion.ul
          variants={stagger(0.07, 0.07)}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT_ONCE}
          className="mx-auto mt-8 grid grid-cols-1 max-w-4xl gap-3 sm:grid-cols-2"
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
                  'group card card-hover relative flex items-center gap-4 overflow-hidden py-4 pl-6 pr-5' +
                  (isLastOdd
                    ? ' sm:col-span-2 sm:mx-auto sm:w-[calc(50%-0.375rem)]'
                    : '')
                }
              >
                <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-brand-600" />
                <span className="icon-tile-lg shrink-0">
                  <Icon className="h-5 w-5" strokeWidth={1.9} />
                </span>
                <span className="text-pretty text-[14.5px] leading-relaxed text-ink-800 sm:text-[15px]">
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
          <div className="relative rounded-2xl surface-tint border border-brand-200/60 px-5 py-5 text-center sm:px-7 sm:py-6">
            <p className="text-[13px] text-ink-600 sm:text-[13.5px]">
              The problem was never that something was wrong with you.
            </p>
            <p className="mt-2 font-display text-[1.05rem] font-semibold leading-snug text-ink-950 text-balance sm:text-[1.2rem]">
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

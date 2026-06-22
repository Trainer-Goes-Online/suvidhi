import { motion } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { PrimaryCTA } from '@/components/ui/PrimaryCTA'
import { Placeholder } from '@/components/ui/Placeholder'
import { fadeUp, stagger, VIEWPORT_ONCE } from '@/lib/motion'

// One image slot per sign (serial order). Placeholders for now — the manager
// will drop the final illustrations into these slots on his end.
const signs = [
  "You're 3, 6, 12 or even 24 months postpartum and still feel exhausted.",
  'Your hair is still shedding more than it should.',
  'Your doctor says your reports are "normal", but you don\'t feel normal.',
  "You're struggling with brain fog and poor focus.",
  'You hit a wall every afternoon and rely on caffeine to get through the day.',
  "You've tried supplements, diets and advice online, but nothing seems to create lasting change.",
  "The weight came off in some places but the stubborn post-baby pouch hasn't budged.",
  'Your mood feels flat, disconnected or unlike the person you used to be.',
]

export function SoundLikeYou() {
  return (
    <section className="relative section-pad">
      <Container>
        <SectionHeading
          title={
            <>
              Does this <span className="grad-text">sound like you?</span>
            </>
          }
          subtitle={
            <>
              If you nod along to even a few of these, you&apos;re not imagining
              it — and{' '}
              <span className="font-semibold text-brand-700">
                you&apos;re not alone
              </span>
              . This is exactly the pattern The Postpartum Restore was built to
              decode.
            </>
          }
        />

        <motion.ul
          variants={stagger(0.06, 0.06)}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT_ONCE}
          className="mt-12 sm:mt-14 grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-7 sm:gap-x-5 sm:gap-y-8"
        >
          {signs.map((text) => (
            <motion.li
              key={text}
              variants={fadeUp}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="group flex flex-col items-center text-center"
            >
              {/* Image slot — manager will add the illustration here. */}
              <Placeholder
                ratio="aspect-square"
                rounded="rounded-[22px]"
                label="Image"
                className="shadow-[0_12px_28px_-14px_rgba(0,0,0,0.55)] transition-transform duration-500 ease-out group-hover:-translate-y-1"
              />
              <p className="mt-3.5 px-1 text-ink-900 font-semibold text-[12.5px] sm:text-[13.5px] leading-snug text-pretty">
                {text}
              </p>
            </motion.li>
          ))}
        </motion.ul>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT_ONCE}
          className="mt-10 flex flex-col items-center gap-3"
        >
          <PrimaryCTA size="lg" label="Get Instant Access" />
          <p className="text-sm text-ink-600">
            14-Day money-back guarantee · Instant access
          </p>
        </motion.div>
      </Container>
    </section>
  )
}

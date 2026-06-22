import { motion } from 'framer-motion'
import { CheckCircle2, Gift, Sparkles } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import Image from 'next/image'
import { fadeUp, stagger, VIEWPORT_ONCE } from '@/lib/motion'
import { VALUE_STACK } from '@/lib/config'
import { formatINR } from '@/lib/utils'

// Titles + descriptions are the exact PDF copy; values come from VALUE_STACK.
const coreItems = [
  {
    title: 'The Postpartum Restore Guided Assessment',
    desc: "A 25-minute guided recovery experience that helps you identify what's really holding your recovery back, connect the dots between your symptoms, and uncover the specific factors affecting your energy, hair, mood and recovery.",
    image: '/Value_and_Bonuses/Product_Mockup_Assesement.png',
  },
  {
    title: 'The Postpartum Depletion Audit',
    desc: 'Review your blood markers against postpartum-focused ranges and discover whether hidden nutrient deficiencies may be contributing to fatigue, hair loss, brain fog and slow recovery.',
    image: '/Value_and_Bonuses/Product_Mockup_Audit1.png',
  },
  {
    title: 'The Metabolic Recovery Audit',
    desc: 'Identify the eating patterns, energy crashes and recovery gaps that may be keeping your body stuck in storage mode instead of repair mode.',
    image: '/Value_and_Bonuses/Product_Mockup_Audit2.png',
  },
  {
    title: 'The Supplement & Hair Recovery Audit',
    desc: 'Discover whether your current supplements are actually supporting your recovery and uncover the hidden connections between nutrient status, thyroid health and postpartum hair loss.',
    image: '/Value_and_Bonuses/Product_Mockup_Audit3.png',
  },
  {
    title: 'The Neuro-Endocrine Reset Audit',
    desc: 'Evaluate the lifestyle, stress and environmental factors that may be quietly affecting your hormones, energy, mood and overall recovery.',
    image: '/Value_and_Bonuses/Product_Mockup_Audit4.png',
  },
]

const bonusItems = [
  {
    title: '30-Minute Postpartum Assessment Call With Suvidhi',
    desc: 'Get personalised guidance on your assessment results, clarity on your biggest recovery bottlenecks, and expert direction on the next best steps for your body.',
    image: '/Value_and_Bonuses/Bonus1.png',
  },
  {
    title: 'Private Postpartum Mothers Community',
    desc: 'Join a supportive community of mothers navigating similar challenges, sharing wins, asking questions and supporting one another throughout their recovery journey.',
    image: '/Value_and_Bonuses/Bonus2.png',
  },
  {
    title: 'Monthly Group Coaching Sessions',
    desc: "Join live coaching sessions with Suvidhi where you'll get ongoing education, answers to your questions and deeper support as you continue implementing your recovery plan.",
    image: '/Value_and_Bonuses/Bonus3.png',
  },
]

export function ClarityCall() {
  return (
    <section className="relative section-pad">
      <Container>
        <SectionHeading
          eyebrow="Here's everything you'll get inside"
          title={
            <>
              Everything included in{' '}
              <span className="grad-text">The Postpartum Restore</span>
            </>
          }
          subtitle="Five clinical components, plus three free bonuses, each designed to move you out of survival mode and into actual recovery."
        />

        {/* Core deliverables — product-box image grid */}
        <motion.div
          variants={stagger(0.07, 0.07)}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT_ONCE}
          className="mt-12 sm:mt-14 flex flex-wrap justify-center gap-5 md:gap-6"
        >
          {coreItems.map((it, i) => (
            <motion.div
              key={it.title}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="group relative w-full md:w-[calc(50%-0.75rem)] card card-hover p-4 sm:p-5 overflow-hidden flex flex-col"
            >
              <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-cream-dark">
                <Image
                  src={it.image}
                  alt={it.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 380px"
                  className="object-cover"
                />
              </div>
              <div className="mt-4 flex items-start justify-between gap-3">
                <h3 className="font-display text-[1.05rem] sm:text-[1.15rem] font-semibold text-ink-950 leading-tight">
                  {it.title}
                </h3>
                <span className="chip-success shrink-0">{formatINR(VALUE_STACK[i].amount)}</span>
              </div>
              <p className="mt-1.5 text-ink-600 text-[14px] leading-relaxed text-pretty flex-1">
                {it.desc}
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-brand-700 uppercase tracking-[0.14em]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Instant access · Included
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bonus divider */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT_ONCE}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-200/60 text-brand-700 text-[11px] uppercase tracking-[0.22em] font-semibold">
            <Gift className="w-3.5 h-3.5" />
            Plus these bonuses · included free
          </div>
        </motion.div>

        {/* Bonuses — product-box image grid */}
        <motion.div
          variants={stagger(0.07, 0.07)}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT_ONCE}
          className="mt-8 flex flex-wrap justify-center gap-5 md:gap-6"
        >
          {bonusItems.map((it, i) => (
            <motion.div
              key={it.title}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="group relative w-full md:w-[calc(50%-0.75rem)] card card-hover p-4 sm:p-5 overflow-hidden flex flex-col"
            >
              <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-cream-dark">
                <Image
                  src={it.image}
                  alt={it.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 380px"
                  className="object-cover"
                />
              </div>
              <div className="mt-4 flex items-start justify-between gap-3">
                <h3 className="font-display text-[1.02rem] font-semibold text-ink-950 leading-tight">
                  {it.title}
                </h3>
                <span className="chip-success shrink-0">{formatINR(VALUE_STACK[5 + i].amount)}</span>
              </div>
              <p className="mt-1.5 text-ink-600 text-[13.5px] leading-relaxed flex-1">
                {it.desc}
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-brand-700 uppercase tracking-[0.16em]">
                <Sparkles className="w-3 h-3" />
                Bonus · included free
              </div>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  )
}

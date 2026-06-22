import { motion } from 'framer-motion'
import { Award, Check, GraduationCap, HeartHandshake, Microscope, Sprout } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { PrimaryCTA } from '@/components/ui/PrimaryCTA'
import { fadeUp, slideInLeft, slideInRight, stagger, VIEWPORT_ONCE } from '@/lib/motion'

// Small 3D gradient badge that holds an icon — used for the credential pills.
const badge3d =
  'grid place-items-center rounded-lg text-white shrink-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.45),0_3px_7px_-2px_rgba(203,74,93,0.5)] [background:linear-gradient(160deg,#de6976,#cb4a5d_60%,#963543)]'

const pills = [
  { icon: GraduationCap, label: 'UK-trained Clinical Nutritionist' },
  { icon: Sprout, label: 'Postpartum recovery specialist' },
  { icon: Microscope, label: 'Reports · symptoms · lifestyle' },
  { icon: HeartHandshake, label: 'Functional health · real life' },
]

const points = [
  'UK-trained Clinical Nutritionist specialising in postpartum recovery, metabolic health, and helping women feel like themselves again.',
  'Works with women months, even years, postpartum still struggling with exhaustion, hair fall, brain fog, stubborn weight gain and low mood.',
  'Believes being "cleared" after birth and being fully recovered are not the same thing, and built her work around the difference.',
  'Helps mothers connect the dots between symptoms, blood markers and lifestyle patterns so they can stop guessing and decide with confidence.',
  'Combines clinical nutrition, functional health principles and real-world strategy to uncover hidden factors, not just mask symptoms.',
]

export function Clinician() {
  return (
    <section className="relative section-pad overflow-x-clip">
      <Container>
        <SectionHeading
          eyebrow="The clinician behind The Postpartum Restore"
          title={
            <>
              Meet <span className="grad-text">Suvidhi</span>
            </>
          }
          subtitle="No fad protocols. No one-size-fits-all PDFs. A UK-trained clinician who connects the dots between your reports, symptoms and life, so you can stop guessing."
        />

        <motion.div
          variants={stagger(0.1, 0.1)}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT_ONCE}
          className="mt-10 sm:mt-12 lg:mt-14 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center"
        >
          {/* Real clinician photo */}
          <motion.div variants={slideInLeft} className="relative min-w-0">
            <div className="relative overflow-hidden rounded-[24px] shadow-elev ring-1 ring-brand-200/40 aspect-[1066/1120] glow-brand">
              <img
                src="/images/suvidhi/meet-suvidhi.webp"
                alt="Suvidhi — UK-trained clinical nutritionist"
                className="w-full h-full object-cover object-top"
                loading="lazy"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'linear-gradient(180deg, transparent 55%, rgba(57,18,24,0.18) 100%)',
                }}
              />
            </div>
            {/* Credential chips — single-column rows on mobile (no awkward
                2-line wrap), wrapping pill row on larger screens. */}
            <div className="mt-4 flex flex-col items-center gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
              {pills.map((p) => {
                const Icon = p.icon
                return (
                  <span
                    key={p.label}
                    className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl sm:rounded-full bg-white border border-brand-200/40 shadow-soft text-[13px] sm:text-[12.5px] font-semibold text-ink-800"
                  >
                    <span className={`${badge3d} w-6 h-6 sm:w-5 sm:h-5`}>
                      <Icon className="w-3.5 h-3.5 sm:w-3 sm:h-3" strokeWidth={2.2} />
                    </span>
                    {p.label}
                  </span>
                )
              })}
            </div>
          </motion.div>

          {/* Copy */}
          <motion.div variants={slideInRight} className="min-w-0 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full surface-tint border border-brand-200/60 text-brand-700 text-[12px] font-semibold">
              <Award className="w-3.5 h-3.5" />
              7+ years · 1000+ mothers supported
            </div>
            <h3 className="mt-4 font-display text-2xl sm:text-3xl font-semibold text-ink-950 leading-tight">
              A real clinician. <span className="grad-text">Your real postpartum.</span>
            </h3>

            <motion.ul
              variants={stagger(0, 0.07)}
              initial="hidden"
              whileInView="show"
              viewport={VIEWPORT_ONCE}
              className="mt-6 space-y-3 text-left max-w-xl mx-auto lg:mx-0"
            >
              {points.map((p) => (
                <motion.li key={p} variants={fadeUp} className="flex items-start gap-3">
                  <span className={`${badge3d} mt-0.5 w-6 h-6 !rounded-full`}>
                    <Check className="w-3.5 h-3.5" strokeWidth={3} />
                  </span>
                  <span className="text-ink-700 text-[15px] leading-relaxed text-pretty">{p}</span>
                </motion.li>
              ))}
            </motion.ul>

            <div className="mt-7 flex flex-col items-center gap-2.5">
              <PrimaryCTA size="lg" label="Get Instant Access" />
              <p className="text-sm text-ink-600">
                Includes a bonus 1:1 call with Suvidhi
              </p>
            </div>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  )
}

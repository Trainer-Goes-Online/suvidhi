import { motion } from 'framer-motion'
import { Award, Check, GraduationCap, HeartHandshake, Microscope, Sprout } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { CtaBlock } from '@/components/ui/CtaBlock'
import Image from 'next/image'
import { fadeUp, slideInLeft, slideInRight, stagger, VIEWPORT_ONCE } from '@/lib/motion'
import { NAMING, PROOF } from '@/lib/config'

// Small 3D gradient badge that holds an icon — used for the credential pills.
const badge3d =
  'grid place-items-center rounded-lg text-white shrink-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.45),0_3px_7px_-2px_rgba(203,74,93,0.5)] [background:linear-gradient(160deg,#de6976,#cb4a5d_60%,#963543)]'

// Credential strip. The degree letters (BSc · MSc) are still pending from the
// client, so nothing unverified is asserted here yet.
const pills = [
  { icon: GraduationCap, label: 'UK-trained Clinical Nutritionist' },
  { icon: Sprout, label: 'Postpartum recovery specialist' },
  { icon: Microscope, label: `${PROOF.yearsInPractice} years in practice` },
  { icon: HeartHandshake, label: `${PROOF.mothers} mothers` },
]

const points = [
  'UK-trained Clinical Nutritionist specialising in postpartum recovery, metabolic health and thyroid.',
  'Works with mothers from month 3 through to year 2 postpartum, including while breastfeeding.',
  'Reads your bloodwork against postpartum ranges, not general population ranges.',
  'Believes being cleared after birth and being recovered are two different things, and built her work around the difference.',
]

export function Clinician() {
  return (
    <section className="relative section-pad overflow-x-clip">
      <Container>
        <SectionHeading
          title={
            <>
              The Clinician Who Treats Postpartum As A{' '}
              <span className="grad-text">24-Month Recovery</span>, Not A 6-Week
              Checkup
            </>
          }
        />

        <motion.div
          variants={stagger(0.1, 0.1)}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT_ONCE}
          className="mt-10 sm:mt-12 lg:mt-14 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center"
        >
          {/* Photo — landscape */}
          <motion.div variants={slideInLeft} className="relative">
            <div className="relative aspect-[4/3] rounded-[24px] overflow-hidden shadow-elev bg-cream-dark">
              <Image
                src="/images/suvidhi/dsc00467.jpg"
                alt={`${NAMING.clinician} — UK-trained ${NAMING.clinicianTitle}`}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            {/* Floating credential chips */}
            <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-center">
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
              Meet your clinician
            </div>

            <div className="mt-5 space-y-4 max-w-xl mx-auto lg:mx-0 text-left text-ink-700 text-[15px] leading-relaxed text-pretty">
              <p>
                {NAMING.clinician} trained in clinical nutrition in the UK and
                came back to a market where postpartum care effectively ends at
                the six-week checkup. Someone confirms you are healing, and that
                is the last time anyone looks.
              </p>
              <p>
                Nobody checks what nine months of pregnancy and however many
                months of feeding took out of your stores. Nobody checks whether
                your body has switched back out of survival mode. Nobody checks
                whether the iron you are swallowing is actually reaching your
                cells.
              </p>
              <p>
                She built her practice around that gap. She reads your reports,
                connects them to what you are actually feeling, and builds a
                protocol around your biology instead of handing you a template.
              </p>
            </div>

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
          </motion.div>
        </motion.div>

        {/* ── CTA block #4 of 6 ── */}
        <div className="mt-12 sm:mt-14">
          <CtaBlock />
        </div>
      </Container>
    </section>
  )
}

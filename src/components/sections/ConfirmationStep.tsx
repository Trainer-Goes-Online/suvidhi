import { motion } from 'framer-motion'
import Image from 'next/image'
import { Container } from '@/components/ui/Container'
import { WhatsAppCta, buildWhatsAppUrl } from '@/components/ui/WhatsAppCta'
import { cn } from '@/lib/utils'
import { fadeUp, scaleIn, stagger } from '@/lib/motion'
import { NAMING } from '@/lib/config'
import { ASSETS } from '@/lib/assets'

/**
 * Post-booking bridge screen.
 *
 * The slot is on the calendar but the lead has not yet spoken to anyone, which
 * is where show-rate leaks. This interrupts the "I'm done" feeling and pushes
 * the one action that puts a human on the other end: a WhatsApp message.
 */

interface ConfirmationStepProps {
  /** Override the clinician avatar. Defaults to the waist-up portrait, which
   *  crops to a circle better than the full-body thank-you shot. */
  avatarSrc?: string
  /** Override the booking's name, so the copy tracks the landing page's wording. */
  sessionName?: string
  className?: string
}

export function ConfirmationStep({
  avatarSrc = ASSETS.portraitC,
  sessionName = NAMING.call,
  className,
}: ConfirmationStepProps) {
  const waUrl = buildWhatsAppUrl()

  return (
    // Fragment, not a wrapper: the sticky bar MUST be a sibling of the section
    // rather than a child of it. The section sets `isolate` for its -z-10
    // backdrop, which creates a stacking context — anything `fixed` inside it
    // is trapped there, and the `.band-dark` sections further down the page
    // (which set `isolation: isolate` themselves) would paint straight over it.
    <>
      <section
        className={cn('relative isolate overflow-hidden', className)}
        aria-labelledby="confirmation-step-heading"
      >
      {/* Ambient backdrop — matches the landing hero. */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div
          className="absolute -top-32 left-1/2 h-[55vh] w-[120%] -translate-x-1/2 opacity-70 blur-3xl"
          style={{
            background:
              'radial-gradient(closest-side, rgba(236,158,169,.55), transparent 70%)',
          }}
        />
      </div>

      <Container className="relative pt-10 pb-12 sm:pt-14 sm:pb-16">
        <motion.div
          variants={stagger(0.08, 0.06)}
          initial="hidden"
          animate="show"
          className="mx-auto flex max-w-2xl flex-col items-center text-center"
        >
          {/* Headline first, then the avatar — the interrupt has to land before
              the face does (see reference layout). */}
          <motion.h1
            id="confirmation-step-heading"
            variants={fadeUp}
            className="font-display text-[1.75rem] font-semibold leading-[1.18] tracking-tight text-ink-950 text-balance xs:text-[2rem] sm:text-[2.4rem]"
          >
            <span className="text-brand-600">WAIT!</span> Your {sessionName}{' '}
            Has Not Been Confirmed Yet&hellip;
          </motion.h1>

          {/* Avatar — thin brand ring, so the clinician reads as framed
              rather than badged. */}
          <motion.div variants={scaleIn} className="relative mt-8">
            <span
              aria-hidden
              className="absolute -inset-2 rounded-full bg-brand-300/40 blur-xl"
            />
            <div className="relative h-36 w-36 overflow-hidden rounded-full border-2 border-brand-500 bg-cream shadow-soft sm:h-44 sm:w-44">
              <Image
                src={avatarSrc}
                alt={`${NAMING.clinician} — ${NAMING.clinicianTitle}`}
                fill
                sizes="176px"
                className="object-cover object-top"
                priority
              />
            </div>
          </motion.div>

          {/* Body */}
          <motion.p
            variants={fadeUp}
            className="mt-7 text-[16px] leading-relaxed text-ink-700 text-pretty sm:text-[17.5px]"
          >
            You&rsquo;ve just{' '}
            <strong className="font-semibold text-ink-950">
              completed the first step
            </strong>
            .
          </motion.p>
          <motion.p
            variants={fadeUp}
            className="mt-2.5 text-[16px] leading-relaxed text-ink-700 text-pretty sm:text-[17.5px]"
          >
            Connect on WhatsApp to{' '}
            <strong className="font-semibold text-ink-950">
              get the next steps to confirm your {sessionName}
            </strong>
            .
          </motion.p>

          {/* Inline CTA — shown at EVERY breakpoint. On mobile this sits in the
              flow of the hero as well as in the sticky bar below; leaving a
              gap here read as a missing button. */}
          {waUrl && (
            <>
              <motion.div
                variants={fadeUp}
                className="mt-9 flex w-full justify-center"
              >
                <WhatsAppCta href={waUrl} size="hero" />
              </motion.div>
              <motion.p
                variants={fadeUp}
                className="mt-4 text-[13px] font-medium text-ink-500"
              >
                Takes 10 seconds &middot; Confirms your slot
              </motion.p>
            </>
          )}
        </motion.div>
        </Container>
      </section>

      {/* Mobile sticky CTA — a SIBLING of the section above, never a child.
          Rendered unconditionally: no AnimatePresence, no scroll trigger, no
          entrance delay, so it is on screen the instant the page mounts.

          CONTRACT: this bar is `position: fixed`, so the HOST PAGE must reserve
          bottom clearance on mobile (e.g. `pb-32 md:pb-0`). Put it on the OUTER
          page wrapper, not on <main> — a footer outside <main> would otherwise
          stay covered. No spacer is rendered here because this component is not
          always the last thing on the page. */}
      {waUrl && (
        <div className="pb-safe fixed inset-x-0 bottom-0 z-[60] border-t border-ink-100 bg-white/95 shadow-[0_-8px_30px_-12px_rgba(57,18,24,0.18)] backdrop-blur-xl md:hidden">
          <div className="px-4 py-3">
            <WhatsAppCta href={waUrl} size="bar" className="w-full" />
            <p className="mt-2 text-center text-[11.5px] font-medium text-ink-500">
              Takes 10 seconds &middot; Confirms your slot
            </p>
          </div>
        </div>
      )}
    </>
  )
}

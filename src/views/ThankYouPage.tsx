'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  CalendarCheck,
  ClipboardList,
  Mail,
  MessageCircle,
  Quote,
  Star,
  Volume2,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { TopMarquee } from '@/components/sections/TopMarquee'
import { Footer } from '@/components/sections/Footer'
import { ConfirmationStep } from '@/components/sections/ConfirmationStep'
import { WhatsAppCta, buildWhatsAppUrl } from '@/components/ui/WhatsAppCta'
import { getFunnelState } from '@/lib/funnelState'
import { fadeUp, stagger, VIEWPORT_ONCE } from '@/lib/motion'
import { appendUtm } from '@/lib/utm'
import { NAMING, SKOOL, WHATSAPP, resolvePlan } from '@/lib/config'
import { allReviews } from '@/lib/testimonials'

// The mechanism section is identical to the landing page's, so it is reused
// rather than restated — one source of truth for what the call actually covers.
// It is styled for a dark band, hence the `band-dark` wrapper below.
const FourSystemCheck = dynamic(() =>
  import('@/components/sections/FourSystemCheck').then((m) => m.FourSystemCheck),
)

/**
 * The post-booking bridge page.
 *
 * Reached once Calendly reports the slot is scheduled. The slot exists, but
 * nobody has spoken to the lead yet — so the page's first job is to drive one
 * action: message us on WhatsApp.
 *
 * Everything below the hero exists to protect show-rate, not to sell: what the
 * call covers, how to turn up prepared, and proof that the decision was sound.
 * There are deliberately NO landing-page CTAs here — this visitor has already
 * paid, and pushing them back to /oto would be nonsense.
 */

interface FunnelState {
  plan?: string
  name?: string
  email?: string
}

const PREP: { icon: typeof ClipboardList; title: string; desc: string }[] = [
  {
    icon: ClipboardList,
    title: 'Have your blood report to hand',
    desc: 'Anything from the last 6 months. No report? Come anyway — Suvidhi will tell you the exact panel to get.',
  },
  {
    icon: Volume2,
    title: 'Take it somewhere you can talk',
    desc: 'It is 30 minutes on Google Meet. Headphones help, and so does being somewhere you can speak honestly.',
  },
  {
    icon: CalendarCheck,
    title: 'Know your one biggest symptom',
    desc: 'The thing you would fix first if you could only fix one. That is where she starts.',
  },
]

export default function ThankYouPage() {
  const [state] = useState<FunnelState>(() => getFunnelState<FunnelState>() ?? {})
  const plan = resolvePlan(state.plan)
  const isBundle = plan.id === 'bundle'

  const communityUrl = WHATSAPP.communityUrl ? appendUtm(WHATSAPP.communityUrl) : ''
  const courseUrl = SKOOL.url ? appendUtm(SKOOL.url) : ''
  const waUrl = buildWhatsAppUrl()

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  return (
    // ConfirmationStep renders a fixed mobile CTA bar, so the clearance lives
    // on the OUTER wrapper, not on <main> — the footer sits outside <main> and
    // would otherwise have its last lines hidden behind the bar.
    <div className="relative flex min-h-screen flex-col pb-32 md:pb-0">
      <TopMarquee />

      <main className="relative flex-1">
        <ConfirmationStep />

        {/* Bundle buyers: the two steps that are still outstanding. Compact on
            purpose — the WhatsApp CTA above must stay the loudest thing here. */}
        {isBundle && (communityUrl || courseUrl) && (
          <section className="relative pb-12 sm:pb-16">
            <Container size="narrow">
              <motion.div
                variants={stagger(0.08, 0.06)}
                initial="hidden"
                whileInView="show"
                viewport={VIEWPORT_ONCE}
                className="mx-auto max-w-2xl"
              >
                <motion.p
                  variants={fadeUp}
                  className="text-center text-[11px] uppercase tracking-[0.2em] font-bold text-ink-500"
                >
                  Still to do, once you&rsquo;ve messaged us
                </motion.p>

                <motion.div variants={fadeUp} className="mt-4 grid gap-3 sm:grid-cols-2">
                  {communityUrl && (
                    <a
                      href={communityUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 rounded-2xl border border-ink-100 bg-white p-4 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-elev"
                    >
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-200/60 bg-brand-50 text-brand-700">
                        <MessageCircle className="h-5 w-5" strokeWidth={1.9} />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-display text-[14.5px] font-semibold leading-tight text-ink-950">
                          Join the mothers&rsquo; community
                        </span>
                        <span className="mt-0.5 block text-[12.5px] text-ink-600">
                          Private WhatsApp group
                        </span>
                      </span>
                    </a>
                  )}

                  {courseUrl && (
                    <a
                      href={courseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 rounded-2xl border border-ink-100 bg-white p-4 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-elev"
                    >
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-200/60 bg-brand-50 text-brand-700">
                        <Mail className="h-5 w-5" strokeWidth={1.9} />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-display text-[14.5px] font-semibold leading-tight text-ink-950">
                          Claim your course access
                        </span>
                        <span className="mt-0.5 block text-[12.5px] text-ink-600">
                          {NAMING.library}
                        </span>
                      </span>
                    </a>
                  )}
                </motion.div>
              </motion.div>
            </Container>
          </section>
        )}

        {/* What the call actually covers — the same mechanism as the landing
            page, reused verbatim so the promise cannot drift. */}
        <div className="band-dark">
          <FourSystemCheck />
        </div>

        {/* How to turn up prepared — the cheapest no-show insurance there is. */}
        <section className="relative section-pad">
          <Container>
            <SectionHeading
              title={
                <>
                  Three Things That Make Your Call{' '}
                  <span className="grad-text">Far More Useful</span>
                </>
              }
              subtitle="None of them take more than a minute to sort out beforehand."
            />

            <motion.ul
              variants={stagger(0.08, 0.07)}
              initial="hidden"
              whileInView="show"
              viewport={VIEWPORT_ONCE}
              className="mx-auto mt-10 grid max-w-4xl gap-4 sm:mt-12 md:grid-cols-3 md:gap-5"
            >
              {PREP.map(({ icon: Icon, title, desc }) => (
                <motion.li
                  key={title}
                  variants={fadeUp}
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="group flex flex-col card card-hover p-6"
                >
                  <span className="icon-tile-lg transition-all duration-500 group-hover:scale-110 group-hover:shadow-ring">
                    <Icon className="h-6 w-6" strokeWidth={1.75} />
                  </span>
                  <h3 className="mt-4 font-display text-[1.05rem] font-semibold leading-tight text-ink-950 text-balance sm:text-[1.15rem]">
                    {title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink-700 text-pretty sm:text-[14.5px]">
                    {desc}
                  </p>
                </motion.li>
              ))}
            </motion.ul>
          </Container>
        </section>

        {/* Proof — reassurance that the decision was a good one. Compact pull
            quotes, not the full landing-page cards, because this page is not
            selling anything. */}
        <section className="relative section-pad pt-0">
          <Container>
            <SectionHeading
              title={
                <>
                  You&rsquo;re In <span className="grad-text">Good Company</span>
                </>
              }
            />

            <motion.ul
              variants={stagger(0.08, 0.07)}
              initial="hidden"
              whileInView="show"
              viewport={VIEWPORT_ONCE}
              className="mx-auto mt-10 grid max-w-5xl gap-4 sm:mt-12 md:grid-cols-3 md:gap-5"
            >
              {allReviews.map((r) => (
                <motion.li key={r.name} variants={fadeUp} className="flex flex-col card p-6">
                  <Quote className="h-6 w-6 shrink-0 text-brand-300" strokeWidth={2} />
                  <blockquote className="mt-3 flex-1 text-[14.5px] leading-relaxed text-ink-800 text-pretty">
                    {r.short}
                  </blockquote>
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-brand-100/70 pt-4">
                    <span className="min-w-0">
                      <span className="block font-display text-[15px] font-semibold leading-tight text-ink-950">
                        {r.name}
                      </span>
                      <span className="mt-0.5 block text-[12px] font-semibold text-brand-700">
                        {r.result}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-0.5" aria-label="5 out of 5">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-brand-400 text-brand-400" />
                      ))}
                    </span>
                  </div>
                </motion.li>
              ))}
            </motion.ul>
          </Container>
        </section>

        {/* Closing repeat of the one action this page exists for. */}
        {waUrl && (
          <section className="relative pb-16 sm:pb-20">
            <Container size="narrow">
              <motion.div
                variants={stagger(0.08, 0.06)}
                initial="hidden"
                whileInView="show"
                viewport={VIEWPORT_ONCE}
                className="relative mx-auto flex max-w-2xl flex-col items-center overflow-hidden rounded-[28px] border border-brand-200/60 surface-tint p-7 text-center shadow-soft sm:p-10"
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full opacity-50 blur-3xl"
                  style={{
                    background:
                      'radial-gradient(closest-side, rgba(236,158,169,.6), transparent 70%)',
                  }}
                />
                <motion.h2 variants={fadeUp} className="relative h-sub text-balance">
                  One last thing &mdash;{' '}
                  <span className="grad-text">message us to confirm</span>
                </motion.h2>
                <motion.p
                  variants={fadeUp}
                  className="relative mt-3 max-w-md text-[15px] leading-relaxed text-ink-700 text-pretty sm:text-[16px]"
                >
                  Your slot is held, not confirmed. A quick WhatsApp message is
                  all it takes, and it is how we send your reminders.
                </motion.p>
                <motion.div
                  variants={fadeUp}
                  className="relative mt-7 flex w-full justify-center"
                >
                  <WhatsAppCta href={waUrl} size="hero" />
                </motion.div>
              </motion.div>
            </Container>
          </section>
        )}
      </main>

      <Footer hideCTA />
    </div>
  )
}

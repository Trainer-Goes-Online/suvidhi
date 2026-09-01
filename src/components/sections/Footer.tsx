import { motion } from 'framer-motion'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { fadeUp, VIEWPORT_ONCE } from '@/lib/motion'

const policies = [
  { label: 'Privacy Policy', to: '/privacy-policy' },
  { label: 'Terms & Conditions', to: '/terms-and-conditions' },
  { label: 'Refund Policy', to: '/refund-policy' },
]

interface FooterProps {
  /**
   * Retained for call-site compatibility. The footer no longer carries a CTA of
   * its own — the Closing section owns the final CTA block (dev spec §2,
   * Section 11), so the button never appeared twice in a row.
   */
  hideCTA?: boolean
}

/**
 * Footer + legal disclaimer (dev spec §2, Section 12).
 *
 * The page makes specific weight and diastasis recti claims and drives Meta
 * traffic, so shipping without a disclaimer was a live ad-account and
 * compliance gap. Closing it costs nothing.
 */
export function Footer(_props: FooterProps = {}) {
  return (
    <footer className="relative mt-16 sm:mt-20">
      {/* Top divider strip — rose */}
      <div className="h-1.5 w-full bg-brand-600" aria-hidden />

      <Container className="py-10 sm:py-12">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT_ONCE}
          className="space-y-6 text-center"
        >
          <p className="text-[14px] sm:text-[15px] text-ink-600 leading-relaxed">
            © {new Date().getFullYear()}{' '}
            <span className="font-semibold text-ink-800">InnoHealth</span>. All
            rights reserved.
          </p>

          <nav className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5">
            {policies.map((p, i) => (
              <span key={p.to} className="inline-flex items-center gap-2">
                {i > 0 && (
                  <span aria-hidden className="text-ink-300">
                    ·
                  </span>
                )}
                <Link
                  href={p.to}
                  className="text-[13.5px] font-semibold text-brand-600 hover:text-brand-700 underline-offset-2 hover:underline transition-colors"
                >
                  {p.label}
                </Link>
              </span>
            ))}
            <span aria-hidden className="text-ink-300">
              ·
            </span>
            <a
              href="https://www.instagram.com/innohealthbysuvidhi/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13.5px] font-semibold text-brand-600 hover:text-brand-700 underline-offset-2 hover:underline transition-colors"
            >
              Instagram
            </a>
          </nav>

          <p className="mx-auto max-w-3xl text-[11.5px] sm:text-[12px] leading-relaxed text-ink-500 text-pretty">
            All content and coaching services provided by InnoHealth and Suvidhi
            Pandey are intended for educational and informational purposes only
            and do not guarantee specific results. This is not medical advice.
            Always consult a qualified healthcare professional before making
            changes to your diet, exercise or lifestyle, and never change
            medication without your doctor. Client results and testimonials vary
            based on individual factors such as consistency, medical history,
            feeding status, lifestyle and adherence to the process. Outcomes are
            not typical or guaranteed. This website is not affiliated with or
            endorsed by Meta. FACEBOOK and INSTAGRAM are trademarks of Meta
            Platforms, Inc.
          </p>
        </motion.div>
      </Container>
    </footer>
  )
}

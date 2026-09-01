import { motion } from 'framer-motion'
import { Clock, Globe2, ShieldCheck, Star } from 'lucide-react'
import { Countdown } from '@/components/ui/Countdown'
import { PrimaryCTA } from '@/components/ui/PrimaryCTA'
import { cn } from '@/lib/utils'
import { fadeUp, stagger, VIEWPORT_ONCE } from '@/lib/motion'
import { PROOF } from '@/lib/config'

/**
 * The repeating CTA block (dev spec §1.2).
 *
 * On the reference pages the button never appears alone — it is always the same
 * three-part unit: button → trust row → countdown. Built once here and dropped
 * in at all six CTA positions (hero, "This Is For You If", results, Meet
 * Suvidhi, programme, closing) so the copy can never drift between them.
 */

interface CtaBlockProps {
  className?: string
  /** `dark` inverts the trust row + countdown for use inside a `band-dark`. */
  variant?: 'light' | 'dark'
  size?: 'md' | 'lg' | 'xl'
}

export function CtaBlock({
  className,
  variant = 'light',
  size = 'lg',
}: CtaBlockProps) {
  const isDark = variant === 'dark'
  const trust = [
    { icon: ShieldCheck, label: '100% Money-Back Guarantee' },
    { icon: Star, label: `${PROOF.mothers} Success Stories` },
    { icon: Globe2, label: 'Trusted By Mothers Globally' },
  ]

  return (
    <motion.div
      variants={stagger(0.07, 0.05)}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT_ONCE}
      className={cn('flex flex-col items-center gap-5 w-full', className)}
    >
      <motion.div variants={fadeUp} className="w-full flex justify-center">
        <PrimaryCTA size={size} />
      </motion.div>

      {/* Trust row */}
      <motion.ul
        variants={fadeUp}
        className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-2"
      >
        {trust.map(({ icon: Icon, label }) => (
          <li
            key={label}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5',
              'text-[11.5px] sm:text-[12.5px] font-semibold',
              isDark
                ? 'bg-white/10 border-white/15 text-cream/90 backdrop-blur-md'
                : 'bg-white border-ink-100 text-ink-700 shadow-soft',
            )}
          >
            <Icon
              className={cn('w-3.5 h-3.5 shrink-0', isDark ? 'text-brand-200' : 'text-brand-600')}
              strokeWidth={2}
            />
            {label}
          </li>
        ))}
      </motion.ul>

      {/* Countdown */}
      <motion.div variants={fadeUp} className="flex flex-col items-center gap-2.5">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 text-[10.5px] sm:text-[11px] uppercase tracking-[0.2em] font-semibold',
            isDark ? 'text-cream/65' : 'text-ink-500',
          )}
        >
          <Clock className={cn('w-3.5 h-3.5', isDark ? 'text-brand-300' : 'text-brand-600')} />
          Offer ends in
        </span>
        <Countdown variant={isDark ? 'dark' : 'light'} size="sm" />
      </motion.div>
    </motion.div>
  )
}

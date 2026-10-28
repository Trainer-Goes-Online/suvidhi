import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { utmQueryString } from '@/lib/utm'
import { trackCheckoutCtaClick } from '@/lib/metaClient'
import { CTA_ATTENTION_ANIMATE, CTA_ATTENTION_TRANSITION } from '@/lib/motion'

/**
 * THE call-to-action label (dev spec §1.1). One exact string, every position on
 * the page, no variations — British "Personalised" is deliberate and on-brand.
 */
export const CTA_LABEL =
  'Click Here To Get Your Personalised Diagnosis & Postpartum Recovery Roadmap'

/** Every CTA now routes to the OTO step, never straight to a product checkout. */
export const CTA_DESTINATION = '/oto'

interface PrimaryCTAProps {
  className?: string
  label?: string
  size?: 'md' | 'lg' | 'xl'
  to?: string
}

export function PrimaryCTA({
  className,
  label = CTA_LABEL,
  size = 'lg',
  to = CTA_DESTINATION,
}: PrimaryCTAProps) {
  const router = useRouter()
  const reduce = useReducedMotion()
  const [hovered, setHovered] = useState(false)

  const sizeClass =
    size === 'xl'
      ? 'px-6 sm:px-9 py-3.5 sm:py-[18px] text-[14.5px] sm:text-[16.5px]'
      : size === 'lg'
      ? 'px-5 sm:px-8 py-3.5 sm:py-4 text-[14px] sm:text-[15.5px]'
      : 'px-5 sm:px-6 py-3 sm:py-3.5 text-[13.5px] sm:text-[14.5px]'

  return (
    <motion.button
      onClick={() => {
        // Meta AddToCart + GA4 add_to_cart (once per browser, funnel entry only).
        trackCheckoutCtaClick(to)
        router.push(to + utmQueryString())
      }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      animate={reduce ? undefined : CTA_ATTENTION_ANIMATE}
      transition={reduce ? undefined : CTA_ATTENTION_TRANSITION}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'group relative inline-flex w-full max-w-2xl items-center justify-center gap-2.5 overflow-hidden',
        // The spec label is long — it MUST be allowed to wrap on narrow screens
        // rather than shrink to an unreadable size.
        'rounded-3xl sm:rounded-full font-semibold tracking-tight text-balance leading-snug',
        'bg-brand-600 text-white hover:bg-brand-700',
        'shadow-elev hover:shadow-glow',
        'transition-[box-shadow,background-color] duration-500 ease-out',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30',
        sizeClass,
        className,
      )}
    >
      {/* hover shine, left → right */}
      <motion.span
        aria-hidden
        initial={{ x: '-150%' }}
        animate={{ x: hovered ? '170%' : '-150%' }}
        transition={{ duration: hovered ? 0.9 : 0, ease: 'easeOut' }}
        className="pointer-events-none absolute inset-y-0 left-0 w-1/3 skew-x-[-12deg]"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,.3) 50%, transparent 100%)' }}
      />
      <span className="relative">{label}</span>
      <ArrowRight
        className="relative w-[18px] h-[18px] shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-0.5"
        aria-hidden
      />
    </motion.button>
  )
}

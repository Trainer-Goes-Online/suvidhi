import { motion, useReducedMotion } from 'framer-motion'
import { WhatsAppIcon } from '@/components/ui/icons/WhatsAppIcon'
import { cn } from '@/lib/utils'
import { CTA_ATTENTION_ANIMATE, CTA_ATTENTION_TRANSITION } from '@/lib/motion'
import { BRAND } from '@/lib/config'

/**
 * The one action the post-booking page exists to drive.
 *
 * The number is NOT hardcoded — it comes from BRAND.phone, which is itself
 * env-driven (NEXT_PUBLIC_BRAND_PHONE), so the contact number has a single
 * source of truth across the site, the policy pages and this CTA.
 */

/** api.whatsapp.com wants bare digits — no "+", spaces or dashes. */
function toWaDigits(phone: string): string {
  return phone.replace(/\D/g, '')
}

export function buildWhatsAppUrl(
  phone: string = BRAND.phone,
  text = "Hey, I've booked a call. What's the next step to confirm my call?",
): string {
  const digits = toWaDigits(phone)
  if (!digits) return ''
  const params = new URLSearchParams({
    phone: digits,
    text,
    type: 'phone_number',
    app_absent: '0',
  })
  return `https://api.whatsapp.com/send/?${params.toString()}`
}

interface WhatsAppCtaProps {
  href: string
  /** `hero` is the oversized primary; `bar` fills the mobile sticky bar. */
  size?: 'hero' | 'bar'
  label?: string
  className?: string
}

export function WhatsAppCta({
  href,
  size = 'hero',
  label = 'Click Here',
  className,
}: WhatsAppCtaProps) {
  const reduce = useReducedMotion()
  const isHero = size === 'hero'

  return (
    <span className={cn('relative inline-flex', isHero && 'isolate', className)}>
      {/* Soft pulsing halo behind the button — pure opacity/transform, so it
          stays off the main thread. Hero only; the sticky bar has its own
          surface and a glow there would muddy the edge. */}
      {isHero && !reduce && (
        <motion.span
          aria-hidden
          animate={{ opacity: [0.35, 0.75, 0.35], scale: [0.96, 1.06, 0.96] }}
          transition={{ duration: 2.4, ease: 'easeInOut', repeat: Infinity }}
          className="pointer-events-none absolute -inset-3 -z-10 rounded-full bg-[#25D366]/45 blur-xl"
        />
      )}

      <motion.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        animate={reduce ? undefined : CTA_ATTENTION_ANIMATE}
        transition={reduce ? undefined : CTA_ATTENTION_TRANSITION}
        whileTap={{ scale: 0.97 }}
        className={cn(
          'group relative inline-flex items-center justify-center gap-3 overflow-hidden',
          'rounded-full font-display font-bold tracking-tight',
          // WhatsApp green rather than the brand rose: the destination IS
          // WhatsApp, and the colour is the fastest signal of where the tap goes.
          'bg-[#25D366] text-white hover:bg-[#1FB457] active:bg-[#1AA34D]',
          'transition-[background-color,box-shadow,transform] duration-300 ease-out',
          'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40',
          isHero
            ? 'w-full max-w-md px-10 py-5 min-h-[68px] text-[19px] sm:text-[22px] shadow-[0_18px_40px_-12px_rgba(37,211,102,0.65)] hover:shadow-[0_22px_50px_-10px_rgba(37,211,102,0.8)]'
            : 'w-full px-7 py-4 min-h-[60px] text-[18px] shadow-elev',
        )}
      >
        {/* Shine sweep — the same device the landing-page CTAs use. */}
        {!reduce && (
          <motion.span
            aria-hidden
            initial={{ x: '-160%' }}
            animate={{ x: ['-160%', '260%'] }}
            transition={{ duration: 1.15, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1.7 }}
            className="pointer-events-none absolute inset-y-0 left-0 w-1/3 skew-x-[-12deg]"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(255,255,255,.45) 50%, transparent 100%)',
            }}
          />
        )}
        <WhatsAppIcon
          className={cn('relative shrink-0', isHero ? 'h-7 w-7' : 'h-6 w-6')}
        />
        <span className="relative">{label}</span>
      </motion.a>
    </span>
  )
}

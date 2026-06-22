import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { fadeUp, VIEWPORT_ONCE } from '@/lib/motion'

interface SectionHeadingProps {
  eyebrow?: ReactNode
  title: ReactNode
  subtitle?: ReactNode
  align?: 'left' | 'center'
  className?: string
  titleClassName?: string
}

export function SectionHeading({
  title,
  subtitle,
  align = 'center',
  className,
  titleClassName,
}: SectionHeadingProps) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT_ONCE}
      className={cn(
        'flex flex-col gap-4 sm:gap-5',
        align === 'center' ? 'items-center text-center mx-auto max-w-3xl' : 'items-start',
        className,
      )}
    >
      {/* Eyebrow labels above section headings removed per design direction. */}
      <h2
        className={cn(
          'h-section text-balance',
          align === 'center' ? 'text-center' : 'text-left',
          titleClassName,
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            'text-ink-600 text-base sm:text-lg leading-relaxed text-pretty',
            align === 'center' ? 'text-center max-w-2xl' : 'text-left max-w-2xl',
          )}
        >
          {subtitle}
        </p>
      )}
    </motion.div>
  )
}

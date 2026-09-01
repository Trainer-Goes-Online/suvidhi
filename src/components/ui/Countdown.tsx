import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { OFFER_WINDOW } from '@/lib/config'

interface CountdownProps {
  /** Whole hours in the window. Omit the block entirely by passing 0. */
  hours?: number
  minutes?: number
  seconds?: number
  className?: string
  variant?: 'light' | 'dark'
  size?: 'sm' | 'md'
}

export function Countdown({
  hours = OFFER_WINDOW.hours,
  minutes = OFFER_WINDOW.minutes,
  seconds = OFFER_WINDOW.seconds,
  className,
  variant = 'light',
  size = 'md',
}: CountdownProps) {
  const [remaining, setRemaining] = useState(
    () => hours * 3600 + minutes * 60 + seconds,
  )

  useEffect(() => {
    if (remaining <= 0) return
    const t = window.setInterval(() => {
      setRemaining((r) => Math.max(0, r - 1))
    }, 1000)
    return () => window.clearInterval(t)
  }, [remaining])

  const pad = (n: number) => n.toString().padStart(2, '0')
  const h = pad(Math.floor(remaining / 3600))
  const m = pad(Math.floor((remaining % 3600) / 60))
  const s = pad(remaining % 60)

  const isDark = variant === 'dark'
  // The hours block is dropped when the window never had hours in it, so a
  // short timer doesn't render a permanent "00 HRS".
  const showHours = hours > 0

  return (
    <div
      className={cn(
        'flex items-center justify-center gap-1.5 sm:gap-2 font-mono w-full',
        isDark ? 'text-white' : 'text-ink-900',
        className,
      )}
    >
      {showHours && (
        <>
          <TimeBlock value={h} label="HRS" dark={isDark} size={size} />
          <Colon dark={isDark} size={size} />
        </>
      )}
      <TimeBlock value={m} label="MIN" dark={isDark} size={size} />
      <Colon dark={isDark} size={size} />
      <TimeBlock value={s} label="SEC" dark={isDark} size={size} />
    </div>
  )
}

function Colon({ dark, size }: { dark?: boolean; size: 'sm' | 'md' }) {
  return (
    <span
      className={cn(
        'font-bold animate-breathe',
        size === 'sm' ? 'text-lg' : 'text-2xl',
        dark ? 'text-white/60' : 'text-ink-400',
      )}
    >
      :
    </span>
  )
}

function TimeBlock({
  value,
  label,
  dark,
  size,
}: {
  value: string
  label: string
  dark?: boolean
  size: 'sm' | 'md'
}) {
  const isSm = size === 'sm'
  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          'relative rounded-2xl overflow-hidden',
          'flex items-center justify-center font-bold tabular-nums',
          isSm
            ? 'w-10 sm:w-11 h-10 sm:h-11'
            : 'w-12 sm:w-[58px] h-12 sm:h-[58px]',
          dark
            ? 'text-white border border-white/25 backdrop-blur-md [background:linear-gradient(180deg,rgba(255,255,255,0.2),rgba(255,255,255,0.04))] shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.4),inset_0_-5px_9px_rgba(0,0,0,0.4),0_9px_20px_-6px_rgba(0,0,0,0.55)]'
            : 'text-cream [background:linear-gradient(180deg,#3a2329,#211e1e_60%,#110f0f)] shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.18),0_10px_22px_-8px_rgba(57,18,24,0.6)] border border-white/10',
        )}
      >
        <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent" />
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={isSm ? 'text-lg sm:text-xl' : 'text-2xl sm:text-3xl'}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </div>
      <span
        className={cn(
          'mt-1.5 font-semibold tracking-[0.18em]',
          isSm ? 'text-[9px]' : 'text-[10px]',
          dark ? 'text-white/55' : 'text-ink-500',
        )}
      >
        {label}
      </span>
    </div>
  )
}

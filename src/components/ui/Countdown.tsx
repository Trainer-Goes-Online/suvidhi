import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CountdownProps {
  minutes?: number
  className?: string
  variant?: 'light' | 'dark'
}

export function Countdown({
  minutes = 15,
  className,
  variant = 'light',
}: CountdownProps) {
  const [remaining, setRemaining] = useState(minutes * 60)

  useEffect(() => {
    if (remaining <= 0) return
    const t = window.setInterval(() => {
      setRemaining((r) => Math.max(0, r - 1))
    }, 1000)
    return () => window.clearInterval(t)
  }, [remaining])

  const m = Math.floor(remaining / 60)
    .toString()
    .padStart(2, '0')
  const s = (remaining % 60).toString().padStart(2, '0')

  const isDark = variant === 'dark'

  return (
    <div
      className={cn(
        'flex items-center justify-center gap-2 font-mono w-full',
        isDark ? 'text-white' : 'text-ink-900',
        className,
      )}
    >
      <TimeBlock value={m} label="MIN" dark={isDark} />
      <span
        className={cn(
          'text-2xl font-bold animate-breathe',
          isDark ? 'text-white/60' : 'text-ink-400',
        )}
      >
        :
      </span>
      <TimeBlock value={s} label="SEC" dark={isDark} />
    </div>
  )
}

function TimeBlock({ value, label, dark }: { value: string; label: string; dark?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          'relative w-12 sm:w-[58px] h-12 sm:h-[58px] rounded-2xl overflow-hidden',
          'flex items-center justify-center font-bold tabular-nums',
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
            className="text-2xl sm:text-3xl"
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </div>
      <span
        className={cn(
          'mt-1.5 text-[10px] font-semibold tracking-[0.18em]',
          dark ? 'text-white/55' : 'text-ink-500',
        )}
      >
        {label}
      </span>
    </div>
  )
}

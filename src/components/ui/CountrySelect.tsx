'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ElementType } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown, Search } from 'lucide-react'
import { getCountryCallingCode, type Country } from 'react-phone-number-input'
import { cn } from '@/lib/utils'

/**
 * Themed replacement for react-phone-number-input's country picker.
 *
 * The library's default is a native <select>, whose open list is drawn by the
 * browser/OS and cannot be styled — it showed as a plain grey system list on
 * an otherwise branded form. Plugged in via `countrySelectComponent`, so the
 * library still owns parsing, formatting and the value; this only replaces
 * the picker UI.
 */

interface Option {
  value?: Country
  label: string
  divider?: boolean
}

interface CountrySelectProps {
  value?: Country
  onChange: (value?: Country) => void
  options: Option[]
  iconComponent: ElementType
  disabled?: boolean
  readOnly?: boolean
  onFocus?: () => void
  onBlur?: () => void
  'aria-label'?: string
}

/** Same flag source the library uses — loaded lazily, row by row. */
const FLAG_URL = 'https://purecatamphetamine.github.io/country-flag-icons/3x2/'

/** Countries shown first, ahead of the alphabetical list. */
const PINNED: Country[] = ['IN', 'AE', 'US', 'GB', 'CA', 'AU', 'SG']

const PANEL_HEIGHT = 320

export function CountrySelect({
  value,
  onChange,
  options,
  iconComponent: Icon,
  disabled,
  readOnly,
  onFocus,
  onBlur,
  'aria-label': ariaLabel = 'Country',
}: CountrySelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [openUp, setOpenUp] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const countries = useMemo(() => {
    const real = options.filter((o): o is Option & { value: Country } => !!o.value && !o.divider)
    const pinned = PINNED.map((c) => real.find((o) => o.value === c)).filter(
      (o): o is Option & { value: Country } => !!o,
    )
    return [...pinned, ...real.filter((o) => !PINNED.includes(o.value))]
  }, [options])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^\+/, '')
    if (!q) return countries
    // Match from the start of any word ("uni" → United …, not Tunisia).
    return countries.filter(
      (o) =>
        o.label.toLowerCase().split(/[\s(),.-]+/).some((w) => w.startsWith(q)) ||
        o.label.toLowerCase().startsWith(q) ||
        o.value.toLowerCase() === q ||
        getCountryCallingCode(o.value).startsWith(q),
    )
  }, [countries, query])

  const close = (refocus = true) => {
    setOpen(false)
    setQuery('')
    onBlur?.()
    if (refocus) rootRef.current?.querySelector<HTMLButtonElement>('button')?.focus()
  }

  const choose = (c: Country) => {
    onChange(c)
    close(false)
    // Straight back to the number field, ready to type.
    window.setTimeout(
      () => rootRef.current?.parentElement?.querySelector<HTMLInputElement>('.PhoneInputInput')?.focus(),
      0,
    )
  }

  const toggle = () => {
    if (disabled || readOnly) return
    if (open) return close()
    // Open upward when there isn't room below (e.g. above the mobile sticky bar).
    const rect = rootRef.current?.getBoundingClientRect()
    if (rect) {
      // Below lg the sticky bottom bar eats ~140px of the viewport.
      const reserved = window.innerWidth < 1024 ? 150 : 16
      const below = window.innerHeight - rect.bottom - reserved
      setOpenUp(below < PANEL_HEIGHT && rect.top > below)
    }
    const idx = countries.findIndex((o) => o.value === value)
    setActive(Math.max(0, idx))
    setOpen(true)
    onFocus?.()
  }

  // Close on outside tap / click.
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Focus the search box with a mouse/trackpad only — on touch it would pop the
  // keyboard up over the list the moment it opens.
  useEffect(() => {
    if (open && window.matchMedia('(pointer: fine)').matches) searchRef.current?.focus()
  }, [open])

  useEffect(() => setActive(0), [query])

  // Keep the highlighted row in view (also scrolls to the current country on open).
  useLayoutEffect(() => {
    if (!open) return
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [active, open])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        toggle()
      }
      return
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      close()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(filtered.length - 1, i + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(0, i - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const pick = filtered[active]
      if (pick) choose(pick.value)
    }
  }

  const selectedLabel = countries.find((o) => o.value === value)?.label

  return (
    <div ref={rootRef} className="relative mr-2 pr-2 border-r border-ink-200" onKeyDown={onKeyDown}>
      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        aria-label={selectedLabel ? `${ariaLabel}: ${selectedLabel}` : ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          'flex items-center gap-1 rounded-lg py-1 pl-0.5 pr-1 transition-colors',
          'hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30',
          open && 'bg-brand-50',
        )}
      >
        <Icon country={value} label={selectedLabel ?? ariaLabel} />
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 text-ink-500 transition-transform duration-300',
            open && 'rotate-180 text-brand-700',
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: openUp ? 6 : -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: openUp ? 6 : -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'absolute -left-3 z-[60] w-[min(20rem,calc(100vw-3rem))] overflow-hidden',
              'rounded-2xl border border-ink-100 bg-white shadow-elev ring-1 ring-black/[0.02]',
              openUp ? 'bottom-full mb-3 origin-bottom-left' : 'top-full mt-3 origin-top-left',
            )}
          >
            <div className="border-b border-ink-100 p-2.5">
              <label className="flex items-center gap-2 rounded-xl border border-ink-200 bg-cream px-3 py-2 transition-colors focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/15">
                <Search className="h-4 w-4 shrink-0 text-ink-400" />
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search country or code"
                  aria-label="Search countries"
                  className="w-full bg-transparent text-[14px] text-ink-900 placeholder:text-ink-400 outline-none"
                />
              </label>
            </div>

            <ul
              ref={listRef}
              role="listbox"
              aria-label={ariaLabel}
              style={{ maxHeight: PANEL_HEIGHT - 60 }}
              className="overflow-y-auto overscroll-contain py-1.5"
            >
              {filtered.length === 0 && (
                <li className="px-4 py-6 text-center text-[13px] text-ink-500">No matching country</li>
              )}
              {filtered.map((o, i) => {
                const selected = o.value === value
                // A thin rule under the pinned group (unfiltered list only).
                const lastPinned = !query && i === PINNED.length - 1
                return (
                  <li
                    key={o.value}
                    data-index={i}
                    role="option"
                    aria-selected={selected}
                    onPointerEnter={() => setActive(i)}
                    onClick={() => choose(o.value)}
                    className={cn(
                      'mx-1.5 flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] transition-colors',
                      i === active && !selected && 'bg-cream-dark',
                      selected ? 'bg-brand-50 text-brand-800 font-semibold' : 'text-ink-800',
                      lastPinned && 'mb-1.5 relative after:absolute after:-bottom-1 after:left-3 after:right-3 after:h-px after:bg-ink-100',
                    )}
                  >
                    <img
                      src={`${FLAG_URL}${o.value}.svg`}
                      alt=""
                      loading="lazy"
                      width={24}
                      height={16}
                      className="h-4 w-6 shrink-0 rounded-[3px] object-cover shadow-sm ring-1 ring-black/5"
                    />
                    <span className="min-w-0 flex-1 truncate">{o.label}</span>
                    <span className={cn('shrink-0 tabular-nums text-[13px]', selected ? 'text-brand-700' : 'text-ink-500')}>
                      +{getCountryCallingCode(o.value)}
                    </span>
                    {selected && <Check className="h-4 w-4 shrink-0 text-brand-600" strokeWidth={2.5} />}
                  </li>
                )
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

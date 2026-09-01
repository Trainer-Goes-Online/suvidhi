import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { BadgeCheck, Play, PlayCircle, Star } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { CtaBlock } from '@/components/ui/CtaBlock'
import { cn } from '@/lib/utils'
import { fadeUp, stagger, VIEWPORT_ONCE } from '@/lib/motion'

/**
 * Results (dev spec §2, Section 4).
 *
 * Card format follows the reference pages: name → meta line → stars → narrative
 * → three before/after stat tiles. The tiles are the important part: they turn
 * a paragraph into evidence.
 *
 * PENDING FROM THE CLIENT (blocking, dev spec Part 6 items 2 & 3):
 *  • `meta` (age · profession · city) for all three. Deliberately left
 *    undefined rather than shipping "[AGE] · [PROFESSION] · [CITY]" — the row
 *    simply doesn't render until the real detail arrives.
 *  • Samia's actual before/after figures, so her weight tile can carry numbers
 *    the way Shachi's and Subhuti's already do.
 *
 * The Awantika testimonial was removed per the spec: it is a fertility and
 * conception story on a postpartum recovery page, and it was the only place on
 * the site carrying a "Dt." title.
 */

interface Stat {
  value: string
  label: string
}

interface Review {
  name: string
  /** "26 · Corporate Lawyer · Faridabad" — pending from the client. */
  meta?: string
  result: string
  story: string
  stats: Stat[]
}

interface ImageReview extends Review {
  image: string
}

interface VideoReview extends Review {
  video: string
  poster: string
}

const imageReviews: ImageReview[] = [
  {
    name: 'Shachi',
    image: '/images/shachi.jpg',
    result: '75.55 → 62.6 kg',
    story:
      'Reports came back normal while her hair kept falling out through every single wash, still breastfeeding, thyroid sitting borderline. Working with Suvidhi she came down from 75.55 kg to 62.6 kg, brought her thyroid markers back into range and stopped the hair fall completely. Nothing in her protocol asked her to stop feeding.',
    stats: [
      { value: '75.55 → 62.6 kg', label: 'Weight' },
      { value: 'Back in range', label: 'Thyroid markers' },
      { value: 'Stopped', label: 'Hair fall' },
    ],
  },
  {
    name: 'Samia Nehal',
    image: '/images/samia-nehal.jpg',
    result: 'Sustained weight loss',
    story:
      'Wanted to lose the weight without a plan she would quit in nine days. Her protocol was built around her food, her family’s food and her Ramadan schedule. Nothing removed, things reordered. The weight came off, her energy came back, and she is still eating what she was eating.',
    stats: [
      { value: 'Sustained', label: 'Weight loss' },
      { value: 'Restored', label: 'Energy' },
      { value: 'No restriction', label: 'Approach' },
    ],
  },
]

const videoReviews: VideoReview[] = [
  {
    name: 'Subhuti',
    video: '/images/subhuti.mp4',
    poster: '/images/subhuti-thumb.webp',
    result: '84 → 75 kg',
    story:
      'Six weeks left of maternity leave, 84 kg, running on empty, inflammation and hair fall on top of it. Over her programme she came down to 75 kg, cleared the inflammation and got her energy back. The thing she talks about is not the number. It is that she went back to work without dragging herself through every day.',
    stats: [
      { value: '84 → 75 kg', label: 'Weight' },
      { value: 'Reversed', label: 'Inflammation' },
      { value: 'Resolved', label: 'Hair fall' },
    ],
  },
]

function Stars() {
  return (
    <div className="flex items-center gap-0.5">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} className="w-4 h-4 fill-brand-400 text-brand-400" />
      ))}
    </div>
  )
}

// Poster thumbnail (frame grabbed from the clip) with a brand-themed 3D play
// button. Native controls only appear once the viewer starts the video.
function VideoPlayer({ src, poster, name }: { src: string; poster: string; name: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [started, setStarted] = useState(false)

  const handlePlay = () => {
    setStarted(true)
    ref.current?.play().catch(() => {})
  }

  return (
    <div className="relative w-full overflow-hidden rounded-t-3xl bg-ink-950">
      <video
        ref={ref}
        src={src}
        poster={poster}
        controls={started}
        preload="none"
        playsInline
        onPlay={() => setStarted(true)}
        className="w-full max-h-[440px] object-contain bg-ink-950"
      />

      {!started && (
        <button
          type="button"
          onClick={handlePlay}
          aria-label={`Play ${name}'s video story`}
          className="group/play absolute inset-0 grid place-items-center"
        >
          {/* legibility scrim */}
          <span
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-ink-950/55 via-ink-950/5 to-ink-950/20"
          />
          {/* 3D play button */}
          <span className="relative grid place-items-center w-[70px] h-[70px] rounded-full text-white ring-1 ring-white/35 shadow-[inset_0_2px_3px_rgba(255,255,255,0.55),inset_0_-3px_6px_rgba(150,53,67,0.6),0_12px_28px_-6px_rgba(203,74,93,0.85)] [background:linear-gradient(155deg,#e8838f_0%,#cb4a5d_55%,#8f2e3e_100%)] transition-transform duration-300 ease-out group-hover/play:scale-110 group-active/play:scale-95">
            {/* pulsing halo */}
            <span
              aria-hidden
              className="absolute inset-0 rounded-full ring-2 ring-white/40 animate-ping opacity-60"
            />
            <Play className="relative w-7 h-7 translate-x-[2px] fill-white text-white drop-shadow-[0_1px_2px_rgba(57,18,24,0.5)]" />
          </span>
        </button>
      )}
    </div>
  )
}

function ResultBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-[12px] font-bold text-brand-700 shadow-soft backdrop-blur">
      <BadgeCheck className="w-3.5 h-3.5 text-brand-600" />
      {label}
    </span>
  )
}

/** Three before → after tiles. This is what turns a story into evidence. */
function StatTiles({ stats }: { stats: Stat[] }) {
  return (
    <div className="mt-4 grid grid-cols-3 gap-2 border-t border-brand-100/70 pt-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-xl border border-brand-200/40 surface-tint px-2 py-2.5 text-center"
        >
          <div className="font-display text-[12.5px] sm:text-[13.5px] font-semibold leading-tight text-ink-950 text-balance">
            {s.value}
          </div>
          <div className="mt-1 text-[8.5px] sm:text-[9.5px] uppercase tracking-[0.12em] font-semibold leading-snug text-ink-500">
            {s.label}
          </div>
        </div>
      ))}
    </div>
  )
}

function NameRow({ name, meta }: { name: string; meta?: string }) {
  return (
    <div className="min-w-0">
      <div className="font-display text-[16px] font-semibold text-ink-950 leading-tight">
        {name}
      </div>
      {meta && (
        <div className="mt-0.5 text-[12px] text-ink-500 leading-snug">{meta}</div>
      )}
    </div>
  )
}

export function Testimonials() {
  return (
    <section className="relative section-pad">
      <Container>
        <SectionHeading
          title={
            <>
              Mothers Who <span className="grad-text">Stopped Waiting</span> To
              Feel Like Themselves Again
            </>
          }
          subtitle="These are women 3 months to 2 years postpartum. Working mothers, first-time mothers, second-time mothers."
        />

        {/* ── Image testimonials ── */}
        <motion.div
          variants={stagger(0.08, 0.08)}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT_ONCE}
          className="mt-10 sm:mt-12 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 items-stretch"
        >
          {imageReviews.map((r) => (
            <motion.figure
              key={r.name}
              variants={fadeUp}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="group relative h-full flex flex-col overflow-hidden card card-hover"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink-100">
                <img
                  src={r.image}
                  alt={`${r.name} — ${r.result}`}
                  loading="lazy"
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute left-4 top-4">
                  <ResultBadge label={r.result} />
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <NameRow name={r.name} meta={r.meta} />
                  <Stars />
                </div>
                <blockquote className="mt-3 flex-1 text-ink-800 text-[14.5px] sm:text-[15px] leading-relaxed text-pretty">
                  {r.story}
                </blockquote>
                <StatTiles stats={r.stats} />
              </div>
            </motion.figure>
          ))}
        </motion.div>

        {/* ── Video testimonials ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT_ONCE}
          className="mt-12 sm:mt-14 flex items-center justify-center gap-3"
        >
          <span aria-hidden className="h-px w-8 sm:w-12 bg-brand-200" />
          <span className="inline-flex items-center gap-2 text-[12px] sm:text-[13px] uppercase tracking-[0.18em] font-bold text-brand-700">
            <PlayCircle className="w-4 h-4" />
            Watch their stories
          </span>
          <span aria-hidden className="h-px w-8 sm:w-12 bg-brand-200" />
        </motion.div>

        <motion.div
          variants={stagger(0.08, 0.08)}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT_ONCE}
          className={cn(
            'mt-8 grid grid-cols-1 gap-5 sm:gap-6 items-stretch',
            // A single video would otherwise leave half the row empty.
            videoReviews.length > 1
              ? 'md:grid-cols-2'
              : 'mx-auto max-w-xl md:max-w-2xl',
          )}
        >
          {videoReviews.map((r) => (
            <motion.figure
              key={r.name}
              variants={fadeUp}
              className="group relative h-full flex flex-col overflow-hidden card"
            >
              <div className="relative">
                <VideoPlayer src={r.video} poster={r.poster} name={r.name} />
                <span className="pointer-events-none absolute left-4 top-4 z-10">
                  <ResultBadge label={r.result} />
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <NameRow name={r.name} meta={r.meta} />
                  <Stars />
                </div>
                <blockquote className="mt-3 flex-1 text-ink-800 text-[14.5px] sm:text-[15px] leading-relaxed text-pretty">
                  {r.story}
                </blockquote>
                <StatTiles stats={r.stats} />
              </div>
            </motion.figure>
          ))}
        </motion.div>

        {/* ── CTA block #3 of 6 ── */}
        <div className="mt-12 sm:mt-14">
          <CtaBlock />
        </div>
      </Container>
    </section>
  )
}

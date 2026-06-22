import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { BadgeCheck, Play, PlayCircle, Star } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { fadeUp, stagger, VIEWPORT_ONCE } from '@/lib/motion'

interface ImageReview {
  name: string
  image: string
  result: string
  story: string
}

interface VideoReview {
  name: string
  video: string
  poster: string
  result: string
  story: string
}

const imageReviews: ImageReview[] = [
  {
    name: 'Shachi',
    image: '/images/shachi.jpg',
    result: '75.55 → 62.6 kg',
    story:
      "After pregnancy, Shachi struggled with postpartum weight retention, thyroid issues, and hair fall while breastfeeding. With Suvidhi Mam's personalized guidance, she safely reduced her weight from 75.55 kg to 62.6 kg, normalized her thyroid reports, and stopped her hair fall — all without compromising her energy levels or breastfeeding journey.",
  },
  {
    name: 'Samia Nehal',
    image: '/images/samia-nehal.jpg',
    result: 'Sustainable weight loss',
    story:
      'Samia Nehal achieved sustainable weight loss, higher energy levels, and improved overall health through a personalized nutrition plan designed around her lifestyle and preferences — including customized guidance during Ramadan. With consistent support from Suvidhi Mam and the Innohealth team, she developed healthier habits and achieved long-term results without restrictive dieting.',
  },
]

const videoReviews: VideoReview[] = [
  {
    name: 'Subhuti',
    video: '/images/subhuti.mp4',
    poster: '/images/subhuti-thumb.webp',
    result: '84 → 75 kg',
    story:
      "After pregnancy, Subhuti struggled with low energy, hair fall, inflammation, and postpartum weight gain while preparing to return to work after maternity leave. With Suvidhi Mam's guidance, she reduced her weight from 84 kg to 75 kg, regained her energy, resolved her hair fall, and significantly reduced inflammation — feeling healthier, stronger and more confident.",
  },
  {
    name: 'Awantika',
    video: '/images/awantika.mp4',
    poster: '/images/awantika-thumb.webp',
    result: 'Conceived a healthy baby',
    story:
      "After fertility challenges and over two years of treatment without success, Awantika began a clinical nutrition plan under Dt. Suvidhi Pandey's guidance. With personalized support and a focused health approach, she successfully conceived and is now blessed with a healthy baby boy — a testament to the role of nutrition and lifestyle in reproductive health.",
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

export function Testimonials() {
  return (
    <section className="relative section-pad">
      <Container>
        <SectionHeading
          title={
            <>
              Real mothers.{' '}
              <span className="grad-text">Real recoveries.</span>
            </>
          }
          subtitle="A few of the 1000+ women who turned postpartum recovery into their strongest chapter. This could be your story too."
        />

        {/* Rating pill */}
        <div className="mt-9 flex justify-center">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white border border-brand-200/40 shadow-soft">
            <Stars />
            <span className="text-sm text-ink-700">
              <span className="font-semibold text-ink-950">4.9/5</span> · based on{' '}
              <span className="font-semibold">1000+</span> mothers
            </span>
          </div>
        </div>

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
                <Stars />
                <blockquote className="mt-3 flex-1 text-ink-800 text-[14.5px] sm:text-[15px] leading-relaxed text-pretty">
                  {r.story}
                </blockquote>
                <figcaption className="mt-4 flex items-center justify-between gap-3 border-t border-brand-100/70 pt-4">
                  <span className="font-semibold text-ink-950">{r.name}</span>
                  <span className="inline-flex items-center gap-1 text-brand-700 text-[12.5px] font-semibold">
                    <BadgeCheck className="w-4 h-4" /> Verified
                  </span>
                </figcaption>
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
          className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 items-stretch"
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
                <Stars />
                <blockquote className="mt-3 flex-1 text-ink-800 text-[14.5px] sm:text-[15px] leading-relaxed text-pretty">
                  {r.story}
                </blockquote>
                <figcaption className="mt-4 flex items-center justify-between gap-3 border-t border-brand-100/70 pt-4">
                  <span className="font-semibold text-ink-950">{r.name}</span>
                  <span className="inline-flex items-center gap-1 text-brand-700 text-[12.5px] font-semibold">
                    <PlayCircle className="w-4 h-4" /> Video story
                  </span>
                </figcaption>
              </div>
            </motion.figure>
          ))}
        </motion.div>
      </Container>
    </section>
  )
}

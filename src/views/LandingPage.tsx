'use client'

import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Hero } from '@/components/sections/Hero'
import { StatBar } from '@/components/sections/StatBar'
import { TopMarquee } from '@/components/sections/TopMarquee'

// Below-the-fold sections are split out of the initial JS bundle. They render
// on the client once their chunk loads — none of them are part of the LCP, so
// deferring them trims initial JS execution / main-thread work without any
// visible change. Hero + the stat bar stay eager (they're at/near the top).
const ForYouIf = dynamic(() => import('@/components/sections/ForYouIf').then((m) => m.ForYouIf))
const Testimonials = dynamic(() => import('@/components/sections/Testimonials').then((m) => m.Testimonials))
const RecoveryCycle = dynamic(() => import('@/components/sections/RecoveryCycle').then((m) => m.RecoveryCycle))
const Clinician = dynamic(() => import('@/components/sections/Clinician').then((m) => m.Clinician))
const FourSystemCheck = dynamic(() => import('@/components/sections/FourSystemCheck').then((m) => m.FourSystemCheck))
const ProgrammeIncludes = dynamic(() => import('@/components/sections/ProgrammeIncludes').then((m) => m.ProgrammeIncludes))
const Guarantee = dynamic(() => import('@/components/sections/Guarantee').then((m) => m.Guarantee))
const FAQ = dynamic(() => import('@/components/sections/FAQ').then((m) => m.FAQ))
const Closing = dynamic(() => import('@/components/sections/Closing').then((m) => m.Closing))
const Footer = dynamic(() => import('@/components/sections/Footer').then((m) => m.Footer))
const StickyCTA = dynamic(() => import('@/components/sections/StickyCTA').then((m) => m.StickyCTA))

export default function LandingPage() {
  useEffect(() => {
    document.title =
      'Lose 5-15 Kilos & Reduce Mummy Belly · The 90-Day Postpartum Restore Programme'
  }, [])

  // Section order follows the dev spec, top to bottom:
  //   1 hero (+ hero graphic + CTA block)
  //   2 stat bar — the only place ₹97 appears
  //   3 "This Is For You If" (+ CTA block)
  //   4 results (+ CTA block)
  //     · the WhatsApp wall from the spec is deliberately NOT built — the
  //       existing testimonials stand in its place
  //   – "Left unaddressed…" — the spec's one OPTIONAL cut. Kept because it
  //     bridges the pain section straight into the named mechanism below it.
  //   6 meet Suvidhi (+ CTA block)
  //   7 the 4-System Postpartum Check
  //   8 what's included in the 90-day programme (+ CTA block)
  //   9 guarantee
  //  10 FAQ
  //  11 closing (+ CTA block)
  //  12 footer + legal disclaimer
  //
  // band-dark alternates so the dark/light rhythm holds.
  return (
    <div className="relative">
      <TopMarquee />
      {/* Alternating dark/light rhythm — `.band-dark` (see index.css) gives a
          section a deep brand background with inverted loose-text, while white
          cards keep their normal dark text so contrast stays safe. */}
      <main className="relative">
        <Hero />
        <StatBar />
        <div className="band-dark">
          <ForYouIf />
        </div>
        <Testimonials />
        <div className="band-dark">
          <RecoveryCycle />
        </div>
        <Clinician />
        <div className="band-dark">
          <FourSystemCheck />
        </div>
        <ProgrammeIncludes />
        <div className="band-dark">
          <Guarantee />
        </div>
        <FAQ />
        <div className="band-dark">
          <Closing />
        </div>
      </main>
      <Footer />
      <StickyCTA />
    </div>
  )
}

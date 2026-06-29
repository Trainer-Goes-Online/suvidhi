'use client'

import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Hero } from '@/components/sections/Hero'
import { SoundLikeYou } from '@/components/sections/SoundLikeYou'
import { TopMarquee } from '@/components/sections/TopMarquee'

// Below-the-fold sections are split out of the initial JS bundle. They render
// on the client once their chunk loads — none of them are part of the LCP, so
// deferring them trims initial JS execution / main-thread work without any
// visible change. Hero + the first band stay eager (they're at/near the top).
const RecoveryCycle = dynamic(() => import('@/components/sections/RecoveryCycle').then((m) => m.RecoveryCycle))
const Modules = dynamic(() => import('@/components/sections/Modules').then((m) => m.Modules))
const Testimonials = dynamic(() => import('@/components/sections/Testimonials').then((m) => m.Testimonials))
const ClarityCall = dynamic(() => import('@/components/sections/ClarityCall').then((m) => m.ClarityCall))
const ValueStack = dynamic(() => import('@/components/sections/ValueStack').then((m) => m.ValueStack))
const Guarantee = dynamic(() => import('@/components/sections/Guarantee').then((m) => m.Guarantee))
const Clinician = dynamic(() => import('@/components/sections/Clinician').then((m) => m.Clinician))
const FAQ = dynamic(() => import('@/components/sections/FAQ').then((m) => m.FAQ))
const Footer = dynamic(() => import('@/components/sections/Footer').then((m) => m.Footer))
const StickyCTA = dynamic(() => import('@/components/sections/StickyCTA').then((m) => m.StickyCTA))

export default function LandingPage() {
  useEffect(() => {
    document.title = 'Suvidhi — The Postpartum Restore™ · Find Out Why You Haven\'t Recovered'
  }, [])

  // Section order: hero → "does this sound like you" → testimonials slider →
  // the cycle + consequences ("Left unaddressed…") → 5 modules (stacking cards)
  // → what's included → value-stack recap → guarantee → clinician → FAQ.
  // band-dark alternates every other section so the dark/light rhythm holds.
  return (
    <div className="relative">
      {/* Scrolling trust marquee — same as the checkout / book-a-call / thank-you
          pages, so the landing page opens with it too. */}
      <TopMarquee />
      {/* Alternating dark/light rhythm — `.band-dark` (see index.css) gives a
          section a deep brand background with inverted loose-text, while white
          cards keep their normal dark text so contrast stays safe. */}
      <main className="relative">
        <Hero />
        <div className="band-dark">
          <SoundLikeYou />
        </div>
        {/* Testimonials moved up to sit directly under "Does this sound like
            you?". The rest of the order is unchanged (RecoveryCycle onward).
            band-dark flips on RecoveryCycle + Modules so the dark/light rhythm
            keeps strictly alternating after the move. */}
        <Testimonials />
        <div className="band-dark">
          <RecoveryCycle />
        </div>
        <Modules />
        <div className="band-dark">
          <ClarityCall />
        </div>
        <ValueStack />
        <div className="band-dark">
          <Guarantee />
        </div>
        <Clinician />
        <div className="band-dark">
          <FAQ />
        </div>
      </main>
      <Footer />
      <StickyCTA />
    </div>
  )
}

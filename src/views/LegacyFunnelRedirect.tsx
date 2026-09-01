'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { RouteFallback } from '@/components/ui/RouteFallback'
import { getFunnelState } from '@/lib/funnelState'
import { resolvePlan } from '@/lib/config'
import { utmQueryString } from '@/lib/utm'

/**
 * Back-compat shim for the retired `/book-a-call` and `/thank-you` routes.
 *
 * The funnel used to run checkout → /book-a-call → /thank-you around a ₹297
 * digital product. That product no longer exists, so both pages are gone; any
 * live link, bookmark or old confirmation email that still points at them lands
 * on the correct confirmation page for whatever the visitor actually bought
 * (falling back to the call-only page when there is no funnel state to read).
 */
export default function LegacyFunnelRedirect() {
  const router = useRouter()

  useEffect(() => {
    const stored = getFunnelState<{ plan?: string }>()
    const plan = resolvePlan(stored?.plan)
    const target = plan.id === 'bundle' ? '/confirmed-plus' : '/confirmed'
    router.replace(target + utmQueryString())
  }, [router])

  return <RouteFallback />
}

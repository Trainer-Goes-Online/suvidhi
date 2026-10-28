'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { RouteFallback } from '@/components/ui/RouteFallback'
import { captureUtm, utmQueryString } from '@/lib/utm'

/**
 * Back-compat shim for the retired `/oto` and `/checkout` routes.
 *
 * Both steps were folded into /register when the Roadmap Call became free.
 * Any live ad, bookmark or old email still pointing at them lands on the new
 * form; a `plan=bundle` link arrives with the VIP upgrade already ticked.
 */
export default function RegisterRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Save any UTMs on the old URL before rebuilding the query string.
    captureUtm()
    const vip = searchParams?.get('plan') === 'bundle'
    router.replace('/register' + utmQueryString(vip ? { vip: '1' } : {}))
  }, [router, searchParams])

  return <RouteFallback />
}

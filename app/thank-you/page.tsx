'use client'

import dynamic from 'next/dynamic'
import { RouteFallback } from '@/components/ui/RouteFallback'

const ThankYouPage = dynamic(() => import('@/views/ThankYouPage'), {
  ssr: false,
  loading: () => <RouteFallback />,
})

/**
 * Post-booking bridge. Reached from /confirmed and /confirmed-plus once
 * Calendly reports the slot is scheduled.
 */
export default function Page() {
  return <ThankYouPage />
}

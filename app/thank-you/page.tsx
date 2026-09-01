'use client'

import dynamic from 'next/dynamic'
import { RouteFallback } from '@/components/ui/RouteFallback'

const LegacyFunnelRedirect = dynamic(() => import('@/views/LegacyFunnelRedirect'), {
  ssr: false,
  loading: () => <RouteFallback />,
})

// Retired route — see src/views/LegacyFunnelRedirect.tsx.
export default function Page() {
  return <LegacyFunnelRedirect />
}

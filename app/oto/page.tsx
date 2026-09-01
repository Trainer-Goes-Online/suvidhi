'use client'

import dynamic from 'next/dynamic'
import { RouteFallback } from '@/components/ui/RouteFallback'

const OtoPage = dynamic(() => import('@/views/OtoPage'), {
  ssr: false,
  loading: () => <RouteFallback />,
})

export default function Page() {
  return <OtoPage />
}

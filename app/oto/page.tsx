'use client'

import dynamic from 'next/dynamic'
import { RouteFallback } from '@/components/ui/RouteFallback'

const RegisterRedirect = dynamic(() => import('@/views/RegisterRedirect'), {
  ssr: false,
  loading: () => <RouteFallback />,
})

// Retired route — folded into /register. See src/views/RegisterRedirect.tsx.
export default function Page() {
  return <RegisterRedirect />
}

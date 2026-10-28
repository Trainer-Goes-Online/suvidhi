'use client'

import dynamic from 'next/dynamic'
import { RouteFallback } from '@/components/ui/RouteFallback'

const RegisterPage = dynamic(() => import('@/views/RegisterPage'), {
  ssr: false,
  loading: () => <RouteFallback />,
})

export default function Page() {
  return <RegisterPage />
}

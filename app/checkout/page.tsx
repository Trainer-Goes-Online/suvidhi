'use client'

import dynamic from 'next/dynamic'
import { RouteFallback } from '@/components/ui/RouteFallback'

const CheckoutPage = dynamic(() => import('@/views/CheckoutPage'), {
  ssr: false,
  loading: () => <RouteFallback />,
})

export default function Page() {
  return <CheckoutPage />
}

'use client'

import dynamic from 'next/dynamic'
import { RouteFallback } from '@/components/ui/RouteFallback'

const ConfirmedPage = dynamic(() => import('@/views/ConfirmedPage'), {
  ssr: false,
  loading: () => <RouteFallback />,
})

/** Confirmation for the free call registration — one step: book the slot. */
export default function Page() {
  return <ConfirmedPage plan="call" />
}

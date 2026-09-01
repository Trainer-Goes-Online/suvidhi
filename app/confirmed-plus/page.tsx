'use client'

import dynamic from 'next/dynamic'
import { RouteFallback } from '@/components/ui/RouteFallback'

const ConfirmedPage = dynamic(() => import('@/views/ConfirmedPage'), {
  ssr: false,
  loading: () => <RouteFallback />,
})

/**
 * Confirmation for the call + video library bundle — three steps: book the
 * slot, join the WhatsApp community, then collect the course credentials.
 */
export default function Page() {
  return <ConfirmedPage plan="bundle" />
}

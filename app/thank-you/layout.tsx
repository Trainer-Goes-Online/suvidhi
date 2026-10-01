import type { Metadata } from 'next'
import { BRAND, NAMING } from '@/lib/config'

/**
 * Route-level metadata for the post-booking bridge.
 *
 * The page itself is a client component loaded with `ssr: false`, so a
 * `document.title` assignment in an effect is applied and then overwritten by
 * Next's own metadata handling during hydration. Exporting metadata from the
 * segment is the one place that actually wins — and it sets the tab title in
 * the initial HTML rather than a frame later.
 *
 * `noindex` because this page is only ever reached after a booking; it has no
 * business appearing in search results.
 */
export const metadata: Metadata = {
  title: `WAIT! Confirm your ${NAMING.call} · ${BRAND.name}`,
  description: `Your ${NAMING.call} is not confirmed yet. Message us on WhatsApp to get the next steps.`,
  robots: { index: false, follow: false },
}

export default function ThankYouLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { Sora, Inter_Tight, Pacifico } from 'next/font/google'
import '@/index.css'
import { Analytics } from './Analytics'
import { NAMING, PLANS } from '@/lib/config'

// Self-hosted via next/font — eliminates the render-blocking Google Fonts
// stylesheet (and its two preconnects). Each family is exposed as a CSS
// variable that index.css / tailwind reference. display:swap paints fallback
// text immediately so the font never blocks FCP/LCP.
const sora = Sora({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-sora',
})

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter-tight',
})

const pacifico = Pacifico({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-pacifico',
})

export const metadata: Metadata = {
  title:
    'Lose 5-15 Kilos & Reduce Mummy Belly · The 90-Day Postpartum Restore Programme',
  // Price + mechanism names come from config so the SEO description can never
  // drift from what the page itself renders.
  description: `Book a ${PLANS.call.priceLabel} ${NAMING.call} with ${NAMING.clinician}, a UK-trained ${NAMING.clinicianTitle}. In 30 minutes she runs ${NAMING.mechanism} against your own reports and tells you which of the four reasons your body is still stuck applies to you.`,
  openGraph: {
    title: 'Lose 5-15 Kilos & Reduce Mummy Belly · Suvidhi Pandey',
    description:
      'Your reports came back normal and you still don’t feel normal. In 30 minutes, find out which of the four systems is keeping your postpartum recovery stuck.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#CB4A5D',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sora.variable} ${interTight.variable} ${pacifico.variable}`}>
      <head>
        {/* Preconnect only to the origins that fire on initial load (analytics
            scripts below). Razorpay / Calendly are connected on their own
            pages. Lighthouse flags >4 preconnects, so keep this list tight. */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.clarity.ms" />
        <link rel="preconnect" href="https://connect.facebook.net" />
      </head>
      <body className="bg-cream text-ink-900 antialiased">
        <noscript>
          <p style={{ fontFamily: 'system-ui', padding: 24, maxWidth: 480, margin: '0 auto' }}>
            Suvidhi runs on a modern browser with JavaScript enabled. Please enable
            JavaScript and reload, or email us at innohealthbysush@gmail.com.
          </p>
        </noscript>
        <Analytics />
        {children}

        {/* Microsoft Clarity — session/heatmap analytics (project vi86v72ho2).
            lazyOnload defers it until the browser is idle so it never competes
            with the critical render path or inflates TBT. */}
        <Script id="ms-clarity" strategy="lazyOnload">
          {`(function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "vi86v72ho2");`}
        </Script>

        {/* Google Analytics 4 — gtag.js (G-Q1RHVTJQJ7) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-Q1RHVTJQJ7"
          strategy="lazyOnload"
        />
        <Script id="ga4-gtag" strategy="lazyOnload">
          {`window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-Q1RHVTJQJ7');`}
        </Script>
      </body>
    </html>
  )
}

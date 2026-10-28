import { useEffect } from 'react'
import { ShieldCheck, Mail, Phone, MapPin } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { TopMarquee } from '@/components/sections/TopMarquee'
import { Footer } from '@/components/sections/Footer'
import { PolicyHeader } from '@/components/sections/PolicyHeader'
import { PLANS } from '@/lib/config'

export default function RefundPage() {
  useEffect(() => {
    document.title = 'Refund Policy · Suvidhi'
  }, [])

  return (
    <div className="relative min-h-screen flex flex-col">
      <TopMarquee />

      <main className="relative flex-1 pb-16 sm:pb-20">
        <PolicyHeader
          eyebrow="Legal · Refund Policy"
          title="Refund Policy"
          subtitle={`We'd rather give back ${PLANS.call.priceLabel} than waste your time. This page explains exactly when and how refunds are processed.`}
          lastUpdated="February 2026"
        />

        <Container size="narrow">
          <article className="prose-policy bg-white border border-ink-100 shadow-soft rounded-3xl p-6 sm:p-9 lg:p-11">
            {/* Highlight box */}
            <div className="not-prose mb-8 rounded-2xl surface-tint border border-brand-200/60 p-5 flex items-start gap-3">
              <ShieldCheck
                className="w-5 h-5 text-brand-700 mt-0.5 shrink-0"
                strokeWidth={2}
              />
              <p className="text-ink-800 text-[15px] leading-relaxed m-0">
                <strong className="text-ink-950">Our promise:</strong> If you attend
                the Roadmap Call and feel it didn't give you meaningful insight into
                your sugar patterns, write to us and we'll refund your{' '}
                {PLANS.call.priceLabel} in full. No arguments, no pressure.
              </p>
            </div>

            <h2>1. Cancellation Policy</h2>
            <p>
              You may cancel a scheduled consultation or programme any time{' '}
              <strong>before</strong> the session begins. Once a programme such as the
              7-Day Sugar Reset has started — i.e. once Suvidhi has reviewed your
              reports and committed clinical time to your case — the booking fee may
              no longer be eligible for refund, as it has already covered preparation
              and assessment.
            </p>
            <p>
              To request a cancellation, please reach our team at{' '}
              <a href="tel:+919810880970">+91 98108 80970</a> or write to{' '}
              <a href="mailto:innohealthbysush@gmail.com">innohealthbysush@gmail.com</a>
              .
            </p>

            <h2>2. Refund Eligibility — Roadmap Call ({PLANS.call.priceLabel})</h2>
            <p>
              You are eligible for a full refund of the {PLANS.call.priceLabel} Roadmap Call
              fee if:
            </p>
            <ul>
              <li>
                You attend the scheduled session in good faith and genuinely feel it
                did not deliver meaningful clinical insight into your sugar pattern.
              </li>
              <li>
                You raise the request within <strong>48 hours</strong> of completing
                the call.
              </li>
              <li>
                You filled the pre-call form honestly and completely before the
                session.
              </li>
            </ul>
            <p>
              We do not require you to justify the outcome — your honest feedback is
              enough.
            </p>

            <h2>3. Refund Eligibility — Programmes</h2>
            <p>
              For longer programmes, refunds are assessed on the basis of{' '}
              <strong>protocol adherence</strong> rather than guaranteed medical
              outcomes. If you have followed the prescribed protocol without observing
              the documented indicators of progress, or if the service was not
              delivered as described, you may request a refund. Eligibility decisions
              are made fairly and individually.
            </p>

            <h2>4. Processing Timeline</h2>
            <p>
              Once your refund is approved, the amount will be credited back to your
              original payment method within{' '}
              <strong>5–7 business days</strong>. Depending on your bank or card
              issuer, the credit may take an additional 2-3 days to appear on your
              statement.
            </p>
            <p>
              If the refund has not reached you within{' '}
              <strong>7–10 business days</strong>, please first check with your bank
              or card issuer using the reference ID we share with you. If the issue
              persists after that, write to us and we'll personally chase it down.
            </p>

            <h2>5. Non-Refundable Items</h2>
            <p>The following are not eligible for refund:</p>
            <ul>
              <li>
                Sessions or programmes where the pre-call form was filled
                dishonestly, or key health information was withheld.
              </li>
              <li>
                Bookings cancelled by us due to a violation of our Terms &amp;
                Conditions.
              </li>
              <li>
                Programmes where you have already received the bulk of the deliverables
                — for example, you've completed the assessment and received your
                personalised plan.
              </li>
            </ul>

            <h2>6. How to Request a Refund</h2>
            <p>Send us an email at the address below with:</p>
            <ul>
              <li>Your full name and registered phone number</li>
              <li>Order ID or transaction reference</li>
              <li>A short note on why the call/programme didn't work for you</li>
            </ul>
            <p>We'll respond within one working day.</p>

            <h2>7. Contact Us</h2>
            <div className="not-prose grid sm:grid-cols-3 gap-3 mt-3">
              <a
                href="mailto:innohealthbysush@gmail.com"
                className="group rounded-2xl border border-ink-100 bg-white p-4 hover:border-brand-200 hover:shadow-soft transition-all"
              >
                <Mail className="w-4 h-4 text-brand-600" />
                <div className="text-[11px] uppercase tracking-[0.18em] font-semibold text-ink-500 mt-2">
                  Email
                </div>
                <div className="text-sm font-semibold text-ink-950 break-all group-hover:text-brand-700 transition-colors">
                  innohealthbysush@gmail.com
                </div>
              </a>
              <a
                href="tel:+919810880970"
                className="group rounded-2xl border border-ink-100 bg-white p-4 hover:border-brand-200 hover:shadow-soft transition-all"
              >
                <Phone className="w-4 h-4 text-brand-600" />
                <div className="text-[11px] uppercase tracking-[0.18em] font-semibold text-ink-500 mt-2">
                  Phone
                </div>
                <div className="text-sm font-semibold text-ink-950 group-hover:text-brand-700 transition-colors">
                  +91 98108 80970
                </div>
              </a>
              <div className="rounded-2xl border border-ink-100 bg-white p-4">
                <MapPin className="w-4 h-4 text-brand-600" />
                <div className="text-[11px] uppercase tracking-[0.18em] font-semibold text-ink-500 mt-2">
                  Address
                </div>
                <div className="text-sm font-semibold text-ink-950 leading-snug">
                  A-60, Ground Floor,
                  <br /> Sector 108, Noida
                </div>
              </div>
            </div>
          </article>
        </Container>
      </main>

      <Footer />
    </div>
  )
}

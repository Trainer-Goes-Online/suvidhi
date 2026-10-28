import { useEffect } from 'react'
import { Container } from '@/components/ui/Container'
import { TopMarquee } from '@/components/sections/TopMarquee'
import { Footer } from '@/components/sections/Footer'
import { PolicyHeader } from '@/components/sections/PolicyHeader'

export default function TermsPage() {
  useEffect(() => {
    document.title = 'Terms & Conditions · Suvidhi'
  }, [])

  return (
    <div className="relative min-h-screen flex flex-col">
      <TopMarquee />

      <main className="relative flex-1 pb-16 sm:pb-20">
        <PolicyHeader
          eyebrow="Legal · Terms & Conditions"
          title="Terms & Conditions"
          subtitle="These terms govern your use of suvidhi.innohealth.co.in and the services we offer through it. By accessing the site or purchasing from us, you agree to them."
          lastUpdated="February 2026"
        />

        <Container size="narrow">
          <article className="prose-policy bg-white border border-ink-100 shadow-soft rounded-3xl p-6 sm:p-9 lg:p-11">
            <h2>1. Introduction</h2>
            <p>
              Welcome to <strong>Suvidhi</strong>, operated by{' '}
              <strong>innohealth.co.in</strong>. By visiting our website, creating an
              account, booking a consultation, or purchasing any service, you confirm
              that you have read, understood, and agreed to be bound by these Terms &
              Conditions and our associated policies. If you do not agree with any part
              of these terms, please do not use the site or our services.
            </p>

            <h2>2. Use of Services</h2>
            <p>
              You agree to use the website and our consultations only for lawful
              purposes. When you complete any booking, pre-call form, or payment, you
              are required to share information that is accurate, current, and complete
              to the best of your knowledge.
            </p>
            <p>
              We reserve the right, at our sole discretion, to refuse, restrict, or
              cancel any order, booking, or session where we reasonably suspect fraud,
              misrepresentation, abuse, or violation of these terms — with or without
              prior notice. In such cases, your sole remedy is governed by our refund
              policy.
            </p>

            <h2>3. Nature of Service</h2>
            <p>
              The Clarity Call and any educational sessions you book through Suvidhi
              are <strong>clinical-nutrition consultations</strong> — they are
              educational in nature and do not constitute medical advice, diagnosis, or
              a replacement for treatment by a licensed physician. Continue all
              prescribed medications and follow your treating doctor's guidance. Any
              change to medication must be made by your doctor.
            </p>

            <h2>4. Pricing and Payments</h2>
            <p>
              All prices are listed in Indian Rupees (INR) and are inclusive of
              applicable taxes unless explicitly stated otherwise. We may revise
              pricing, discounts, or promotional offers at any time without prior
              notice; the price applicable to your order is the price displayed at the
              time you complete checkout.
            </p>
            <p>
              Payments are processed through secure third-party payment gateways. We
              do not store complete card details on our servers — your payment
              instrument is tokenised and handled by PCI-DSS compliant processors.
            </p>

            <h2>5. Intellectual Property</h2>
            <p>
              All content on this website — including but not limited to text,
              graphics, illustrations, photographs, logos, branding, the Suvidhi name,
              clinical frameworks, audio, video, and downloadable assets — is the
              property of <strong>innohealth.co.in</strong> and is protected by
              applicable copyright, trademark, and intellectual-property laws.
            </p>
            <p>
              You may not copy, reproduce, republish, distribute, modify, or create
              derivative works from any part of the website or programme materials
              without our prior written permission.
            </p>

            <h2>6. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, our total liability for any
              claim arising out of or in connection with your use of the website,
              services, or programme materials is limited to the amount you actually
              paid us for the specific order or session giving rise to the claim.
            </p>
            <p>
              We shall not be liable for any indirect, incidental, special,
              consequential, or punitive damages — including but not limited to loss
              of profits, data, goodwill, or other intangible losses — even if we have
              been advised of the possibility of such damages.
            </p>

            <h2>7. Modifications</h2>
            <p>
              We may revise these Terms & Conditions from time to time. The most
              current version will always be posted on this page with a refreshed "Last
              updated" date. Your continued use of the site after any change
              constitutes your acceptance of the revised terms.
            </p>

            <h2>8. Governing Law & Jurisdiction</h2>
            <p>
              These terms are governed by and construed in accordance with the laws of
              India. Any dispute, claim, or matter arising out of or in connection with
              these terms shall be subject to the <strong>exclusive jurisdiction of
              the courts in Chennai, India</strong>.
            </p>

            <h2>9. Contact Us</h2>
            <p>
              For any clarification, support request, or policy question, please write
              to us at{' '}
              <a href="mailto:innohealthbysush@gmail.com">
                innohealthbysush@gmail.com
              </a>{' '}
              or call <a href="tel:+919810880970">+91 98108 80970</a>. We aim to respond
              within one working day.
            </p>
          </article>
        </Container>
      </main>

      <Footer />
    </div>
  )
}

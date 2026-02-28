import type { Metadata } from 'next';

import { LandingFooter } from '@/components/sections/LandingFooter';
import { LandingHeader } from '@/components/sections/LandingHeader';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.garixo.com'),
  title: 'Terms of Services | GARIXO',
  description:
    'Read GARIXO Terms of Services for global users, including key terms relevant for the United States market.',
  alternates: {
    canonical: '/term-of-services'
  },
  robots: {
    index: true,
    follow: true
  }
};

const lastUpdated = 'February 24, 2026';

export default function TermsOfServicesPage(): JSX.Element {
  return (
    <>
      <LandingHeader />
      <main className="bg-surface-default">
        <section className="border-b border-border bg-background-primary py-s12">
          <div className="mx-auto w-full max-w-[1000px] px-s4">
            <h1 className="text-[34px] font-bold text-text-primary md:text-[46px]">
              Terms of Services
            </h1>
            <p className="mt-s2 text-small text-text-secondary">
              Last updated: {lastUpdated}
            </p>
            <p className="mt-s4 max-w-[840px] text-body text-text-secondary">
              These Terms of Services govern your access to and use of GARIXO.
              By using GARIXO, you agree to these terms. If you do not agree,
              you should stop using the service.
            </p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1000px] space-y-s8 px-s4 py-s12">
          <article className="space-y-s2">
            <h2 className="text-h2">1. Service Overview</h2>
            <p className="text-small text-text-secondary">
              GARIXO is a garage management software platform for auto repair
              businesses. We provide tools for work orders, customer records,
              inventory, technician workflows, and reporting.
            </p>
          </article>

          <article className="space-y-s2">
            <h2 className="text-h2">2. Eligibility and Accounts</h2>
            <p className="text-small text-text-secondary">
              You must provide accurate account information and keep your
              credentials secure. You are responsible for all activity under
              your account.
            </p>
          </article>

          <article className="space-y-s2">
            <h2 className="text-h2">3. Subscription and Payments</h2>
            <p className="text-small text-text-secondary">
              Paid plans are billed according to your selected subscription.
              Fees are non-refundable except where required by law. If payment
              fails, GARIXO may suspend or limit access until payment is
              completed.
            </p>
          </article>

          <article className="space-y-s2">
            <h2 className="text-h2">4. Acceptable Use</h2>
            <p className="text-small text-text-secondary">You agree not to:</p>
            <ul className="list-disc space-y-s1 pl-s6 text-small text-text-secondary">
              <li>Use GARIXO for unlawful activity.</li>
              <li>Attempt to access systems or data without authorization.</li>
              <li>
                Upload malicious code or interfere with platform stability.
              </li>
              <li>
                Reverse engineer or copy GARIXO services without permission.
              </li>
            </ul>
          </article>

          <article className="space-y-s2">
            <h2 className="text-h2">5. Customer Data</h2>
            <p className="text-small text-text-secondary">
              You retain ownership of your business data. You grant GARIXO
              permission to process your data only to provide and improve the
              service. Data handling details are explained in our Privacy
              Policy.
            </p>
          </article>

          <article className="space-y-s2">
            <h2 className="text-h2">6. Intellectual Property</h2>
            <p className="text-small text-text-secondary">
              GARIXO and related software, branding, and content are owned by
              GARIXO and protected by applicable intellectual property laws.
            </p>
          </article>

          <article className="space-y-s2">
            <h2 className="text-h2">7. Service Availability</h2>
            <p className="text-small text-text-secondary">
              We work to keep GARIXO available and secure but do not guarantee
              uninterrupted service. Planned maintenance, updates, or
              third-party outages may affect availability.
            </p>
          </article>

          <article className="space-y-s2">
            <h2 className="text-h2">
              8. Disclaimer and Limitation of Liability
            </h2>
            <p className="text-small text-text-secondary">
              GARIXO is provided on an “as is” and “as available” basis. To the
              maximum extent allowed by law, GARIXO is not liable for indirect,
              incidental, special, or consequential damages.
            </p>
          </article>

          <article className="space-y-s2">
            <h2 className="text-h2">9. U.S. Market Terms</h2>
            <p className="text-small text-text-secondary">
              For customers in the United States, these terms are interpreted
              under applicable U.S. federal and state laws. Any mandatory
              consumer rights under U.S. law remain in effect.
            </p>
          </article>

          <article className="space-y-s2">
            <h2 className="text-h2">10. Termination</h2>
            <p className="text-small text-text-secondary">
              You may stop using GARIXO at any time. GARIXO may suspend or
              terminate access if these terms are violated or if required for
              legal or security reasons.
            </p>
          </article>

          <article className="space-y-s2">
            <h2 className="text-h2">11. Changes to Terms</h2>
            <p className="text-small text-text-secondary">
              We may update these Terms of Services. If changes are material, we
              will post the updated date and may provide additional notice.
            </p>
          </article>

          <article className="space-y-s2">
            <h2 className="text-h2">12. Contact</h2>
            <p className="text-small text-text-secondary">
              Questions about these terms can be sent to{' '}
              <a
                href="mailto:support@garixo.com"
                className="font-medium text-primary-700 hover:text-primary-800"
              >
                support@garixo.com
              </a>
              .
            </p>
          </article>
        </section>
      </main>
      <LandingFooter />
    </>
  );
}

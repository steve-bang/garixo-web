import type { Metadata } from 'next';

import { LandingFooter } from '@/components/sections/LandingFooter';
import { LandingHeader } from '@/components/sections/LandingHeader';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.garixo.com'),
  title: 'Privacy Policy | GARIXO',
  description:
    'Read how GARIXO collects, uses, and protects personal data for garage management software users.',
  alternates: {
    canonical: '/privacy-policy'
  },
  robots: {
    index: true,
    follow: true
  }
};

const lastUpdated = 'February 24, 2026';

export default function PrivacyPolicyPage(): JSX.Element {
  return (
    <>
      <LandingHeader />
      <main className="bg-surface-default">
        <section className="border-b border-border bg-background-primary py-s12">
          <div className="mx-auto w-full max-w-[1000px] px-s4">
            <h1 className="text-[34px] font-bold text-text-primary md:text-[46px]">
              Privacy Policy
            </h1>
            <p className="mt-s2 text-small text-text-secondary">
              Last updated: {lastUpdated}
            </p>
            <p className="mt-s4 max-w-[800px] text-body text-text-secondary">
              GARIXO values your privacy. This Privacy Policy explains how we
              collect, use, and protect your information when you use our garage
              management software.
            </p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1000px] space-y-s8 px-s4 py-s12">
          <article className="space-y-s2">
            <h2 className="text-h2">1. Information We Collect</h2>
            <p className="text-small text-text-secondary">
              We may collect the following information:
            </p>
            <ul className="list-disc space-y-s1 pl-s6 text-small text-text-secondary">
              <li>Account details such as name, email, and business name.</li>
              <li>
                Garage operation data such as work orders, customers, vehicles,
                services, and inventory records.
              </li>
              <li>
                Technical information such as device type, browser type, and log
                data.
              </li>
            </ul>
          </article>

          <article className="space-y-s2">
            <h2 className="text-h2">2. How We Use Information</h2>
            <p className="text-small text-text-secondary">
              We use your information to:
            </p>
            <ul className="list-disc space-y-s1 pl-s6 text-small text-text-secondary">
              <li>Provide and improve GARIXO services.</li>
              <li>Support daily shop operations and reporting.</li>
              <li>Maintain security, detect abuse, and prevent fraud.</li>
              <li>Communicate important updates and service notices.</li>
            </ul>
          </article>

          <article className="space-y-s2">
            <h2 className="text-h2">3. Data Sharing</h2>
            <p className="text-small text-text-secondary">
              We do not sell your personal data. We may share data only with
              trusted service providers that help us run GARIXO, and only as
              required to deliver the service.
            </p>
          </article>

          <article className="space-y-s2">
            <h2 className="text-h2">4. Data Security</h2>
            <p className="text-small text-text-secondary">
              We apply technical and organizational safeguards to protect your
              data. While no system is 100% risk-free, we continuously improve
              our security controls.
            </p>
          </article>

          <article className="space-y-s2">
            <h2 className="text-h2">5. Data Retention</h2>
            <p className="text-small text-text-secondary">
              We retain data while your account is active and as needed for
              legal, accounting, and operational purposes. You may request
              deletion subject to legal obligations.
            </p>
          </article>

          <article className="space-y-s2">
            <h2 className="text-h2">6. Your Rights</h2>
            <p className="text-small text-text-secondary">
              Depending on your location, you may have rights to:
            </p>
            <ul className="list-disc space-y-s1 pl-s6 text-small text-text-secondary">
              <li>Access the personal data we hold about you.</li>
              <li>Request correction of inaccurate data.</li>
              <li>Request deletion of your personal data.</li>
              <li>Object to or limit certain data processing.</li>
            </ul>
          </article>

          <article className="space-y-s2">
            <h2 className="text-h2">7. Cookies and Analytics</h2>
            <p className="text-small text-text-secondary">
              We may use cookies and similar technologies to improve
              performance, remember preferences, and understand how users
              interact with our product.
            </p>
          </article>

          <article className="space-y-s2">
            <h2 className="text-h2">8. Changes to This Policy</h2>
            <p className="text-small text-text-secondary">
              We may update this Privacy Policy from time to time. Material
              changes will be posted on this page with a new effective date.
            </p>
          </article>

          <article className="space-y-s2">
            <h2 className="text-h2">9. Contact Us</h2>
            <p className="text-small text-text-secondary">
              If you have questions about this Privacy Policy, please contact us
              at{' '}
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

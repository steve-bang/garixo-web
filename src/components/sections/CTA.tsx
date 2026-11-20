import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { landingFaqs } from '@/components/sections/landing-data';

export function CTA(): JSX.Element {
  return (
    <section className="bg-background-primary" aria-labelledby="cta-title">
      <div className="mx-auto w-full max-w-[1200px] space-y-s8 px-s4 py-s16">
        <Card className="space-y-s4 bg-primary-800 p-s8 text-center text-text-inverse shadow-md">
          <h2
            id="cta-title"
            className="text-[34px] font-semibold leading-tight text-text-inverse"
          >
            Ready to Take Control of Your Garage?
          </h2>
          <p className="text-body text-primary-100">
            Stop guessing. Start managing.
          </p>
          <div className="mx-auto max-w-[320px]">
            <Button
              asChild
              className="h-12 w-full bg-surface-default text-primary-800 hover:bg-primary-50"
            >
              <Link href="https://app.garixo.com/register">
                Start Free Trial
              </Link>
            </Button>
            <div className="mt-s2 text-center">
              <Link
                href="/pricing"
                className="text-small font-medium text-primary-100 underline-offset-2 hover:underline"
              >
                See Pricing Plans
              </Link>
            </div>
          </div>
        </Card>

        <div className="space-y-s4">
          <h2 className="text-h1">What is garage management software?</h2>
          <p className="max-w-[900px] text-body text-text-secondary">
            Garage management software gives owners one operational source of
            truth for jobs, technicians, inventory, and billing. It removes
            manual tracking and helps teams run faster with fewer mistakes.
          </p>
          <p className="text-small text-text-secondary">
            Industry context:{' '}
            <a
              href="https://www.ibisworld.com/"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="font-medium text-primary-700 hover:text-primary-800"
            >
              303,000 auto repair businesses in the US (IBISWorld 2026)
            </a>
            .
          </p>
        </div>

        <div className="space-y-s4" aria-labelledby="faq-title">
          <h2 id="faq-title" className="text-h1">
            Frequently Asked Questions
          </h2>
          <div className="space-y-s3">
            {landingFaqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-lg border border-border bg-surface-default p-s4"
              >
                <summary className="cursor-pointer list-none text-h3 text-text-primary">
                  <h3 className="inline text-h3">{faq.question}</h3>
                </summary>
                <p className="mt-s2 text-small leading-6 text-text-secondary">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

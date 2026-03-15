import Link from 'next/link';

import { Card } from '@/components/ui/card';

export function Trust(): JSX.Element {
  return (
    <section className="bg-surface-default" aria-labelledby="trust-title">
      <div className="mx-auto w-full max-w-[1200px] space-y-s6 px-s4 py-s16">
        <h2 id="trust-title" className="text-h1">
          Trusted by Growing Auto Repair Businesses
        </h2>

        <div
          className="grid gap-s3 sm:grid-cols-3"
          itemScope
          itemType="https://schema.org/Organization"
        >
          <Card className="p-s4 text-center shadow-xs">
            <p className="text-[36px] font-bold leading-none text-primary-700">
              1,200+
            </p>
            <p className="mt-s1 text-small text-text-secondary">
              vehicles managed monthly
            </p>
          </Card>
          <Card className="p-s4 text-center shadow-xs">
            <p className="text-[36px] font-bold leading-none text-success-700">
              98%
            </p>
            <p className="mt-s1 text-small text-text-secondary">
              user satisfaction
            </p>
          </Card>
          <Card className="p-s4 text-center shadow-xs">
            <p className="text-[36px] font-bold leading-none text-primary-700">
              30+
            </p>
            <p className="mt-s1 text-small text-text-secondary">
              countries using Garixo
            </p>
          </Card>
        </div>

        <Card className="space-y-s3 border border-border p-s6 shadow-sm">
          <blockquote
            className="text-body text-text-primary"
            itemProp="reviewBody"
          >
            Garixo helped us increase operational efficiency by 22% in 3 months.
          </blockquote>
          <p className="text-caption text-text-muted">
            Workshop owner testimonial
          </p>
        </Card>

        <p className="text-small text-text-secondary">
          See results in our{' '}
          <Link
            href="/case-studies"
            className="text-primary-700 hover:text-primary-800"
          >
            auto repair shop case studies
          </Link>
          .
        </p>
      </div>
    </section>
  );
}

import Link from 'next/link';

import { Card } from '@/components/ui/card';

const testimonials = [
  {
    initials: 'MT',
    name: 'Marcus T.',
    role: 'Owner · 4-bay general repair shop',
    location: 'Houston, TX',
    quote:
      'I used to finish the day not knowing if we made money. Now I check the dashboard at 5pm and I know exactly what came in. Took me one afternoon to set up.'
  },
  {
    initials: 'SR',
    name: 'Sandra R.',
    role: 'Owner · Tire & Wheel shop',
    location: 'Phoenix, AZ',
    quote:
      'My mechanics stopped asking me what to work on next — everything is on the board. We went from missing 3 or 4 jobs a week to zero. That alone paid for the software.'
  },
  {
    initials: 'JK',
    name: 'James K.',
    role: 'Mobile mechanic',
    location: 'Denver, CO',
    quote:
      "I run everything from my phone. I create the job at the customer's driveway, send the invoice right there. Customers love it and I get paid the same day."
  }
] as const;

export function Trust(): JSX.Element {
  return (
    <section className="bg-surface-default" aria-labelledby="trust-title">
      <div className="mx-auto w-full max-w-[1200px] space-y-s8 px-s4 py-s16">
        <div className="space-y-s2">
          <h2 id="trust-title" className="text-h1">
            Garage Owners Love It. Here&apos;s Why.
          </h2>
          <p className="max-w-[560px] text-body text-text-secondary">
            Real shops. Real results. No sales pitch.
          </p>
        </div>

        <div className="grid gap-s4 md:grid-cols-3">
          {testimonials.map((t) => (
            <Card
              key={t.name}
              className="p-s5 flex flex-col justify-between space-y-s4 border border-border shadow-sm"
              itemScope
              itemType="https://schema.org/Review"
            >
              {/* Stars */}
              <div
                className="flex gap-0.5"
                role="img"
                aria-label="5 out of 5 stars"
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    className="size-4 fill-amber-400 text-amber-400"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <blockquote
                className="flex-1 text-small leading-relaxed text-text-primary"
                itemProp="reviewBody"
              >
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-s3">
                <div
                  className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-100 text-caption font-bold text-primary-700"
                  aria-hidden="true"
                >
                  {t.initials}
                </div>
                <div>
                  <p
                    className="text-small font-semibold text-text-primary"
                    itemProp="author"
                  >
                    {t.name}
                  </p>
                  <p className="text-caption text-text-muted">{t.role}</p>
                  <p className="text-caption text-text-muted">{t.location}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div
          className="grid gap-s3 sm:grid-cols-3"
          itemScope
          itemType="https://schema.org/Organization"
        >
          <Card className="p-s4 text-center shadow-xs">
            <p className="text-[36px] font-bold leading-none text-primary-700">
              500+
            </p>
            <p className="mt-s1 text-small text-text-secondary">
              independent shops onboarded
            </p>
          </Card>
          <Card className="p-s4 text-center shadow-xs">
            <p className="text-[36px] font-bold leading-none text-success-700">
              1,200+
            </p>
            <p className="mt-s1 text-small text-text-secondary">
              vehicles managed every month
            </p>
          </Card>
          <Card className="p-s4 text-center shadow-xs">
            <p className="text-[36px] font-bold leading-none text-primary-700">
              14-day
            </p>
            <p className="mt-s1 text-small text-text-secondary">
              free trial, no card needed
            </p>
          </Card>
        </div>

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

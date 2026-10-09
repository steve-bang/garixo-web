import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function Hero(): JSX.Element {
  return (
    <section
      className="border-b border-border bg-background-primary"
      aria-labelledby="hero-title"
    >
      <div className="mx-auto grid w-full max-w-[1200px] gap-s8 px-s4 py-s16 lg:grid-cols-2 lg:items-center">
        <div className="space-y-s3">
          <p className="inline-flex items-center rounded-full border border-primary-100 bg-primary-50 px-s3 py-s1 text-caption font-semibold text-primary-700">
            Built for Independent Garage Owners
          </p>

          <h1
            id="hero-title"
            className="text-[38px] font-bold leading-[1.05] text-text-primary md:text-[56px]"
          >
            Run Your Garage. Know Your Money. Skip the Paperwork.
          </h1>

          <p className="max-w-[560px] text-body text-text-secondary">
            Garixo keeps every job, invoice, and part in one place — so you
            always know what&apos;s happening in your shop and what you made
            today.
          </p>

          <ul
            className="space-y-s2 text-small text-text-secondary"
            aria-label="Key benefits"
          >
            <li className="flex items-center gap-s2">
              <CheckCircle2 className="size-4 text-success-700" />
              See every car&apos;s status from check-in to pickup
            </li>
            <li className="flex items-center gap-s2">
              <CheckCircle2 className="size-4 text-success-700" />
              Know today&apos;s revenue before you close for the night
            </li>
            <li className="flex items-center gap-s2">
              <CheckCircle2 className="size-4 text-success-700" />
              Send invoices and collect payment in seconds
            </li>
          </ul>

          <div className="flex flex-col gap-s2 pt-s1 sm:flex-row">
            <Button asChild className="h-12 min-h-12">
              <Link href="https://app.garixo.com/register">
                Try Free for 14 Days
              </Link>
            </Button>
            <Button asChild variant="secondary" className="h-12 min-h-12">
              <Link href="/pricing">See Pricing</Link>
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-s2 text-caption text-text-muted">
            <span className="rounded-full bg-surface-hover px-s2 py-1">
              No credit card required
            </span>
            <span className="rounded-full bg-surface-hover px-s2 py-1">
              Set up in 3 minutes
            </span>
            <span className="rounded-full bg-surface-hover px-s2 py-1">
              500+ shops trust Garixo
            </span>
          </div>
        </div>

        <div className="relative">
          <Card className="rounded-xl border border-border bg-surface-default p-s3 shadow-md">
            <Image
              src="/images/home-hero-section.webp"
              alt="Global auto repair shop management software overview by Garixo"
              width={1280}
              height={853}
              fetchPriority="high"
              className="h-auto w-full rounded-lg"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </Card>

          <Card className="absolute -left-s2 -top-s2 hidden w-[180px] border border-border bg-surface-default p-s3 shadow-sm md:block">
            <p className="text-caption text-text-muted">Monthly Revenue</p>
            <p className="text-h3 text-success-700">+22%</p>
          </Card>

          <Card className="absolute -bottom-s2 -right-s2 hidden w-[180px] border border-border bg-surface-default p-s3 shadow-sm md:block">
            <p className="text-caption text-text-muted">Active Vehicles</p>
            <p className="text-h3 text-primary-700">48</p>
          </Card>
        </div>
      </div>
    </section>
  );
}

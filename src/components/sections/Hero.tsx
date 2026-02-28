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
            Garage Management Software
          </p>

          <h1
            id="hero-title"
            className="text-[38px] font-bold leading-[1.05] text-text-primary md:text-[56px]"
          >
            The All-in-One Garage Management Software for Auto Repair Shops
          </h1>

          <p className="max-w-[620px] text-small text-text-secondary">
            Garixo is a garage management software platform and auto repair shop
            management software built to run your full auto shop management
            system in one simple workspace.
          </p>

          <p className="max-w-[560px] text-caption text-text-secondary">
            Simple for non-technical owners. Clear job status, faster approvals,
            better daily cash control.
          </p>

          <ul
            className="space-y-s2 text-small text-text-secondary"
            aria-label="Key benefits"
          >
            <li className="flex items-center gap-s2">
              <CheckCircle2 className="size-4 text-success-700" />
              Track every vehicle from check-in to pickup
            </li>
            <li className="flex items-center gap-s2">
              <CheckCircle2 className="size-4 text-success-700" />
              See waiting approvals in seconds
            </li>
            <li className="flex items-center gap-s2">
              <CheckCircle2 className="size-4 text-success-700" />
              Know today&apos;s revenue before closing time
            </li>
          </ul>

          <div className="flex flex-col gap-s2 pt-s1 sm:flex-row">
            <Button asChild className="h-12 min-h-12">
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
            <Button asChild variant="secondary" className="h-12 min-h-12">
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-s2 text-caption text-text-muted">
            <span className="rounded-full bg-surface-hover px-s2 py-1">
              No credit card required
            </span>
            <span className="rounded-full bg-surface-hover px-s2 py-1">
              Setup in minutes
            </span>
            <span className="rounded-full bg-surface-hover px-s2 py-1">
              500+ shops onboarded
            </span>
          </div>
        </div>

        <div className="relative">
          <Card className="rounded-xl border border-border bg-surface-default p-s3 shadow-md">
            <Image
              src="/images/world-garage-command.svg"
              alt="Global auto repair shop management software overview by Garixo"
              width={1280}
              height={853}
              className="h-auto w-full rounded-lg"
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

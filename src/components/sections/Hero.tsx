import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export function Hero(): JSX.Element {
  return (
    <section className="border-b border-border bg-background-primary">
      <div className="mx-auto grid max-w-[1200px] gap-s8 px-s4 py-s16 lg:grid-cols-2 lg:items-center">
        <div className="space-y-s4">
          <h1 className="text-[48px] leading-[1.1] font-bold text-text-primary md:text-[56px]">
            Garage Management Software Built for Auto Repair Shop Owners
          </h1>
          <p className="max-w-[620px] text-body text-text-secondary">
            Garixo is a garage management software and auto repair shop management software that helps owners run a modern
            auto shop management system. It also delivers reliable workshop management software workflows and automotive repair
            management software visibility for teams that need daily control. Manage vehicles, technicians, inventory and daily
            profit in one simple system. No spreadsheets. No chaos.
          </p>
          <div className="flex flex-col gap-s2 sm:flex-row">
            <Button asChild className="h-12 min-h-12">
              <Link href="/dashboard">Book a Free Demo</Link>
            </Button>
            <Button asChild variant="secondary" className="h-12 min-h-12">
              <Link href="/features/garage-management">Watch 2-Minute Overview</Link>
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface-default p-s3 shadow-sm">
          <Image
            src="/dashboard-preview.png"
            alt="Garixo garage management software dashboard preview"
            width={1280}
            height={720}
            className="h-auto w-full rounded-md"
            priority
          />
        </div>
      </div>
    </section>
  );
}

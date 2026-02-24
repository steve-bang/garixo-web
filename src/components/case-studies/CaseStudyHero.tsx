import Link from 'next/link';

import { Button } from '@/components/ui/button';

export function CaseStudyHero(): JSX.Element {
  return (
    <section className="border-b border-border bg-background-primary">
      <div className="mx-auto w-full max-w-[1200px] px-s4 py-s16 text-center">
        <h1 className="mx-auto max-w-[900px] text-[34px] font-bold leading-tight text-text-primary md:text-[52px]">
          How Auto Repair Shops Increase Revenue with GARIXO
        </h1>
        <p className="mx-auto mt-s3 max-w-[760px] text-body text-text-secondary">
          Real case studies from independent shop owners using GARIXO garage
          management software to simplify daily work, improve approvals, and
          increase revenue.
        </p>
        <div className="mt-s6 flex flex-col justify-center gap-s2 sm:flex-row">
          <Button asChild className="h-12">
            <Link href="/book-demo">Book a Demo</Link>
          </Button>
          <Button asChild variant="secondary" className="h-12">
            <Link href="/features">Explore Features</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

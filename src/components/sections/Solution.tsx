import { Boxes, ClipboardList, ShieldCheck, UsersRound } from 'lucide-react';
import Link from 'next/link';

import { Card } from '@/components/ui/card';

const solutionBlocks = [
  {
    title: 'Work Order Management',
    description:
      'Create, assign, and track every repair job with clear status from check-in to completion.',
    icon: ClipboardList,
    href: '/features/work-orders-management'
  },
  {
    title: 'Customer Management',
    description:
      'Keep full customer and vehicle history in one place to improve follow-up and repeat visits.',
    icon: UsersRound,
    href: '/features/customers-management'
  },
  {
    title: 'Inventory Control',
    description:
      'Track parts usage, prevent stockouts, and reduce waste with a simple inventory flow.',
    icon: Boxes,
    href: '/features/inventory-management'
  },
  {
    title: 'Staff Management',
    description:
      'Organize roles, assign work clearly, and keep your team accountable every day.',
    icon: ShieldCheck,
    href: '/features/staff-management'
  }
] as const;

export function Solution(): JSX.Element {
  return (
    <section className="bg-background-primary" aria-labelledby="solution-title">
      <div className="mx-auto w-full max-w-[1200px] space-y-s6 px-s4 py-s16">
        <div className="max-w-[780px] space-y-s3">
          <h2 id="solution-title" className="text-h1">
            Core Garage Workflows, Connected in One Simple Platform
          </h2>
          <p className="text-body text-text-secondary">
            Garixo helps independent shops run daily operations faster, reduce
            mistakes, and grow revenue without complex software.
          </p>
        </div>

        <div className="grid gap-s4 md:grid-cols-2">
          {solutionBlocks.map((block) => {
            const Icon = block.icon;
            return (
              <Card
                key={block.title}
                className="space-y-s3 rounded-xl p-s6 shadow-sm"
              >
                <div className="grid size-12 place-items-center rounded-lg bg-primary-50 text-primary-700">
                  <Icon className="size-6" />
                </div>
                <h3 className="text-h3">{block.title}</h3>
                <p className="text-small text-text-secondary">
                  {block.description}
                </p>
                <Link
                  href={block.href}
                  className="text-small font-medium text-primary-700 hover:text-primary-800"
                  aria-label={`Learn more about ${block.title}`}
                >
                  Learn more
                </Link>
              </Card>
            );
          })}
        </div>

        <p className="text-small text-text-secondary">
          Read practical guides in our{' '}
          <Link
            href="/blog"
            className="text-primary-700 hover:text-primary-800"
          >
            workshop management blog
          </Link>{' '}
          or compare plans on our{' '}
          <Link
            href="/pricing"
            className="text-primary-700 hover:text-primary-800"
          >
            pricing page
          </Link>
          .
        </p>
      </div>
    </section>
  );
}

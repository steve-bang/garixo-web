import { BarChart3, Boxes, CarFront, Wrench } from 'lucide-react';
import Link from 'next/link';

import { Card } from '@/components/ui/card';

const solutionBlocks = [
  {
    title: 'Vehicle Workflow',
    description: 'Track every vehicle from check-in to delivery.',
    icon: CarFront,
    href: '/features/garage-management'
  },
  {
    title: 'Technician Management',
    description: 'Assign jobs and track productivity in one place.',
    icon: Wrench,
    href: '/features/technician-tracking'
  },
  {
    title: 'Inventory Control',
    description: 'Auto deduct parts and prevent low-stock issues.',
    icon: Boxes,
    href: '/features/inventory-management'
  },
  {
    title: 'Real-Time Financial Dashboard',
    description: 'See daily revenue and performance clearly.',
    icon: BarChart3,
    href: '/features/garage-management'
  }
] as const;

export function Solution(): JSX.Element {
  return (
    <section className="bg-background-primary" aria-labelledby="solution-title">
      <div className="mx-auto w-full max-w-[1200px] space-y-s6 px-s4 py-s16">
        <div className="max-w-[780px] space-y-s3">
          <h2 id="solution-title" className="text-h1">
            A Complete Auto Shop Management System in One Platform
          </h2>
          <p className="text-body text-text-secondary">
            Every critical workflow for auto repair shop operations is connected
            in a single system.
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
          </Link>
          .
        </p>
      </div>
    </section>
  );
}

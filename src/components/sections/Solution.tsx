import { BarChart3, Boxes, CarFront, Wrench } from 'lucide-react';
import Link from 'next/link';

import { Card } from '@/components/ui/card';

const solutionBlocks = [
  {
    title: 'Vehicle Workflow',
    description: 'Track every vehicle from check-in to delivery.',
    icon: CarFront
  },
  {
    title: 'Technician Management',
    description: 'Assign jobs. Track labor time. Measure productivity.',
    icon: Wrench
  },
  {
    title: 'Inventory Control',
    description: 'Auto deduct parts. Get low stock alerts.',
    icon: Boxes
  },
  {
    title: 'Real-Time Financial Dashboard',
    description: 'See revenue, cost and net profit daily.',
    icon: BarChart3
  }
] as const;

export function Solution(): JSX.Element {
  return (
    <section className="bg-background-primary">
      <div className="mx-auto max-w-[1200px] space-y-s6 px-s4 py-s16">
        <h2 className="text-h1">A Complete Auto Shop Management System in One Platform</h2>
        <div className="grid gap-s4 md:grid-cols-2">
          {solutionBlocks.map((block) => {
            const Icon = block.icon;
            return (
              <Card key={block.title} className="space-y-s3 rounded-lg p-s6 shadow-sm">
                <div className="grid size-10 place-items-center rounded-md bg-surface-hover text-text-secondary">
                  <Icon className="size-5" />
                </div>
                <h3 className="text-h3">{block.title}</h3>
                <p className="max-w-[44ch] text-small text-text-secondary">{block.description}</p>
              </Card>
            );
          })}
        </div>
        <p className="text-small text-text-secondary">
          Learn more about <Link href="/features/technician-tracking" className="text-primary-700 hover:text-primary-800">technician tracking software</Link>{' '}
          and practical <Link href="/blog" className="text-primary-700 hover:text-primary-800">workshop management software guides</Link>.
        </p>
      </div>
    </section>
  );
}

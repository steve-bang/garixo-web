import Link from 'next/link';

import { Card } from '@/components/ui/card';

const painPoints = [
  {
    title: 'No real-time visibility of vehicles in service',
    description: 'You cannot quickly see which jobs are blocked or delayed.'
  },
  {
    title: 'Technicians not tracked properly',
    description: 'Labor efficiency is unclear and hard to improve.'
  },
  {
    title: 'Inventory shrinkage and parts mismanagement',
    description: 'Stock errors increase rework and reduce margin.'
  },
  {
    title: 'No clear daily profit overview',
    description: 'You finish the day without financial confidence.'
  }
] as const;

export function Problem(): JSX.Element {
  return (
    <section className="bg-surface-default" aria-labelledby="problem-title">
      <div className="mx-auto grid w-full max-w-[1200px] gap-s8 px-s4 py-s16 lg:grid-cols-2 lg:items-center">
        <div className="space-y-s4">
          <h2 id="problem-title" className="text-h1">
            Most Auto Repair Shops Lose 10–30% Profit Without Knowing It
          </h2>
          <p className="text-body text-text-secondary">
            If you cannot measure daily workshop operations, you cannot improve
            them. This is a common issue in small and mid-sized garages.
          </p>
          <p className="text-small text-text-secondary">
            Industry context:{' '}
            <a
              href="https://lookupaplate.com/blog/auto-repair-industry-statistics"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="font-medium text-primary-700 hover:text-primary-800"
            >
              71% of auto repair shops are independently owned
            </a>
            .
          </p>

          <div className="space-y-s3">
            {painPoints.map((item) => (
              <Card
                key={item.title}
                className="rounded-lg border-l-4 border-l-error-500 bg-error-50 p-s4 shadow-xs"
              >
                <p className="text-small font-semibold text-text-primary">
                  {item.title}
                </p>
                <p className="mt-s1 text-caption text-text-secondary">
                  {item.description}
                </p>
              </Card>
            ))}
          </div>

          <p className="text-small text-text-secondary">
            Explore{' '}
            <Link
              href="/features"
              className="text-primary-700 hover:text-primary-800"
            >
              garage management features
            </Link>{' '}
            and{' '}
            <Link
              href="/features/inventory-management"
              className="text-primary-700 hover:text-primary-800"
            >
              inventory management workflows
            </Link>
            .
          </p>
        </div>

        <Card className="space-y-s4 rounded-xl border border-border bg-background-primary p-s6">
          <p className="text-small font-semibold uppercase tracking-wide text-warning-700">
            Before Garixo
          </p>
          <div className="space-y-s3">
            <Metric label="Revenue Visibility" value="12%" width="w-[12%]" />
            <Metric label="Technician Tracking" value="23%" width="w-[23%]" />
            <Metric label="Inventory Accuracy" value="38%" width="w-[38%]" />
            <Metric label="Profit Tracking" value="8%" width="w-[8%]" />
          </div>

          <Card className="rounded-lg border border-warning-100 bg-surface-default p-s4">
            <p className="text-caption text-text-muted">
              Estimated monthly profit leak
            </p>
            <p className="text-h1 text-error-600">$4,200</p>
            <p className="text-caption text-text-secondary">
              Average for a 5-bay auto repair shop
            </p>
          </Card>
        </Card>
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  width
}: {
  label: string;
  value: string;
  width: string;
}): JSX.Element {
  return (
    <div className="space-y-s1">
      <div className="flex items-center justify-between text-small">
        <span className="text-text-secondary">{label}</span>
        <span className="font-semibold text-error-600">{value}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-surface-hover">
        <div className={`h-2 rounded-full bg-error-500 ${width}`} />
      </div>
    </div>
  );
}

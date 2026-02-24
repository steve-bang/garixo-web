import { Card } from '@/components/ui/card';

export function CaseStudyStats({
  yearsInBusiness,
  technicians,
  monthlyCars
}: {
  yearsInBusiness: number;
  technicians: number;
  monthlyCars: number;
}): JSX.Element {
  return (
    <section aria-labelledby="shop-overview-title">
      <h2 id="shop-overview-title" className="text-h2 text-text-primary">
        Shop Overview
      </h2>
      <div className="mt-s4 grid gap-s3 sm:grid-cols-3">
        <Card className="rounded-lg border border-border bg-surface-default p-s4 text-center shadow-xs">
          <p className="text-caption text-text-muted">Years in business</p>
          <p className="mt-s1 text-h2 text-primary-700">{yearsInBusiness}</p>
        </Card>
        <Card className="rounded-lg border border-border bg-surface-default p-s4 text-center shadow-xs">
          <p className="text-caption text-text-muted">Technicians</p>
          <p className="mt-s1 text-h2 text-primary-700">{technicians}</p>
        </Card>
        <Card className="rounded-lg border border-border bg-surface-default p-s4 text-center shadow-xs">
          <p className="text-caption text-text-muted">Monthly vehicles</p>
          <p className="mt-s1 text-h2 text-primary-700">{monthlyCars}</p>
        </Card>
      </div>
    </section>
  );
}

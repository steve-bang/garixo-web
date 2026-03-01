import Image from 'next/image';
import Link from 'next/link';

import { Card } from '@/components/ui/card';
import type { CoreFeature } from '@/components/features/features-data';

export function FeatureSection({
  feature,
  reverse = false,
  imagePriority = false
}: {
  feature: CoreFeature;
  reverse?: boolean;
  imagePriority?: boolean;
}): JSX.Element {
  const Icon = feature.icon;

  return (
    <section
      id={feature.id}
      className="scroll-mt-28 border-b border-border bg-surface-default py-s16"
    >
      <div
        className={`mx-auto grid w-full max-w-[1200px] gap-s8 px-s4 ${reverse ? 'lg:grid-cols-[1.1fr_1fr]' : 'lg:grid-cols-[1fr_1.1fr]'}`}
      >
        <div className={reverse ? 'lg:order-2' : ''}>
          <p className="inline-flex items-center gap-s2 rounded-full border border-primary-100 bg-primary-50 px-s3 py-s1 text-caption font-semibold text-primary-700">
            <Icon className="size-3.5" />
            {feature.badge}
          </p>

          <h2 className="mt-s3 text-h1">{feature.title}</h2>
          <p className="mt-s2 text-body text-text-secondary">
            {feature.description}
          </p>

          <ul className="mt-s4 space-y-s2 text-small text-text-secondary">
            {feature.bullets.map((bullet) => (
              <li
                key={bullet}
                className="rounded-md border border-border bg-background-primary px-s3 py-s2"
              >
                {bullet}
              </li>
            ))}
          </ul>

          <p className="mt-s4 rounded-md border-l-4 border-l-primary-600 bg-primary-50 px-s3 py-s2 text-small font-semibold text-primary-800">
            {feature.impact}
          </p>

          <Link
            href={feature.href}
            className="mt-s4 inline-block text-small font-semibold text-primary-700 hover:text-primary-800"
          >
            Learn more
          </Link>
        </div>

        {feature.image ? (
          <Image
            src={feature.image.url}
            alt={feature.image.alt}
            title={feature.image.title}
            width={feature.image.width}
            height={feature.image.height}
            sizes={feature.image.sizes}
            priority={imagePriority}
            className="h-auto w-full rounded-md border border-border object-cover"
          />
        ) : (
          <Card
            className={`${reverse ? 'lg:order-1' : ''} rounded-xl border border-border bg-background-primary p-s4 shadow-sm`}
          >
            <div className="space-y-s3">
              <p className="text-caption font-semibold uppercase tracking-wide text-text-muted">
                Live Dashboard Snapshot
              </p>
              <div className="grid gap-s3 sm:grid-cols-3">
                <Metric label="Open Jobs" value="18" tone="primary" />
                <Metric label="Active Techs" value="7" tone="success" />
                <Metric label="Today Revenue" value="$8,420" tone="warning" />
              </div>
              <div className="space-y-s2">
                <Row title="BMW 3 Series" status="In Progress" />
                <Row title="Toyota Camry" status="Waiting Approval" />
                <Row title="Ford F-150" status="Completed" />
              </div>
            </div>
          </Card>
        )}
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  tone
}: {
  label: string;
  value: string;
  tone: 'primary' | 'success' | 'warning';
}): JSX.Element {
  const toneClass =
    tone === 'success'
      ? 'text-success-700'
      : tone === 'warning'
        ? 'text-warning-700'
        : 'text-primary-700';

  return (
    <Card className="rounded-lg border border-border bg-surface-default p-s3 shadow-xs">
      <p className="text-caption text-text-muted">{label}</p>
      <p className={`text-h2 ${toneClass}`}>{value}</p>
    </Card>
  );
}

function Row({
  title,
  status
}: {
  title: string;
  status: string;
}): JSX.Element {
  return (
    <div className="flex items-center justify-between rounded-md border border-border bg-surface-default px-s3 py-s2">
      <p className="text-small font-medium text-text-primary">{title}</p>
      <span className="rounded-full bg-surface-hover px-s2 py-1 text-caption text-text-secondary">
        {status}
      </span>
    </div>
  );
}

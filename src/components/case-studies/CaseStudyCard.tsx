import Link from 'next/link';

import { Card } from '@/components/ui/card';
import type { CaseStudy } from '@/lib/caseStudies';

export function CaseStudyCard({ study }: { study: CaseStudy }): JSX.Element {
  return (
    <Card className="h-full rounded-xl border border-border bg-surface-default p-s4 shadow-sm">
      <h2 className="text-h3 text-text-primary">{study.garageName}</h2>
      <p className="mt-s1 text-small text-text-muted">
        {study.city}, {study.state}
      </p>

      <ul className="mt-s4 space-y-s2 text-small text-text-secondary">
        {study.results.slice(0, 3).map((result) => (
          <li
            key={result}
            className="rounded-md bg-background-primary px-s3 py-s2"
          >
            {result}
          </li>
        ))}
      </ul>

      <Link
        href={`/case-studies/${study.slug}`}
        className="mt-s4 inline-flex text-small font-semibold text-primary-700 hover:text-primary-800"
      >
        Read Full Story
      </Link>
    </Card>
  );
}

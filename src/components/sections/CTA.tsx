import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const faqItems = [
  {
    question: 'What is garage management software?',
    answer:
      'Garage management software is a centralized platform that helps owners run daily workshop operations, track jobs, and monitor performance. A strong auto shop management system connects service workflow, technicians, inventory, and billing in one place.'
  },
  {
    question: 'How does garage management software increase profit?',
    answer:
      'Garage management software helps reduce missed jobs, parts leakage, and labor inefficiency. With real-time visibility across an auto repair shop management software dashboard, owners can improve margin control and make faster decisions that protect profit.'
  },
  {
    question: 'Is this suitable for small auto repair shops?',
    answer:
      'Yes. Garixo is built for both small and growing workshops. The workflow is simple for non-technical owners while still delivering the control expected from professional automotive repair management software.'
  },
  {
    question: 'Can it be used globally?',
    answer:
      'Yes. Garixo is web-based workshop management software, so teams can use it globally from any modern browser. This makes it practical for multi-location operations and remote ownership oversight.'
  }
] as const;

export function CTA(): JSX.Element {
  return (
    <section className="bg-background-primary">
      <div className="mx-auto max-w-[1200px] space-y-s8 px-s4 py-s16">
        <Card className="space-y-s4 p-s6 text-center shadow-sm">
          <h2 className="text-h1">Ready to Take Control of Your Garage?</h2>
          <p className="text-body text-text-secondary">Stop guessing. Start managing.</p>
          <div className="mx-auto max-w-[320px]">
            <Button asChild className="h-12 min-h-12 w-full">
              <Link href="/dashboard">Book Your Free Demo</Link>
            </Button>
          </div>
          <p className="text-small text-text-secondary">
            Read real outcomes in our{' '}
            <Link href="/case-studies" className="text-primary-700 hover:text-primary-800">
              auto repair shop case studies
            </Link>
            .
          </p>
        </Card>

        <div className="space-y-s4">
          <h2 className="text-h1">What is garage management software?</h2>
          <p className="max-w-[900px] text-body text-text-secondary">
            Garage management software is the operational core of a modern auto repair business. It gives owners and staff a
            shared workflow for job intake, technician assignment, parts usage, and financial visibility so daily workshop
            execution stays predictable and profitable.
          </p>
        </div>

        <div className="space-y-s4">
          <h2 className="text-h1">Frequently Asked Questions</h2>
          <div className="space-y-s3">
            {faqItems.map((faq) => (
              <Card key={faq.question} className="space-y-s2 p-s4">
                <h3 className="text-h3">{faq.question}</h3>
                <p className="text-small text-text-secondary">{faq.answer}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

import { Card } from '@/components/ui/card';
import { featureFaqs } from '@/components/features/features-data';

export function FeaturesFaq(): JSX.Element {
  return (
    <section
      id="faq"
      className="scroll-mt-28 bg-surface-default py-s16"
      aria-labelledby="features-faq-title"
    >
      <div className="mx-auto w-full max-w-[1000px] px-s4">
        <h2 id="features-faq-title" className="text-h1">
          Frequently Asked Questions
        </h2>
        <p className="mt-s2 text-small text-text-secondary">
          Common questions about garage management system features for auto
          repair shops.
        </p>

        <div className="mt-s6 space-y-s3">
          {featureFaqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-lg border border-border bg-background-primary p-s4"
            >
              <summary className="cursor-pointer list-none text-h3 text-text-primary">
                <h3 className="inline text-h3">{faq.question}</h3>
              </summary>
              <p className="mt-s2 text-small leading-6 text-text-secondary">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

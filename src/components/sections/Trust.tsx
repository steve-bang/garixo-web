import { Card } from '@/components/ui/card';

export function Trust(): JSX.Element {
  return (
    <section className="bg-background-primary">
      <div className="mx-auto max-w-[1200px] space-y-s6 px-s4 py-s16">
        <h2 className="text-h1">Trusted by Growing Auto Repair Businesses</h2>

        <Card
          className="space-y-s3 border border-border p-s6 shadow-sm"
          itemScope
          itemType="https://schema.org/Review"
        >
          <blockquote className="text-body text-text-primary" itemProp="reviewBody">
            “Garixo helped us increase operational efficiency by 22% in 3 months.”
          </blockquote>
          <p className="text-caption text-text-muted">
            Workshop owner testimonial
          </p>
        </Card>

        <div className="grid gap-s3 sm:grid-cols-3">
          <Card className="p-s4 text-center shadow-xs">
            <p className="text-h2 text-text-primary">1,200+</p>
            <p className="text-small text-text-secondary">vehicles managed monthly</p>
          </Card>
          <Card className="p-s4 text-center shadow-xs">
            <p className="text-h2 text-text-primary">98%</p>
            <p className="text-small text-text-secondary">user satisfaction</p>
          </Card>
          <Card className="p-s4 text-center shadow-xs">
            <p className="text-h2 text-text-primary">Global</p>
            <p className="text-small text-text-secondary">used in multiple countries</p>
          </Card>
        </div>
      </div>
    </section>
  );
}

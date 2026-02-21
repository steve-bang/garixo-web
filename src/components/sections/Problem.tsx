import Link from 'next/link';

export function Problem(): JSX.Element {
  return (
    <section className="bg-background-primary">
      <div className="mx-auto grid max-w-[1200px] gap-s8 px-s4 py-s16 lg:grid-cols-2 lg:items-center">
        <div className="space-y-s4">
          <h2 className="text-h1">Most Auto Repair Shops Lose 10–30% Profit Without Knowing It</h2>
          <ul className="space-y-s2 text-body text-text-secondary">
            <li>No real-time visibility of vehicles in service</li>
            <li>Technicians not tracked properly</li>
            <li>Inventory shrinkage and parts mismanagement</li>
            <li>No clear daily profit overview</li>
          </ul>
          <p className="text-body text-text-primary">If you can&apos;t measure it, you can&apos;t improve it.</p>
          <p className="text-small text-text-secondary">
            These are common <span className="font-medium">auto repair shop</span> and <span className="font-medium">workshop operations</span>{' '}
            issues that reduce <span className="font-medium">repair shop profit</span>. Garixo solves real{' '}
            <span className="font-medium">shop management problems</span> with a single operational platform.
          </p>
          <p className="text-small text-text-secondary">
            Explore <Link href="/features/garage-management" className="text-primary-700 hover:text-primary-800">garage management features</Link>{' '}
            and <Link href="/features/inventory-management" className="text-primary-700 hover:text-primary-800">inventory management workflows</Link>.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-surface-hover p-s6">
          <div className="grid min-h-[280px] place-items-center rounded-md border border-dashed border-border bg-background-primary">
            <p className="text-small text-text-muted">Operational visibility illustration placeholder</p>
          </div>
        </div>
      </div>
    </section>
  );
}

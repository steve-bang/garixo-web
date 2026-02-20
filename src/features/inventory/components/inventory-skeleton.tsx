export function InventorySkeleton(): JSX.Element {
  return (
    <div className="space-y-s6 p-s8">
      <div className="h-8 w-64 animate-pulse rounded bg-surface-hover" />

      <div className="grid gap-s4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-lg border border-border bg-surface-default" />
        ))}
      </div>

      <div className="h-24 animate-pulse rounded-lg border border-border bg-surface-default" />
      <div className="h-80 animate-pulse rounded-lg border border-border bg-surface-default" />
    </div>
  );
}

export function DashboardSkeleton(): JSX.Element {
  return (
    <div className="space-y-s8 p-s8">
      <div className="h-8 w-64 animate-pulse rounded bg-surface-hover" />
      <div className="grid gap-s4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-lg border border-border bg-surface-default" />
        ))}
      </div>
      <div className="grid gap-s4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-24 animate-pulse rounded-lg border border-border bg-surface-default" />
        ))}
      </div>
      <div className="grid gap-s6 xl:grid-cols-2">
        <div className="h-72 animate-pulse rounded-lg border border-border bg-surface-default" />
        <div className="h-72 animate-pulse rounded-lg border border-border bg-surface-default" />
      </div>
      <div className="grid gap-s6 xl:grid-cols-2">
        <div className="h-64 animate-pulse rounded-lg border border-border bg-surface-default" />
        <div className="h-64 animate-pulse rounded-lg border border-border bg-surface-default" />
      </div>
    </div>
  );
}

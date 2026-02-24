export default function CaseStudiesLoading(): JSX.Element {
  return (
    <main className="bg-surface-default">
      <section className="mx-auto w-full max-w-[1200px] px-s4 py-s16">
        <div className="h-10 w-[70%] animate-pulse rounded-md bg-surface-hover" />
        <div className="mt-s3 h-5 w-[55%] animate-pulse rounded-md bg-surface-hover" />
        <div className="mt-s8 grid gap-s4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-[260px] animate-pulse rounded-xl border border-border bg-background-primary"
            />
          ))}
        </div>
      </section>
    </main>
  );
}

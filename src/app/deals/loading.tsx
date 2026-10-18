export default function DealsLoading() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading deals…</span>
      <div className="h-4 w-32 animate-pulse rounded bg-sand" />
      <div className="mt-6 h-36 animate-pulse rounded-[2px] bg-sand" />
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={index} className="animate-pulse rounded-[2px] border border-border/70 bg-paper">
            <div className="h-40 bg-sand" />
            <div className="space-y-2 p-2">
              <div className="h-3 w-3/4 rounded bg-sand" />
              <div className="h-3 w-1/2 rounded bg-sand" />
              <div className="h-8 w-full rounded-sm bg-sand" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

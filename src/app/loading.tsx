export default function GlobalLoading() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-7 sm:px-6" aria-busy="true" aria-label="Loading the page">
      <div className="h-5 w-40 animate-pulse rounded bg-sand" />
      <p className="sr-only">Loading…</p>
      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <li key={index} className="rounded-[2px] border border-border bg-paper p-3">
            <div className="aspect-square w-full animate-pulse rounded bg-sand" />
            <div className="mt-3 h-3 w-3/4 animate-pulse rounded bg-sand" />
            <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-sand" />
            <div className="mt-3 h-8 w-full animate-pulse rounded-[4px] bg-sand" />
          </li>
        ))}
      </ul>
    </div>
  );
}

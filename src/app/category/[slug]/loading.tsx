export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-4 sm:py-6">
      <div className="h-3 w-40 animate-pulse rounded bg-sand" />
      <div className="mt-4 flex flex-col gap-6 lg:flex-row">
        <div className="hidden w-52 shrink-0 lg:block">
          <div className="h-4 w-24 animate-pulse rounded bg-sand" />
          <div className="mt-2.5 flex flex-col gap-1.5">
            {[0, 1, 2, 3, 4].map((index) => (
              <div key={index} className="h-7 animate-pulse rounded bg-sand" />
            ))}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="h-6 w-44 animate-pulse rounded bg-sand" />
          <div className="mt-4 animate-pulse rounded bg-sand p-3">
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 rounded bg-white/60" />
              <div className="hidden gap-2 sm:flex">
                {[0, 1, 2, 3].map((index) => (
                  <div key={index} className="h-9 w-24 rounded-full bg-white/60" />
                ))}
              </div>
            </div>
          </div>
          <ul className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
              <li key={index} className="animate-pulse overflow-hidden rounded-sm border border-border bg-paper">
                <div className="aspect-square bg-sand" />
                <div className="space-y-2 p-2">
                  <div className="h-3 w-full rounded bg-sand" />
                  <div className="h-3 w-2/3 rounded bg-sand" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

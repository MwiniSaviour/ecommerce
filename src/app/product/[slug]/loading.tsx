export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-4 sm:py-6">
      <div className="h-3 w-40 animate-pulse rounded bg-sand" />
      <div className="mt-4 grid gap-6 lg:grid-cols-[42%_1fr] lg:gap-8">
        <div>
          <div className="aspect-square animate-pulse rounded-lg bg-sand" />
          <div className="mt-2.5 flex gap-2">
            {[0, 1, 2].map((index) => (
              <div key={index} className="aspect-square w-14 animate-pulse rounded bg-sand" />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <div className="animate-pulse rounded-md border border-border bg-paper p-5">
            <div className="h-3 w-20 rounded bg-sand" />
            <div className="mt-2 h-5 w-3/4 rounded bg-sand" />
            <div className="mt-4 h-7 w-36 rounded bg-sand" />
            <div className="mt-4 h-10 w-full max-w-sm rounded bg-sand" />
          </div>
          <div className="h-28 animate-pulse rounded-md bg-sand" />
          <div className="h-16 animate-pulse rounded-md bg-sand" />
        </div>
      </div>
    </div>
  );
}

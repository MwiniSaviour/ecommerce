export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-4 sm:py-6">
      <div className="h-6 w-56 animate-pulse rounded bg-sand" />
      <div className="mt-3 h-9 w-52 animate-pulse rounded-full bg-sand sm:hidden" />
      <ul className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
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
  );
}

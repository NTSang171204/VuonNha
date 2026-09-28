export function ProductSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[4/3] rounded-lg bg-gray-200" />
          <div className="mt-3 h-4 w-3/4 rounded bg-gray-200" />
          <div className="mt-2 h-3 w-1/2 rounded bg-gray-200" />
          <div className="mt-2 h-3 w-1/3 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );
}

export function CategorySkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-8 w-full animate-pulse rounded bg-gray-200" />
      ))}
    </div>
  );
}

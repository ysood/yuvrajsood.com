export default function ProductsLoading() {
  return (
    <>
      <p className="sr-only" role="status">Loading products</p>
      <div aria-hidden="true" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            className="flex min-h-[344px] flex-col justify-end rounded-2xl bg-card p-4 sm:min-h-[400px] lg:aspect-square lg:min-h-0"
            key={index}
          >
            <div className="space-y-2 motion-safe:animate-pulse">
              <div className="h-2.5 w-20 rounded-full bg-muted-foreground/10" />
              <div className="flex justify-between gap-4">
                <div className="h-3 w-32 rounded-full bg-muted-foreground/15" />
                <div className="h-3 w-10 rounded-full bg-muted-foreground/15" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

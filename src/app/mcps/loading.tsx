export default function MCPServersLoading() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section Skeleton */}
        <div className="mb-8 flex items-center justify-between">
          <div className="h-9 w-48 animate-pulse rounded-lg bg-white/10" />
          <div className="h-10 w-32 animate-pulse rounded-lg bg-white/10" />
        </div>

        {/* Server Cards Grid Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from<number>({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-xl bg-white/5 p-6"
            >
              {/* Server Name and Version Skeleton */}
              <div className="mb-4">
                <div className="mb-2 h-7 w-3/4 animate-pulse rounded-lg bg-white/10" />
                <div className="h-5 w-1/4 animate-pulse rounded-lg bg-white/10" />
              </div>

              {/* Transport Info Skeleton */}
              <div className="mb-6">
                <div className="mb-2 flex items-center gap-2">
                  <div className="h-5 w-20 animate-pulse rounded-lg bg-white/10" />
                  <div className="h-6 w-24 animate-pulse rounded-full bg-white/10" />
                </div>
                <div className="h-5 w-full animate-pulse rounded-lg bg-white/10" />
              </div>

              {/* Action Buttons Skeleton */}
              <div className="flex items-center justify-between">
                <div className="h-10 w-24 animate-pulse rounded-lg bg-white/10" />
                <div className="h-10 w-20 animate-pulse rounded-lg bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default function SkeletonTable({ rows = 5, cols = 5 }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">
      <div className="border-b border-stone-200 px-6 py-3 bg-stone-50">
        <div className="flex gap-4">
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="h-3 bg-stone-200 rounded skeleton-pulse flex-1" />
          ))}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-6 py-4 border-b border-stone-100 last:border-0">
          <div className="flex gap-4 items-center">
            {Array.from({ length: cols }).map((_, j) => (
              <div
                key={j}
                className="h-4 bg-stone-100 rounded skeleton-pulse flex-1"
                style={{ animationDelay: `${(i * cols + j) * 50}ms` }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
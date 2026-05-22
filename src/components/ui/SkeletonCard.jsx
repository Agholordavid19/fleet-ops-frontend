import { cn } from '../../utils/cn'

function SkeletonLine({ className }) {
  return (
    <div
      className={cn('bg-stone-200 rounded skeleton-pulse', className)}
    />
  )
}

export function SkeletonMetricCard() {
  return (
    <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
      <SkeletonLine className="h-3 w-24 mb-3" />
      <SkeletonLine className="h-8 w-16 mb-1" />
      <SkeletonLine className="h-2.5 w-32" />
    </div>
  )
}

export function SkeletonVehicleCard() {
  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">
      <div className="h-36 bg-stone-100 skeleton-pulse" />
      <div className="p-5 space-y-3">
        <SkeletonLine className="h-4 w-32" />
        <SkeletonLine className="h-3 w-24" />
        <SkeletonLine className="h-2 w-full" />
        <div className="flex gap-2">
          <SkeletonLine className="h-3 w-20" />
          <SkeletonLine className="h-3 w-16" />
        </div>
      </div>
    </div>
  )
}

export default function SkeletonCard({ lines = 3 }) {
  return (
    <div className="bg-white rounded-xl p-6 border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)] space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine key={i} className={cn('h-4', i === 0 ? 'w-40' : i === lines - 1 ? 'w-24' : 'w-full')} />
      ))}
    </div>
  )
}

import { Truck, Gauge } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import StatusBadge from '../../components/ui/StatusBadge'
import { SkeletonVehicleCard } from '../../components/ui/SkeletonCard'
import EmptyState from '../../components/ui/EmptyState'
import { useGetAvailableVehiclesQuery } from '../../features/vehicles/vehiclesApi'
import { formatMileage } from '../../utils/formatters'
import { healthGradeColors } from '../../utils/statusColors'
import { cn } from '../../utils/cn'

export default function AvailableVehiclesPage() {
  const { data: vehicles, isLoading } = useGetAvailableVehiclesQuery()

  return (
    <PageWrapper title="Available Vehicles" crumbs={['Staff', 'Vehicles']}>
      {isLoading
        ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array(4).fill(0).map((_, i) => <SkeletonVehicleCard key={i} />)}
          </div>
        )
        : (vehicles ?? []).length === 0
        ? <EmptyState icon={Truck} title="No vehicles available" description="Check back later when vehicles become available." />
        : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {vehicles.map((v) => (
              <div key={v.id} className="bg-white rounded-xl border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">
                <div className="h-32 bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center">
                  <Truck size={36} className="text-stone-300" />
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-stone-900">{v.make} {v.model}</p>
                    <StatusBadge status={v.status} />
                  </div>
                  <p className="text-xs font-mono text-stone-400 mb-3">{v.plateNumber}</p>
                  {v.healthGrade && (
                    <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full', healthGradeColors[v.healthGrade])}>
                      {v.healthGrade}
                    </span>
                  )}
                  <div className="flex items-center gap-1 text-xs text-stone-500 mt-3">
                    <Gauge size={12} />
                    <span>{formatMileage(v.currentMileage)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      }
    </PageWrapper>
  )
}

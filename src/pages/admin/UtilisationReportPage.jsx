import { Truck, Activity, CheckCircle, Wrench } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import MetricCard from '../../components/ui/MetricCard'
import { SkeletonMetricCard } from '../../components/ui/SkeletonCard'
import SkeletonTable from '../../components/ui/SkeletonTable'
import EmptyState from '../../components/ui/EmptyState'
import UtilizationBar from '../../components/charts/UtilizationBar'
import { useGetUtilisationReportQuery } from '../../features/reports/reportsApi'
import { formatPercentage } from '../../utils/formatters'

export default function UtilisationReportPage() {
  const { data, isLoading } = useGetUtilisationReportQuery(undefined, {
    refetchOnMountOrArgChange: true,
  })

  const metrics = [
    { title: 'Total Vehicles', value: data?.totalVehicles, icon: Truck },
    { title: 'Utilization Rate', value: formatPercentage(data?.utilizationRate), icon: Activity, accent: true },
    { title: 'Available', value: data?.availableVehicles, icon: CheckCircle },
    { title: 'In Maintenance', value: data?.maintenanceVehicles, icon: Wrench },
  ]

  const chartData = data ? [{ name: 'Fleet', utilizationRate: data.utilizationRate ?? 0 }] : []

  return (
    <PageWrapper title="Utilisation Report" crumbs={['Admin', 'Reports', 'Utilisation']}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {isLoading
          ? Array(4).fill(0).map((_, i) => <SkeletonMetricCard key={i} />)
          : metrics.map((m) => <MetricCard key={m.title} {...m} />)
        }
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6">
          <h2 className="text-sm font-semibold text-stone-900 mb-4">Utilization Rate</h2>
          <UtilizationBar data={chartData} />
        </div>

        <div className="bg-white rounded-xl border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6">
          <h2 className="text-sm font-semibold text-stone-900 mb-4">Fleet Summary</h2>
          {isLoading
            ? <SkeletonTable rows={4} cols={2} />
            : data
            ? (
              <div className="space-y-3">
                {[
                  { label: 'Total Vehicles', value: data.totalVehicles },
                  { label: 'Available', value: data.availableVehicles },
                  { label: 'Assigned / In Use', value: data.assignedVehicles },
                  { label: 'In Maintenance', value: data.maintenanceVehicles },
                  { label: 'Total Trips', value: data.totalTrips },
                  { label: 'Completed Trips', value: data.completedTrips },
                  { label: 'Utilization Rate', value: formatPercentage(data.utilizationRate) },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
                    <span className="text-sm text-stone-500">{row.label}</span>
                    <span className="text-sm font-semibold text-stone-900">{row.value ?? '—'}</span>
                  </div>
                ))}
              </div>
            )
            : <EmptyState icon={Truck} title="No data available" />
          }
        </div>
      </div>
    </PageWrapper>
  )
}

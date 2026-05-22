import { Activity, AlertTriangle, TrendingDown } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import MetricCard from '../../components/ui/MetricCard'
import { SkeletonMetricCard } from '../../components/ui/SkeletonCard'
import HealthDonut from '../../components/charts/HealthDonut'
import { useGetVehicleHealthReportQuery } from '../../features/reports/reportsApi'

export default function HealthReportPage() {
  const { data, isLoading } = useGetVehicleHealthReportQuery()

  const gradeDist = data?.gradeDistribution ?? {}
  const metrics = [
    { title: 'Avg Health Score', value: data?.avgHealthScore != null ? `${data.avgHealthScore.toFixed(1)}/100` : '—', icon: Activity, accent: true },
    { title: 'Critical Vehicles', value: data?.criticalCount, icon: AlertTriangle },
    { title: 'Marked for Sale', value: data?.markedForSaleCount, icon: TrendingDown },
  ]

  return (
    <PageWrapper title="Vehicle Health Report" crumbs={['Admin', 'Reports', 'Vehicle Health']}>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {isLoading
          ? Array(3).fill(0).map((_, i) => <SkeletonMetricCard key={i} />)
          : metrics.map((m) => <MetricCard key={m.title} {...m} />)
        }
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6">
          <h2 className="text-sm font-semibold text-stone-900 mb-4">Health Distribution</h2>
          <HealthDonut data={gradeDist} />
        </div>

        <div className="bg-white rounded-xl border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6">
          <h2 className="text-sm font-semibold text-stone-900 mb-4">Grade Breakdown</h2>
          <div className="space-y-2">
            {['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'CRITICAL'].map((grade) => (
              <div key={grade} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
                <span className="text-sm text-stone-600">{grade}</span>
                <span className="text-sm font-semibold text-stone-900">{gradeDist[grade] ?? 0} vehicles</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}

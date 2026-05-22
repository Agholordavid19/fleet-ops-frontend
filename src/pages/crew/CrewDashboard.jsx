import { useNavigate } from 'react-router-dom'
import { Wrench, CheckCircle, Clock, Star } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import MetricCard from '../../components/ui/MetricCard'
import StatusBadge from '../../components/ui/StatusBadge'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonMetricCard } from '../../components/ui/SkeletonCard'
import { useGetMyMaintenanceFlagsQuery } from '../../features/maintenance/maintenanceApi'
import { useGetMyProfileQuery } from '../../features/users/usersApi'
import { formatRelativeTime } from '../../utils/formatters'

export default function CrewDashboard() {
  const navigate = useNavigate()
  const { data: flags, isLoading } = useGetMyMaintenanceFlagsQuery()
  const { data: profile } = useGetMyProfileQuery()

  const flagList = flags ?? []
  const assigned = flagList.filter((f) => f.status === 'ASSIGNED').length
  const inProgress = flagList.filter((f) => f.status === 'IN_PROGRESS').length
  const pendingApproval = flagList.filter((f) => f.status === 'PENDING_APPROVAL').length
  const resolved = flagList.filter((f) => f.status === 'RESOLVED').length

  const activeFlags = flagList.filter((f) => !['RESOLVED', 'QUOTATION_REJECTED'].includes(f.status))
    .sort((a, b) => new Date(b.assignedAt ?? b.openedAt) - new Date(a.assignedAt ?? a.openedAt))
    .slice(0, 5)

  return (
    <PageWrapper title="Dashboard" crumbs={['Crew', 'Dashboard']}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isLoading
          ? Array(4).fill(0).map((_, i) => <SkeletonMetricCard key={i} />)
          : [
            { title: 'Assigned', value: assigned, icon: Wrench },
            { title: 'In Progress', value: inProgress, icon: Clock, accent: true },
            { title: 'Pending Approval', value: pendingApproval, icon: CheckCircle },
            { title: 'Resolved', value: resolved, icon: Star },
          ].map((m) => <MetricCard key={m.title} {...m} />)
        }
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Flags */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
          <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-stone-900">Active Flags</h2>
            <button onClick={() => navigate('/crew/flags')} className="text-xs text-stone-800 font-medium hover:text-stone-800">View all</button>
          </div>
          {activeFlags.length === 0
            ? <EmptyState icon={Wrench} title="No active flags" description="You have no assigned maintenance flags." />
            : (
              <ul className="divide-y divide-stone-100">
                {activeFlags.map((f) => (
                  <li key={f.id} onClick={() => navigate(`/crew/flags/${f.id}`)}
                    className="px-6 py-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-stone-50 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-mono font-medium text-stone-900">{f.plateNumber}</p>
                      <p className="text-xs text-stone-500 truncate">{f.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={f.status} />
                      <span className="text-xs text-stone-400">{formatRelativeTime(f.openedAt)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )
          }
        </div>

        {/* Profile summary */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6">
          <h2 className="text-sm font-semibold text-stone-900 mb-4">My Performance</h2>
          <div className="space-y-4">
            {[
              { label: 'Total Jobs Completed', value: profile?.totalJobsCompleted ?? 0 },
              { label: 'Average Rating', value: profile?.averageRating ? `${profile.averageRating.toFixed(1)} / 5.0` : '—' },
              { label: 'Status', value: profile?.active ? 'Active' : 'Inactive' },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
                <span className="text-sm text-stone-500">{s.label}</span>
                <span className="text-sm font-semibold text-stone-900">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}

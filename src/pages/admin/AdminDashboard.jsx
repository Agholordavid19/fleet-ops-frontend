import { useMemo, Suspense } from 'react'
import { Truck, MapPin, Wrench, AlertTriangle, CheckCircle } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import MetricCard from '../../components/ui/MetricCard'
import StatusBadge from '../../components/ui/StatusBadge'
import { SkeletonMetricCard } from '../../components/ui/SkeletonCard'
import SkeletonTable from '../../components/ui/SkeletonTable'
import EmptyState from '../../components/ui/EmptyState'
import HealthDonut from '../../components/charts/HealthDonut'
import { useGetVehiclesQuery } from '../../features/vehicles/vehiclesApi'
import { useGetTripsQuery, useApproveTripMutation } from '../../features/trips/tripsApi'
import { useGetMaintenanceFlagsQuery } from '../../features/maintenance/maintenanceApi'
import { useGetBreakdownsQuery } from '../../features/breakdowns/breakdownsApi'
import { useGetAdminActivityLogsQuery } from '../../features/activity/activityApi'
import { useToast } from '../../hooks/useToast'
import { formatRelativeTime } from '../../utils/formatters'

function ActivityIcon({ type }) {
  const icons = {
    TRIP: <MapPin size={13} className="text-stone-500" />,
    MAINTENANCE: <Wrench size={13} className="text-amber-500" />,
    BREAKDOWN: <AlertTriangle size={13} className="text-red-500" />,
  }
  const key = Object.keys(icons).find((k) => type?.includes(k))
  return (
    <div className="w-6 h-6 rounded-md bg-stone-100 flex items-center justify-center flex-shrink-0">
      {icons[key] ?? <CheckCircle size={13} className="text-stone-400" />}
    </div>
  )
}

export default function AdminDashboard() {
  const toast = useToast()
  const { data: vehicles, isLoading: loadingVehicles } = useGetVehiclesQuery()
  const { data: trips, isLoading: loadingTrips } = useGetTripsQuery()
  const { data: flags, isLoading: loadingFlags } = useGetMaintenanceFlagsQuery()
  const { data: breakdowns } = useGetBreakdownsQuery()
  const { data: activityPage } = useGetAdminActivityLogsQuery({ size: 10 })
  const [approveTrip, { isLoading: approving }] = useApproveTripMutation()

  const vehicleList = vehicles ?? []
  const tripList = trips ?? []
  const flagList = flags ?? []

  const totalVehicles = vehicleList.length
  const available = useMemo(
    () => vehicleList.filter((v) => v.status === 'AVAILABLE').length,
    [vehicleList],
  )
  const activeTrips = useMemo(
    () => tripList.filter((t) => t.status === 'APPROVED').length,
    [tripList],
  )
  const openFlags = useMemo(
    () => flagList.filter((f) => ['OPEN', 'ASSIGNED', 'IN_PROGRESS'].includes(f.status)).length,
    [flagList],
  )
  const activeBreakdowns = useMemo(
    () => (breakdowns ?? []).filter((b) => b.status !== 'RESOLVED').length,
    [breakdowns],
  )
  const utilizationRate = totalVehicles > 0 ? Math.round(((totalVehicles - available) / totalVehicles) * 100) : 0

  const healthDist = useMemo(
    () => vehicleList.reduce((acc, v) => {
      if (v.healthGrade) acc[v.healthGrade] = (acc[v.healthGrade] ?? 0) + 1
      return acc
    }, {}),
    [vehicleList],
  )
  const recentTrips = useMemo(
    () => [...tripList].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10),
    [tripList],
  )
  const openFlagsList = useMemo(
    () => flagList.filter((f) => ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_APPROVAL'].includes(f.status)).slice(0, 6),
    [flagList],
  )
  const activity = activityPage?.content ?? []

  async function handleApprove(id) {
    try {
      await approveTrip(id).unwrap()
      toast.success('Trip approved')
    } catch {
      toast.error('Failed to approve trip')
    }
  }

  return (
    <PageWrapper title="Dashboard" crumbs={['Admin', 'Dashboard']}>
      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {loadingVehicles || loadingTrips || loadingFlags
          ? Array(5).fill(0).map((_, i) => <SkeletonMetricCard key={i} />)
          : [
            { title: 'Total Vehicles', value: totalVehicles, icon: Truck },
            { title: 'Available', value: available, icon: CheckCircle, accent: true },
            { title: 'Active Trips', value: activeTrips, icon: MapPin },
            { title: 'Open Flags', value: openFlags, icon: Wrench },
            { title: 'Breakdowns', value: activeBreakdowns, icon: AlertTriangle },
          ].map((m) => <MetricCard key={m.title} {...m} />)
        }
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Health Donut */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6">
          <h2 className="text-sm font-semibold text-stone-900 mb-1">Vehicle Health Distribution</h2>
          <p className="text-xs text-stone-400 mb-4">Fleet health by grade</p>
          <Suspense fallback={<div className="w-40 h-40 rounded-full bg-stone-100 animate-pulse mx-auto" />}>
            <HealthDonut data={healthDist} />
          </Suspense>
        </div>

        {/* Utilization */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6">
          <h2 className="text-sm font-semibold text-stone-900 mb-1">Fleet Utilization</h2>
          <p className="text-xs text-stone-400 mb-4">Vehicles in use vs available</p>
          <div className="flex items-center justify-center my-6">
            <div className="text-center">
              <p className="text-5xl font-bold text-stone-900 tabular-nums">{utilizationRate}%</p>
              <p className="text-sm text-stone-400 mt-1">utilization rate</p>
            </div>
          </div>
          <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
            <div className="h-full bg-stone-900 rounded-full transition-all duration-500" style={{ width: `${utilizationRate}%` }} />
          </div>
          <div className="flex justify-between text-xs text-stone-400 mt-2">
            <span>{available} available</span>
            <span>{totalVehicles - available} in use</span>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6">
          <h2 className="text-sm font-semibold text-stone-900 mb-4">Recent Activity</h2>
          {activity.length === 0
            ? <EmptyState icon={CheckCircle} title="No recent activity" />
            : (
              <ul className="space-y-3">
                {activity.slice(0, 8).map((log) => (
                  <li key={log.id} className="flex items-start gap-3">
                    <ActivityIcon type={log.eventType} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-stone-700 leading-snug truncate">{log.description}</p>
                      <p className="text-[11px] text-stone-400 mt-0.5">{formatRelativeTime(log.occurredAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )
          }
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Trips */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
          <div className="px-6 py-4 border-b border-stone-100">
            <h2 className="text-sm font-semibold text-stone-900">Recent Trip Requests</h2>
          </div>
          {loadingTrips
            ? <SkeletonTable rows={4} cols={4} />
            : recentTrips.length === 0
            ? <EmptyState icon={MapPin} title="No trips yet" />
            : (
              <ul className="divide-y divide-stone-100">
                {recentTrips.map((t) => (
                  <li key={t.id} className="px-6 py-3.5 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-stone-900 truncate">{t.destination}</p>
                      <p className="text-xs text-stone-400">{t.requestedByName} · {t.plateNumber}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <StatusBadge status={t.status} />
                      {t.status === 'PENDING' && (
                        <button
                          type="button"
                          onClick={() => handleApprove(t.id)}
                          disabled={approving}
                          className="px-2.5 py-1 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium transition-colors"
                        >
                          Approve
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )
          }
        </div>

        {/* Open Maintenance */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
          <div className="px-6 py-4 border-b border-stone-100">
            <h2 className="text-sm font-semibold text-stone-900">Active Maintenance</h2>
          </div>
          {loadingFlags
            ? <SkeletonTable rows={4} cols={3} />
            : openFlagsList.length === 0
            ? <EmptyState icon={Wrench} title="No active flags" description="All maintenance is up to date." />
            : (
              <ul className="divide-y divide-stone-100">
                {openFlagsList.map((f) => (
                  <li key={f.id} className="px-6 py-3.5 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-stone-900 font-mono">{f.plateNumber}</p>
                      <p className="text-xs text-stone-400 truncate">{f.description}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <StatusBadge status={f.status} />
                      <span className="text-xs text-stone-400">{formatRelativeTime(f.openedAt)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )
          }
        </div>
      </div>
    </PageWrapper>
  )
}

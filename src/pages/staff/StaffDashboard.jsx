import { MapPin, Truck, AlertTriangle, CheckCircle } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import MetricCard from '../../components/ui/MetricCard'
import StatusBadge from '../../components/ui/StatusBadge'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonMetricCard } from '../../components/ui/SkeletonCard'
import { useGetMyTripsQuery } from '../../features/trips/tripsApi'
import { useGetAvailableVehiclesQuery } from '../../features/vehicles/vehiclesApi'
import { formatDate } from '../../utils/formatters'
import { useNavigate } from 'react-router-dom'

export default function StaffDashboard() {
  const navigate = useNavigate()
  const { data: trips, isLoading: loadingTrips } = useGetMyTripsQuery()
  const { data: vehicles, isLoading: loadingVehicles } = useGetAvailableVehiclesQuery()

  const tripList = trips ?? []
  const vehicleCount = (vehicles ?? []).length
  const pendingTrips = tripList.filter((t) => t.status === 'PENDING').length
  const approvedTrips = tripList.filter((t) => t.status === 'APPROVED').length
  const completedTrips = tripList.filter((t) => t.status === 'COMPLETED').length

  const recentTrips = [...tripList].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)

  return (
    <PageWrapper title="Dashboard" crumbs={['Staff', 'Dashboard']}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loadingVehicles || loadingTrips
          ? Array(4).fill(0).map((_, i) => <SkeletonMetricCard key={i} />)
          : [
            { title: 'Available Vehicles', value: vehicleCount, icon: Truck },
            { title: 'Pending Trips', value: pendingTrips, icon: MapPin },
            { title: 'Approved Trips', value: approvedTrips, icon: CheckCircle, accent: true },
            { title: 'Completed', value: completedTrips, icon: CheckCircle },
          ].map((m) => <MetricCard key={m.title} {...m} />)
        }
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Trips */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
          <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-stone-900">My Recent Trips</h2>
            <button onClick={() => navigate('/staff/trips/my')} className="text-xs text-stone-800 hover:text-stone-800 font-medium">View all</button>
          </div>
          {recentTrips.length === 0
            ? <EmptyState icon={MapPin} title="No trips yet" description="Request your first trip." action={
                <button onClick={() => navigate('/staff/trips/new')} className="px-4 py-2 bg-stone-900 text-white text-sm font-medium rounded-lg">Request Trip</button>
              } />
            : (
              <ul className="divide-y divide-stone-100">
                {recentTrips.map((t) => (
                  <li key={t.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-stone-900">{t.destination}</p>
                        <p className="text-xs text-stone-400">{formatDate(t.startDate)} — {formatDate(t.endDate)}</p>
                      </div>
                      <StatusBadge status={t.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )
          }
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6">
          <h2 className="text-sm font-semibold text-stone-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Request Trip', icon: MapPin, to: '/staff/trips/new', color: 'bg-stone-100 text-stone-800 hover:bg-stone-200' },
              { label: 'Report Breakdown', icon: AlertTriangle, to: '/staff/breakdowns/report', color: 'bg-red-50 text-red-700 hover:bg-red-100' },
              { label: 'Log Mileage', icon: Truck, to: '/staff/mileage/log', color: 'bg-stone-50 text-stone-700 hover:bg-stone-100' },
              { label: 'View Vehicles', icon: CheckCircle, to: '/staff/vehicles/available', color: 'bg-green-50 text-green-700 hover:bg-green-100' },
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.to)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl text-sm font-medium transition-colors ${action.color}`}
              >
                <action.icon size={20} />
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}

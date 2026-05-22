import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, XCircle, CheckSquare, CheckCircle, AlertCircle } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import StatusBadge from '../../components/ui/StatusBadge'
import DataTable from '../../components/ui/DataTable'
import SkeletonTable from '../../components/ui/SkeletonTable'
import EmptyState from '../../components/ui/EmptyState'
import ConfirmModal from '../../components/ui/ConfirmModal'
import { useGetMyTripsQuery, useCancelTripMutation, useCompleteTripMutation } from '../../features/trips/tripsApi'
import { useToast } from '../../hooks/useToast'
import { formatDate } from '../../utils/formatters'

export default function MyTripsPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [cancelTarget, setCancelTarget] = useState(null)
  const [completeTarget, setCompleteTarget] = useState(null)

  const { data: trips, isLoading } = useGetMyTripsQuery()
  const [cancelTrip, { isLoading: cancelling }] = useCancelTripMutation()
  const [completeTrip, { isLoading: completing }] = useCompleteTripMutation()

  async function handleCancel() {
    try {
      await cancelTrip(cancelTarget.id).unwrap()
      toast.success('Cancellation request submitted — awaiting manager approval')
      setCancelTarget(null)
    } catch { toast.error('Failed to submit cancellation request') }
  }

  async function handleComplete() {
    const trip = completeTarget
    try {
      await completeTrip(trip.id).unwrap()
      toast.success('Trip marked as completed! Please log the final mileage.')
      setCompleteTarget(null)
      navigate(`/staff/mileage/log?tripId=${trip.id}&vehicleId=${trip.vehicleId ?? ''}`)
    } catch { toast.error('Failed to complete trip') }
  }

  // In-app notification banners for approved / rejected trips
  const approvedTrips = (trips ?? []).filter((t) => t.status === 'APPROVED')
  const rejectedTrips = (trips ?? []).filter((t) => t.status === 'REJECTED' && t.rejectionReason)

  const columns = [
    { key: 'plateNumber', label: 'Vehicle', render: (v) => <span className="font-mono">{v}</span> },
    { key: 'destination', label: 'Destination' },
    { key: 'startDate', label: 'Start', render: (v) => formatDate(v) },
    { key: 'endDate', label: 'End', render: (v) => formatDate(v) },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'rejectionReason', label: 'Reason', render: (v) => v ? <span className="text-xs text-red-600">{v}</span> : null },
    {
      key: 'id',
      label: 'Actions',
      render: (id, row) => (
        <div className="flex items-center gap-2">
          {row.status === 'PENDING' && (
            <button
              onClick={(e) => { e.stopPropagation(); setCancelTarget(row) }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium transition-colors"
            >
              <XCircle size={12} /> Cancel
            </button>
          )}
          {row.status === 'APPROVED' && (
            <button
              onClick={(e) => { e.stopPropagation(); setCompleteTarget(row) }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-green-50 hover:bg-green-100 text-green-700 text-xs font-medium transition-colors"
            >
              <CheckSquare size={12} /> Mark Completed
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <PageWrapper title="My Trips" crumbs={['Staff', 'Trips']}>
      {/* In-app notifications */}
      {approvedTrips.length > 0 && (
        <div className="mb-5 space-y-2">
          {approvedTrips.map((t) => (
            <div key={t.id} className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <CheckCircle size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-800">
                <span className="font-semibold">Trip approved:</span> Your trip to <span className="font-medium">{t.destination}</span> ({formatDate(t.startDate)} – {formatDate(t.endDate)}) has been approved. You may now mark it as completed when finished.
              </div>
            </div>
          ))}
        </div>
      )}

      {rejectedTrips.length > 0 && (
        <div className="mb-5 space-y-2">
          {rejectedTrips.map((t) => (
            <div key={t.id} className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">
                <span className="font-semibold">Trip rejected:</span> Your trip to <span className="font-medium">{t.destination}</span> was rejected.
                {t.rejectionReason && <span> Reason: <span className="italic">{t.rejectionReason}</span></span>}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end mb-6">
        <button onClick={() => navigate('/staff/trips/new')} className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium rounded-lg transition-colors">
          New Request
        </button>
      </div>

      {isLoading
        ? <SkeletonTable rows={5} cols={5} />
        : (trips ?? []).length === 0
        ? <EmptyState icon={MapPin} title="No trips yet" description="Submit a trip request to get started." action={
            <button onClick={() => navigate('/staff/trips/new')} className="px-4 py-2 bg-stone-900 text-white text-sm font-medium rounded-lg">Request Trip</button>
          } />
        : <DataTable columns={columns} data={trips} />
      }

      {/* Cancel confirmation */}
      <ConfirmModal
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        title="Cancel Trip Request"
        description={`Are you sure you want to cancel your trip to "${cancelTarget?.destination}"? This will be sent to your fleet manager for approval.`}
        confirmLabel="Submit Cancellation"
        confirmVariant="danger"
        isLoading={cancelling}
      />

      {/* Complete confirmation */}
      <ConfirmModal
        open={!!completeTarget}
        onClose={() => setCompleteTarget(null)}
        onConfirm={handleComplete}
        title="Mark Trip as Completed"
        description={`Mark your trip to "${completeTarget?.destination}" as completed? You'll be redirected to log the final mileage.`}
        confirmLabel="Mark Completed"
        confirmVariant="primary"
        isLoading={completing}
      />
    </PageWrapper>
  )
}

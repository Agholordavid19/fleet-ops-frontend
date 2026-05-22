import { useState } from 'react'
import { MapPin, CheckCircle, XCircle, CheckSquare, BellRing } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import StatusBadge from '../../components/ui/StatusBadge'
import DataTable from '../../components/ui/DataTable'
import SkeletonTable from '../../components/ui/SkeletonTable'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import { TabFilter } from '../../components/ui/FilterBar'
import {
  useGetTripsQuery, useApproveTripMutation, useRejectTripMutation,
  useConfirmCompletionMutation, useApproveCancellationMutation,
} from '../../features/trips/tripsApi'
import { useToast } from '../../hooks/useToast'
import { formatDate } from '../../utils/formatters'

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'PENDING_COMPLETION', label: 'Pending Completion' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'PENDING_CANCELLATION', label: 'Cancellation Requests' },
  { value: 'REJECTED', label: 'Rejected' },
]

export default function TripsPage() {
  const toast = useToast()
  const [statusTab, setStatusTab] = useState('')
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  const { data: trips, isLoading } = useGetTripsQuery()
  const [approveTrip, { isLoading: approving }] = useApproveTripMutation()
  const [rejectTrip, { isLoading: rejecting }] = useRejectTripMutation()
  const [confirmCompletion, { isLoading: completing }] = useConfirmCompletionMutation()
  const [approveCancellation, { isLoading: approvingCancellation }] = useApproveCancellationMutation()

  const filtered = (trips ?? []).filter((t) => !statusTab || t.status === statusTab)

  // Pending cancellation requests notification
  const cancellationPending = (trips ?? []).filter((t) => t.status === 'PENDING_CANCELLATION')

  async function handleApprove(id) {
    try {
      await approveTrip(id).unwrap()
      toast.success('Trip approved')
    } catch { toast.error('Failed to approve') }
  }

  async function handleComplete(id) {
    try {
      await confirmCompletion(id).unwrap()
      toast.success('Trip marked as complete')
    } catch { toast.error('Failed to complete trip') }
  }

  async function handleReject() {
    try {
      await rejectTrip({ id: rejectModal.id, reason: rejectReason }).unwrap()
      toast.success('Trip rejected')
      setRejectModal(null)
      setRejectReason('')
    } catch { toast.error('Failed to reject') }
  }

  async function handleApproveCancellation(id) {
    try {
      await approveCancellation(id).unwrap()
      toast.success('Cancellation approved')
    } catch { toast.error('Failed to approve cancellation') }
  }

  const columns = [
    { key: 'requestedByName', label: 'Requested By' },
    { key: 'plateNumber', label: 'Plate', render: (v) => <span className="font-mono text-stone-700">{v}</span> },
    { key: 'destination', label: 'Destination', render: (v) => <span className="max-w-[180px] truncate block">{v}</span> },
    { key: 'startDate', label: 'Start', render: (v) => formatDate(v) },
    { key: 'endDate', label: 'End', render: (v) => formatDate(v) },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    {
      key: 'id',
      label: 'Actions',
      render: (id, row) => (
        <div className="flex items-center gap-2 flex-wrap">
          {row.status === 'PENDING' && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleApprove(id) }}
                disabled={approving}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-green-50 hover:bg-green-100 text-green-700 text-xs font-medium transition-colors"
              >
                <CheckCircle size={12} /> Approve
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setRejectModal(row) }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium transition-colors"
              >
                <XCircle size={12} /> Reject
              </button>
            </>
          )}
          {row.status === 'PENDING_COMPLETION' && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleComplete(id) }}
              disabled={completing}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium transition-colors"
            >
              <CheckSquare size={12} /> Confirm Complete
            </button>
          )}
          {row.status === 'PENDING_CANCELLATION' && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleApproveCancellation(id) }}
              disabled={approvingCancellation}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-medium transition-colors"
            >
              <CheckCircle size={12} /> Approve Cancel
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <PageWrapper title="Trip Requests" crumbs={['Admin', 'Trips']}>
      {/* Cancellation notification banner */}
      {cancellationPending.length > 0 && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
          <BellRing size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <span className="font-semibold">{cancellationPending.length} pending cancellation request{cancellationPending.length > 1 ? 's' : ''}</span>
            {' '}— review and approve below.
          </div>
        </div>
      )}

      <div className="mb-6">
        <TabFilter
          tabs={STATUS_TABS.map((t) => ({
            ...t,
            count: t.value ? (trips ?? []).filter((x) => x.status === t.value).length : undefined,
          }))}
          active={statusTab}
          onSelect={setStatusTab}
        />
      </div>

      {isLoading
        ? <SkeletonTable rows={5} cols={7} />
        : filtered.length === 0
        ? <EmptyState icon={MapPin} title="No trips found" description="No trips match the selected filter." />
        : <DataTable columns={columns} data={filtered} />
      }

      {/* Reject Modal */}
      <Modal open={!!rejectModal} onClose={() => setRejectModal(null)} title="Reject Trip" size="sm">
        <p className="text-sm text-stone-500 mb-3">Provide a reason for rejecting this trip request.</p>
        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Reason…"
          rows={3}
          className="w-full rounded-lg border border-stone-200 text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700 resize-none mb-4"
        />
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => setRejectModal(null)} className="px-4 py-2 text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg">Cancel</button>
          <button
            type="button"
            onClick={handleReject}
            disabled={rejecting || !rejectReason.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-60"
          >
            {rejecting ? 'Rejecting…' : 'Reject'}
          </button>
        </div>
      </Modal>
    </PageWrapper>
  )
}
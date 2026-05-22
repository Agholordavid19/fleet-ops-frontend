import { useState } from 'react'
import { AlertTriangle, MapPin, CheckCircle } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import StatusBadge from '../../components/ui/StatusBadge'
import SkeletonTable from '../../components/ui/SkeletonTable'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import ConfirmModal from '../../components/ui/ConfirmModal'
import { useGetBreakdownsQuery, useDispatchReplacementMutation, useResolveBreakdownMutation } from '../../features/breakdowns/breakdownsApi'
import { useGetAvailableVehiclesQuery } from '../../features/vehicles/vehiclesApi'
import { useToast } from '../../hooks/useToast'
import { formatRelativeTime } from '../../utils/formatters'
import { cn } from '../../utils/cn'

export default function BreakdownsPage() {
  const toast = useToast()
  const [dispatchModal, setDispatchModal] = useState(null)
  const [selectedVehicle, setSelectedVehicle] = useState('')
  const [resolveConfirm, setResolveConfirm] = useState(null)

  const { data: breakdowns, isLoading } = useGetBreakdownsQuery()
  const { data: availableVehicles } = useGetAvailableVehiclesQuery()
  const [dispatchReplacement, { isLoading: dispatching }] = useDispatchReplacementMutation()
  const [resolveBreakdown, { isLoading: resolving }] = useResolveBreakdownMutation()

  const sorted = [...(breakdowns ?? [])].sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt))

  async function handleDispatch() {
    try {
      await dispatchReplacement({ id: dispatchModal.id, replacementVehicleId: selectedVehicle }).unwrap()
      toast.success('Replacement vehicle dispatched')
      setDispatchModal(null)
      setSelectedVehicle('')
    } catch { toast.error('Failed to dispatch replacement') }
  }

  async function handleResolve() {
    try {
      await resolveBreakdown(resolveConfirm.id).unwrap()
      toast.success('Breakdown resolved')
      setResolveConfirm(null)
    } catch { toast.error('Failed to resolve') }
  }

  const statusColor = { REPORTED: 'border-red-200 bg-red-50', CREW_DISPATCHED: 'border-stone-300 bg-stone-100', REPLACEMENT_DISPATCHED: 'border-purple-200 bg-purple-50', RESOLVED: 'border-green-200 bg-green-50' }

  return (
    <PageWrapper title="Breakdowns" crumbs={['Admin', 'Breakdowns']}>
      {isLoading
        ? <SkeletonTable rows={5} cols={5} />
        : sorted.length === 0
        ? <EmptyState icon={AlertTriangle} title="No breakdowns" description="No breakdown reports found." />
        : (
          <div className="space-y-3">
            {sorted.map((b) => (
              <div
                key={b.id}
                className={cn(
                  'bg-white rounded-xl border shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-5',
                  statusColor[b.status] ?? 'border-stone-200',
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-base font-mono font-semibold text-stone-900">{b.vehiclePlateNumber}</span>
                      <StatusBadge status={b.status} />
                      <span className="text-xs text-stone-400">{formatRelativeTime(b.reportedAt)}</span>
                    </div>
                    <p className="text-sm text-stone-700 mb-1">{b.description}</p>
                    <div className="flex items-center gap-1 text-xs text-stone-400">
                      <MapPin size={11} />
                      <span>{b.locationDescription ?? `${b.latitude?.toFixed(4)}, ${b.longitude?.toFixed(4)}`}</span>
                    </div>
                    <p className="text-xs text-stone-400 mt-1">Reported by <span className="font-medium">{b.fieldStaffName}</span></p>
                    {b.replacementVehiclePlate && (
                      <p className="text-xs text-purple-600 mt-1">Replacement: <span className="font-mono font-medium">{b.replacementVehiclePlate}</span></p>
                    )}
                    {b.assignedCrewName && (
                      <p className="text-xs text-stone-800 mt-1">Crew: <span className="font-medium">{b.assignedCrewName}</span></p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {b.status === 'REPORTED' && (
                      <button
                        onClick={() => setDispatchModal(b)}
                        className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded-lg transition-colors"
                      >
                        Dispatch Vehicle
                      </button>
                    )}
                    {(b.status === 'REPLACEMENT_DISPATCHED' || b.status === 'CREW_DISPATCHED') && (
                      <button
                        onClick={() => setResolveConfirm(b)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-medium rounded-lg transition-colors"
                      >
                        <CheckCircle size={12} /> Resolve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      }

      {/* Dispatch Modal */}
      <Modal open={!!dispatchModal} onClose={() => setDispatchModal(null)} title="Dispatch Replacement Vehicle" size="sm">
        <p className="text-sm text-stone-500 mb-4">Select a replacement vehicle for <strong>{dispatchModal?.vehiclePlateNumber}</strong>.</p>
        <select
          value={selectedVehicle}
          onChange={(e) => setSelectedVehicle(e.target.value)}
          className="w-full h-9 px-3 rounded-lg border border-stone-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700 mb-4"
        >
          <option value="">Select vehicle…</option>
          {(availableVehicles ?? []).map((v) => (
            <option key={v.id} value={v.id}>{v.plateNumber} — {v.make} {v.model}</option>
          ))}
        </select>
        <div className="flex justify-end gap-3">
          <button onClick={() => setDispatchModal(null)} className="px-4 py-2 text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg">Cancel</button>
          <button
            onClick={handleDispatch}
            disabled={dispatching || !selectedVehicle}
            className="px-4 py-2 text-sm font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg disabled:opacity-60"
          >
            {dispatching ? 'Dispatching…' : 'Dispatch'}
          </button>
        </div>
      </Modal>

      <ConfirmModal
        open={!!resolveConfirm}
        onClose={() => setResolveConfirm(null)}
        onConfirm={handleResolve}
        title="Resolve Breakdown"
        description={`Mark breakdown for ${resolveConfirm?.vehiclePlateNumber} as resolved?`}
        confirmLabel="Resolve"
        confirmVariant="primary"
        isLoading={resolving}
      />
    </PageWrapper>
  )
}

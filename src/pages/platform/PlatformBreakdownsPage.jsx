import { useState } from 'react'
import { AlertTriangle, MapPin } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import StatusBadge from '../../components/ui/StatusBadge'
import SkeletonTable from '../../components/ui/SkeletonTable'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import { useGetPlatformBreakdownsQuery, useDispatchCrewMutation } from '../../features/breakdowns/breakdownsApi'
import { useGetPlatformCrewQuery } from '../../features/platform/platformApi'
import { useToast } from '../../hooks/useToast'
import { formatRelativeTime } from '../../utils/formatters'

export default function PlatformBreakdownsPage() {
  const toast = useToast()
  const [dispatchModal, setDispatchModal] = useState(null)
  const [selectedCrew, setSelectedCrew] = useState('')

  const { data: breakdowns, isLoading } = useGetPlatformBreakdownsQuery()
  const { data: crew } = useGetPlatformCrewQuery()
  const [dispatchCrew, { isLoading: dispatching }] = useDispatchCrewMutation()

  const sorted = [...(breakdowns ?? [])].sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt))
  const availableCrew = (crew ?? []).filter((c) => c.available)

  async function handleDispatch() {
    try {
      await dispatchCrew({ id: dispatchModal.id, crewId: selectedCrew }).unwrap()
      toast.success('Crew dispatched')
      setDispatchModal(null)
      setSelectedCrew('')
    } catch { toast.error('Failed to dispatch crew') }
  }

  return (
    <PageWrapper title="Breakdowns" crumbs={['Platform', 'Breakdowns']}>
      {isLoading
        ? <SkeletonTable rows={5} cols={5} />
        : sorted.length === 0
        ? <EmptyState icon={AlertTriangle} title="No breakdowns" />
        : (
          <div className="space-y-3">
            {sorted.map((b) => (
              <div key={b.id} className="bg-white rounded-xl border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono font-semibold text-stone-900">{b.vehiclePlateNumber}</span>
                      <StatusBadge status={b.status} />
                      <span className="text-xs text-stone-400">{formatRelativeTime(b.reportedAt)}</span>
                    </div>
                    <p className="text-sm text-stone-700 mb-1">{b.description}</p>
                    <div className="flex items-center gap-1 text-xs text-stone-400">
                      <MapPin size={11} />
                      <span>
                        {b.locationDescription
                          ? b.locationDescription
                          : b.latitude != null && b.longitude != null
                          ? `GPS: ${b.latitude.toFixed(4)}, ${b.longitude.toFixed(4)}`
                          : 'Location unknown'}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 mt-1">Reported by <span className="font-medium">{b.fieldStaffName}</span></p>
                  </div>
                  {b.status === 'REPORTED' && (
                    <button
                      type="button"
                      onClick={() => setDispatchModal(b)}
                      className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded-lg transition-colors flex-shrink-0"
                    >
                      Dispatch Crew
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      }

      <Modal open={!!dispatchModal} onClose={() => { setDispatchModal(null); setSelectedCrew('') }} title="Dispatch Crew" size="sm">
        <p className="text-sm text-stone-500 mb-4">Select a crew member for <strong>{dispatchModal?.vehiclePlateNumber}</strong>.</p>
        <select
          value={selectedCrew}
          onChange={(e) => setSelectedCrew(e.target.value)}
          className="w-full h-9 px-3 rounded-lg border border-stone-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700 mb-4"
        >
          <option value="">Select crew member…</option>
          {availableCrew.map((c) => (
            <option key={c.id} value={c.id}>{c.name} — {c.averageRating?.toFixed(1) ?? '0.0'}★</option>
          ))}
        </select>
        {availableCrew.length === 0 && <p className="text-xs text-amber-600 mb-3">No crew members available right now.</p>}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => setDispatchModal(null)} className="px-4 py-2 text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg">Cancel</button>
          <button type="button" onClick={handleDispatch} disabled={dispatching || !selectedCrew} className="px-4 py-2 text-sm font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg disabled:opacity-60">
            {dispatching ? 'Dispatching…' : 'Dispatch'}
          </button>
        </div>
      </Modal>
    </PageWrapper>
  )
}

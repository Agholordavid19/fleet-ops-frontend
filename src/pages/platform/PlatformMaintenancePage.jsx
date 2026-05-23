import { useState } from 'react'
import { Wrench } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import StatusBadge from '../../components/ui/StatusBadge'
import DataTable from '../../components/ui/DataTable'
import SkeletonTable from '../../components/ui/SkeletonTable'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import { TabFilter } from '../../components/ui/FilterBar'
import { useGetPlatformMaintenanceFlagsQuery, useAssignCrewToFlagMutation, useGetPlatformCrewQuery } from '../../features/platform/platformApi'
import { useToast } from '../../hooks/useToast'
import { useAuth } from '../../hooks/useAuth'
import { ROLES } from '../../utils/roleHelpers'
import { formatRelativeTime } from '../../utils/formatters'

export default function PlatformMaintenancePage() {
  const toast = useToast()
  const { role } = useAuth()
  const canManage = role !== ROLES.PLATFORM_ADMIN
  const [statusTab, setStatusTab] = useState('')
  const [assignModal, setAssignModal] = useState(null)
  const [selectedCrew, setSelectedCrew] = useState('')

  const { data: flags, isLoading } = useGetPlatformMaintenanceFlagsQuery()
  const { data: crew } = useGetPlatformCrewQuery()
  const [assignCrew, { isLoading: assigning }] = useAssignCrewToFlagMutation()

  const availableCrew = (crew ?? []).filter((c) => c.available)
  const filtered = (flags ?? []).filter((f) => !statusTab || f.status === statusTab)

  async function handleAssign() {
    try {
      await assignCrew({ id: assignModal.id, crewId: selectedCrew }).unwrap()
      toast.success('Crew assigned')
      setAssignModal(null)
      setSelectedCrew('')
    } catch { toast.error('Failed to assign crew') }
  }

  const columns = [
    { key: 'plateNumber', label: 'Vehicle', render: (v) => <span className="font-mono">{v}</span> },
    { key: 'description', label: 'Description', render: (v) => <span className="max-w-xs truncate block">{v}</span> },
    { key: 'triggerType', label: 'Trigger', render: (v) => <StatusBadge status={v} /> },
    { key: 'assignedCrewName', label: 'Crew', render: (v) => v ?? <span className="text-stone-400 text-xs">Unassigned</span> },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'openedAt', label: 'Opened', render: (v) => formatRelativeTime(v) },
    {
      key: 'id',
      label: 'Action',
      render: (id, row) => canManage && row.status === 'OPEN' && !row.assignedCrewId
        ? (
          <button type="button" onClick={(e) => { e.stopPropagation(); setAssignModal(row) }}
            className="px-2.5 py-1 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium transition-colors">
            Assign Crew
          </button>
        ) : null,
    },
  ]

  const STATUS_TABS = [
    { value: '', label: 'All' },
    { value: 'OPEN', label: 'Open' },
    { value: 'ASSIGNED', label: 'Assigned' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'RESOLVED', label: 'Resolved' },
  ]

  return (
    <PageWrapper title="Maintenance" crumbs={['Platform', 'Maintenance']}>
      <div className="mb-6">
        <TabFilter tabs={STATUS_TABS} active={statusTab} onSelect={setStatusTab} />
      </div>

      {isLoading
        ? <SkeletonTable rows={5} cols={6} />
        : filtered.length === 0
        ? <EmptyState icon={Wrench} title="No maintenance flags" />
        : <DataTable columns={columns} data={filtered} />
      }

      <Modal open={!!assignModal} onClose={() => setAssignModal(null)} title="Assign Crew" size="sm">
        <p className="text-sm text-stone-500 mb-4">Assign crew for <strong>{assignModal?.plateNumber}</strong>.</p>
        <select value={selectedCrew} onChange={(e) => setSelectedCrew(e.target.value)}
          className="w-full h-9 px-3 rounded-lg border border-stone-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700 mb-4">
          <option value="">Select crew member…</option>
          {availableCrew.map((c) => (
            <option key={c.id} value={c.id}>{c.name} — {c.averageRating?.toFixed(1) ?? '0.0'}★</option>
          ))}
        </select>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => setAssignModal(null)} className="px-4 py-2 text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg">Cancel</button>
          <button type="button" onClick={handleAssign} disabled={assigning || !selectedCrew} className="px-4 py-2 text-sm font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg disabled:opacity-60">
            {assigning ? 'Assigning…' : 'Assign'}
          </button>
        </div>
      </Modal>
    </PageWrapper>
  )
}

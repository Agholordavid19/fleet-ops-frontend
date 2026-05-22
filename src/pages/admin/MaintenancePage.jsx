import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wrench, Plus } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import StatusBadge from '../../components/ui/StatusBadge'
import DataTable from '../../components/ui/DataTable'
import SkeletonTable from '../../components/ui/SkeletonTable'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import { TabFilter } from '../../components/ui/FilterBar'
import { useGetMaintenanceFlagsQuery, useCreateMaintenanceFlagMutation } from '../../features/maintenance/maintenanceApi'
import { useGetVehiclesQuery } from '../../features/vehicles/vehiclesApi'
import { useToast } from '../../hooks/useToast'
import { formatRelativeTime } from '../../utils/formatters'
import { useForm } from 'react-hook-form'

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'OPEN', label: 'Open' },
  { value: 'CREW_ASSIGNED', label: 'Assigned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'PENDING_APPROVAL', label: 'Pending Approval' },
  { value: 'RESOLVED', label: 'Resolved' },
]

export default function MaintenancePage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [statusTab, setStatusTab] = useState('')
  const [createModal, setCreateModal] = useState(false)

  const { data: flags, isLoading } = useGetMaintenanceFlagsQuery()
  const { data: vehicles } = useGetVehiclesQuery()
  const [createFlag, { isLoading: creating }] = useCreateMaintenanceFlagMutation()
  const { register, handleSubmit, formState: { errors }, reset } = useForm()

  const filtered = (flags ?? []).filter((f) => !statusTab || f.status === statusTab)

  async function onSubmit({ vehicleId, description }) {
    try {
      await createFlag({ vehicleId, description }).unwrap()
      toast.success('Maintenance flag created')
      reset()
      setCreateModal(false)
    } catch (err) {
      toast.error(err?.data?.message ?? 'Failed to create flag')
    }
  }

  const columns = [
    { key: 'plateNumber', label: 'Vehicle', render: (v) => <span className="font-mono">{v}</span> },
    { key: 'description', label: 'Description', render: (v) => <span className="max-w-xs truncate block text-stone-600">{v}</span> },
    { key: 'triggerType', label: 'Trigger', render: (v) => <StatusBadge status={v} /> },
    { key: 'assignedCrewName', label: 'Crew', render: (v) => v ?? <span className="text-stone-400 text-xs">Unassigned</span> },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'openedAt', label: 'Opened', render: (v) => <span className="text-stone-400 text-xs">{formatRelativeTime(v)}</span> },
  ]

  return (
    <PageWrapper title="Maintenance Flags" crumbs={['Admin', 'Maintenance']}>
      <div className="flex items-center justify-between mb-6">
        <TabFilter
          tabs={STATUS_TABS.map((t) => ({
            ...t,
            count: t.value ? (flags ?? []).filter((x) => x.status === t.value).length : undefined,
          }))}
          active={statusTab}
          onSelect={setStatusTab}
        />
        <button
          type="button"
          onClick={() => setCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium rounded-lg transition-colors ml-4"
        >
          <Plus size={15} /> New Flag
        </button>
      </div>

      {isLoading
        ? <SkeletonTable rows={5} cols={6} />
        : filtered.length === 0
        ? <EmptyState icon={Wrench} title="No maintenance flags" description="All vehicles are running smoothly." />
        : (
          <DataTable
            columns={columns}
            data={filtered}
            onRowClick={(row) => navigate(`/admin/maintenance/${row.id}`)}
          />
        )
      }

      {/* Create Modal */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} title="New Maintenance Flag" size="sm">
        <form onSubmit={handleSubmit(onSubmit)} autoComplete="on" className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Vehicle <span className="text-red-500">*</span></label>
            <select
              {...register('vehicleId', { required: 'Required' })}
              className="w-full h-9 px-3 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700 bg-white"
            >
              <option value="">Select a vehicle…</option>
              {(vehicles ?? []).map((v) => (
                <option key={v.id} value={v.id}>{v.plateNumber} — {v.make} {v.model}</option>
              ))}
            </select>
            {errors.vehicleId && <p className="text-xs text-red-600 mt-1">{errors.vehicleId.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Description <span className="text-red-500">*</span></label>
            <textarea
              {...register('description', { required: 'Required' })}
              placeholder="Describe the maintenance issue…"
              rows={3}
              className="w-full rounded-lg border border-stone-200 text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700 resize-none"
            />
            {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description.message}</p>}
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setCreateModal(false)} className="px-4 py-2 text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg">Cancel</button>
            <button type="submit" disabled={creating} className="px-4 py-2 text-sm font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg disabled:opacity-60">
              {creating ? 'Creating…' : 'Create Flag'}
            </button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  )
}

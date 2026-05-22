import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HardHat, Plus } from 'lucide-react'
import { useForm } from 'react-hook-form'
import PageWrapper from '../../components/layout/PageWrapper'
import DataTable from '../../components/ui/DataTable'
import SkeletonTable from '../../components/ui/SkeletonTable'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import { StarDisplay } from '../../components/ui/StarRating'
import { useGetPlatformCrewQuery, useCreateCrewMutation } from '../../features/platform/platformApi'
import { useToast } from '../../hooks/useToast'

export default function CrewPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [createModal, setCreateModal] = useState(false)
  const { data: crew, isLoading } = useGetPlatformCrewQuery()
  const [createCrew, { isLoading: creating }] = useCreateCrewMutation()
  const { register, handleSubmit, formState: { errors }, reset } = useForm()

  async function onSubmit(data) {
    try {
      await createCrew({ ...data, role: 'MAINTENANCE_CREW' }).unwrap()
      toast.success('Crew member created')
      reset()
      setCreateModal(false)
    } catch (err) {
      toast.error(err?.data?.message ?? 'Failed to create crew member')
    }
  }

  const columns = [
    { key: 'name', label: 'Name', render: (v) => <span className="font-medium text-stone-900">{v}</span> },
    { key: 'email', label: 'Email', render: (v) => <span className="text-stone-500">{v}</span> },
    { key: 'available', label: 'Available', render: (v) => (
      <span className={`text-xs font-medium ${v ? 'text-green-600' : 'text-stone-400'}`}>{v ? 'Available' : 'Busy'}</span>
    )},
    { key: 'averageRating', label: 'Rating', render: (v) => <StarDisplay rating={v ?? 0} /> },
    { key: 'totalJobsCompleted', label: 'Jobs', render: (v) => <span className="font-medium">{v ?? 0}</span> },
  ]

  return (
    <PageWrapper title="Maintenance Crew" crumbs={['Platform', 'Crew']}>
      <div className="flex justify-end mb-6">
        <button onClick={() => setCreateModal(true)} className="flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium rounded-lg transition-colors">
          <Plus size={15} /> Add Crew Member
        </button>
      </div>

      {isLoading
        ? <SkeletonTable rows={5} cols={5} />
        : (crew ?? []).length === 0
        ? <EmptyState icon={HardHat} title="No crew members" description="Add maintenance crew to handle flags." />
        : <DataTable columns={columns} data={crew} onRowClick={(row) => navigate(`/platform/crew/${row.id}`)} />
      }

      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Add Crew Member" size="sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {[
            { name: 'name', label: 'Name', placeholder: 'John Smith' },
            { name: 'email', label: 'Email', type: 'email', placeholder: 'john@fleet.com' },
            { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
          ].map((f) => (
            <div key={f.name}>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">{f.label} <span className="text-red-500">*</span></label>
              <input {...register(f.name, { required: 'Required' })} type={f.type ?? 'text'} placeholder={f.placeholder}
                className="w-full h-9 px-3 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700" />
              {errors[f.name] && <p className="text-xs text-red-600 mt-1">{errors[f.name].message}</p>}
            </div>
          ))}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setCreateModal(false)} className="px-4 py-2 text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg">Cancel</button>
            <button type="submit" disabled={creating} className="px-4 py-2 text-sm font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg disabled:opacity-60">
              {creating ? 'Creating…' : 'Add Member'}
            </button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  )
}

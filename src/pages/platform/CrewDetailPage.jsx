import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, HardHat, Trash2 } from 'lucide-react'
import { useState } from 'react'
import PageWrapper from '../../components/layout/PageWrapper'
import SkeletonCard from '../../components/ui/SkeletonCard'
import ConfirmModal from '../../components/ui/ConfirmModal'
import { StarDisplay } from '../../components/ui/StarRating'
import { useGetPlatformCrewByIdQuery, useGetCrewPerformanceQuery, useDeleteCrewMutation } from '../../features/platform/platformApi'
import { useToast } from '../../hooks/useToast'

export default function CrewDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const { data: crew, isLoading } = useGetPlatformCrewByIdQuery(id)
  const { data: performance } = useGetCrewPerformanceQuery(id)
  const [deleteCrew, { isLoading: deleting }] = useDeleteCrewMutation()

  async function handleDelete() {
    try {
      await deleteCrew(id).unwrap()
      toast.success('Crew member deleted')
      navigate('/platform/crew')
    } catch { toast.error('Failed to delete crew member') }
  }

  if (isLoading) return <PageWrapper title="Crew Detail" crumbs={['Platform', 'Crew']}><SkeletonCard lines={5} /></PageWrapper>

  return (
    <PageWrapper title={crew?.name ?? 'Crew Detail'} crumbs={['Platform', 'Crew', crew?.name ?? '']}>
      <button onClick={() => navigate('/platform/crew')} className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 mb-6 transition-colors">
        <ArrowLeft size={14} /> Back to Crew
      </button>

      <div className="max-w-xl">
        <div className="bg-white rounded-xl border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center">
              <HardHat size={22} className="text-stone-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-stone-900">{crew?.name}</h2>
              <p className="text-sm text-stone-500">{crew?.email}</p>
              <span className={`mt-1 inline-block text-xs font-medium ${crew?.available ? 'text-green-600' : 'text-stone-400'}`}>
                {crew?.available ? 'Available' : 'Currently Busy'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-stone-100 pt-4">
            <div>
              <p className="text-xs text-stone-400 mb-1">Average Rating</p>
              <StarDisplay rating={crew?.averageRating ?? 0} size={18} />
              <p className="text-xs text-stone-500 mt-1">{crew?.averageRating?.toFixed(1) ?? '0.0'} / 5.0</p>
            </div>
            <div>
              <p className="text-xs text-stone-400 mb-1">Jobs Completed</p>
              <p className="text-2xl font-bold text-stone-900">{crew?.totalJobsCompleted ?? 0}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => setDeleteConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium rounded-lg transition-colors"
          >
            <Trash2 size={14} /> Delete Crew Member
          </button>
        </div>
      </div>

      <ConfirmModal
        open={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Crew Member"
        description={`Permanently delete ${crew?.name}? This cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        isLoading={deleting}
      />
    </PageWrapper>
  )
}

import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Building2, CheckCircle, XCircle, PauseCircle, PlayCircle } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import StatusBadge from '../../components/ui/StatusBadge'
import SkeletonCard from '../../components/ui/SkeletonCard'
import Modal from '../../components/ui/Modal'
import ConfirmModal from '../../components/ui/ConfirmModal'
import {
  useGetPlatformCompanyByIdQuery,
  useApproveCompanyMutation,
  useRejectCompanyMutation,
  useSuspendCompanyMutation,
  useReactivateCompanyMutation,
} from '../../features/companies/companiesApi'
import { useToast } from '../../hooks/useToast'
import { formatDate } from '../../utils/formatters'

export default function CompanyDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [rejectModal, setRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [confirmAction, setConfirmAction] = useState(null)

  const { data: company, isLoading } = useGetPlatformCompanyByIdQuery(id)
  const [approve, { isLoading: approving }] = useApproveCompanyMutation()
  const [reject, { isLoading: rejecting }] = useRejectCompanyMutation()
  const [suspend, { isLoading: suspending }] = useSuspendCompanyMutation()
  const [reactivate, { isLoading: reactivating }] = useReactivateCompanyMutation()

  async function handleApprove() {
    try { await approve(id).unwrap(); toast.success('Company approved'); setConfirmAction(null) }
    catch { toast.error('Failed to approve') }
  }

  async function handleSuspend() {
    try { await suspend(id).unwrap(); toast.success('Company suspended'); setConfirmAction(null) }
    catch { toast.error('Failed to suspend') }
  }

  async function handleReactivate() {
    try { await reactivate(id).unwrap(); toast.success('Company reactivated'); setConfirmAction(null) }
    catch { toast.error('Failed to reactivate') }
  }

  async function handleReject() {
    try { await reject({ id, reason: rejectReason }).unwrap(); toast.success('Company rejected'); setRejectModal(false) }
    catch { toast.error('Failed to reject') }
  }

  if (isLoading) return <PageWrapper title="Company" crumbs={['Platform', 'Companies']}><SkeletonCard lines={6} /></PageWrapper>

  return (
    <PageWrapper title={company?.name ?? 'Company'} crumbs={['Platform', 'Companies', company?.name ?? '']}>
      <button type="button" onClick={() => navigate('/platform/companies')} className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 mb-6 transition-colors">
        <ArrowLeft size={14} /> Back to Companies
      </button>

      <div className="max-w-2xl">
        <div className="bg-white rounded-xl border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-14 h-14 rounded-xl bg-stone-100 flex items-center justify-center flex-shrink-0">
              {company?.logoUrl
                ? <img src={company.logoUrl} alt="" className="w-full h-full rounded-xl object-cover" />
                : <Building2 size={22} className="text-stone-400" />
              }
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl font-semibold text-stone-900">{company?.name}</h1>
                <StatusBadge status={company?.status} />
              </div>
              <p className="text-sm text-stone-500">{company?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm border-t border-stone-100 pt-4">
            {[
              { label: 'Phone', value: company?.contactPhone },
              { label: 'Address', value: company?.address },
              { label: 'Registered', value: formatDate(company?.registeredAt) },
              { label: 'Approved', value: company?.approvedAt ? formatDate(company.approvedAt) : '—' },
            ].map((f) => (
              <div key={f.label}>
                <p className="text-xs text-stone-400 mb-0.5">{f.label}</p>
                <p className="text-stone-700">{f.value ?? '—'}</p>
              </div>
            ))}
          </div>

          {company?.rejectionReason && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-xs text-red-500 font-medium mb-0.5">Rejection Reason</p>
              <p className="text-sm text-red-700">{company.rejectionReason}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-5 pt-4 border-t border-stone-100">
            {company?.status === 'PENDING' && (
              <>
                <button type="button" onClick={() => setConfirmAction('approve')} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors">
                  <CheckCircle size={14} /> Approve
                </button>
                <button type="button" onClick={() => setRejectModal(true)} className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium rounded-lg transition-colors">
                  <XCircle size={14} /> Reject
                </button>
              </>
            )}
            {company?.status === 'APPROVED' && (
              <button type="button" onClick={() => setConfirmAction('suspend')} className="flex items-center gap-2 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 text-sm font-medium rounded-lg transition-colors">
                <PauseCircle size={14} /> Suspend
              </button>
            )}
            {company?.status === 'SUSPENDED' && (
              <button type="button" onClick={() => setConfirmAction('reactivate')} className="flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium rounded-lg transition-colors">
                <PlayCircle size={14} /> Reactivate
              </button>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        open={confirmAction === 'approve'}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleApprove}
        title="Approve Company"
        description={`Approve ${company?.name}?`}
        confirmLabel="Approve"
        confirmVariant="primary"
        isLoading={approving}
      />
      <ConfirmModal
        open={confirmAction === 'suspend'}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleSuspend}
        title="Suspend Company"
        description={`Suspend ${company?.name}? This will revoke their access.`}
        confirmLabel="Suspend"
        confirmVariant="danger"
        isLoading={suspending}
      />
      <ConfirmModal
        open={confirmAction === 'reactivate'}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleReactivate}
        title="Reactivate Company"
        description={`Reactivate ${company?.name}?`}
        confirmLabel="Reactivate"
        confirmVariant="primary"
        isLoading={reactivating}
      />
      <Modal open={rejectModal} onClose={() => setRejectModal(false)} title="Reject Company" size="sm">
        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          rows={3}
          placeholder="Reason…"
          className="w-full rounded-lg border border-stone-200 text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700 resize-none mb-4"
        />
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => setRejectModal(false)} className="px-4 py-2 text-sm font-medium text-stone-700 bg-stone-100 rounded-lg">Cancel</button>
          <button type="button" onClick={handleReject} disabled={rejecting || !rejectReason.trim()} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-60">
            {rejecting ? 'Rejecting…' : 'Reject'}
          </button>
        </div>
      </Modal>
    </PageWrapper>
  )
}

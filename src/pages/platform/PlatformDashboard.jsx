import { useState } from 'react'
import { Building2, Truck, Wrench, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import MetricCard from '../../components/ui/MetricCard'
import StatusBadge from '../../components/ui/StatusBadge'
import ConfirmModal from '../../components/ui/ConfirmModal'
import { SkeletonMetricCard } from '../../components/ui/SkeletonCard'
import EmptyState from '../../components/ui/EmptyState'
import { useGetPlatformDashboardQuery } from '../../features/platform/platformApi'
import { useGetPlatformCompaniesQuery, useApproveCompanyMutation, useRejectCompanyMutation } from '../../features/companies/companiesApi'
import { useGetPlatformBreakdownsQuery } from '../../features/breakdowns/breakdownsApi'
import { useGetPlatformMaintenanceFlagsQuery } from '../../features/platform/platformApi'
import { useToast } from '../../hooks/useToast'
import { formatRelativeTime } from '../../utils/formatters'
import Modal from '../../components/ui/Modal'

export default function PlatformDashboard() {
  const toast = useToast()
  const { data: summary, isLoading: loadingSummary } = useGetPlatformDashboardQuery()
  const { data: companies, isLoading: loadingCompanies } = useGetPlatformCompaniesQuery()
  const { data: breakdowns } = useGetPlatformBreakdownsQuery()
  const { data: flags } = useGetPlatformMaintenanceFlagsQuery()
  const [approveCompany, { isLoading: approving }] = useApproveCompanyMutation()
  const [rejectCompany, { isLoading: rejecting }] = useRejectCompanyMutation()
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [confirmApprove, setConfirmApprove] = useState(null)

  const pendingCompanies = companies?.filter((c) => c.status === 'PENDING') ?? []
  const openBreakdowns = breakdowns?.filter((b) => b.status === 'REPORTED') ?? []
  const openFlags = flags?.filter((f) => f.status === 'OPEN') ?? []

  async function handleApprove(id) {
    try {
      await approveCompany(id).unwrap()
      toast.success('Company approved successfully')
      setConfirmApprove(null)
    } catch {
      toast.error('Failed to approve company')
    }
  }

  async function handleReject() {
    try {
      await rejectCompany({ id: rejectModal.id, reason: rejectReason }).unwrap()
      toast.success('Company rejected')
      setRejectModal(null)
      setRejectReason('')
    } catch {
      toast.error('Failed to reject company')
    }
  }

  const metrics = [
    { title: 'Total Companies', value: summary?.totalCompanies, icon: Building2 },
    { title: 'Active Companies', value: summary?.activeCompanies, icon: CheckCircle, accent: true },
    { title: 'Open Maintenance Flags', value: summary?.totalOpenFlags, icon: Wrench },
    { title: 'Total Breakdowns', value: summary?.totalBreakdowns, icon: AlertTriangle },
  ]

  return (
    <PageWrapper title="Platform Dashboard" crumbs={['Platform', 'Dashboard']}>
      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loadingSummary
          ? Array(4).fill(0).map((_, i) => <SkeletonMetricCard key={i} />)
          : metrics.map((m) => <MetricCard key={m.title} {...m} />)
        }
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending companies */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
          <div className="px-6 py-4 border-b border-stone-100">
            <h2 className="text-sm font-semibold text-stone-900">Pending Companies</h2>
            <p className="text-xs text-stone-400 mt-0.5">{pendingCompanies.length} awaiting review</p>
          </div>
          {pendingCompanies.length === 0
            ? <EmptyState icon={Building2} title="No pending companies" description="All registrations are up to date." />
            : (
              <ul className="divide-y divide-stone-100">
                {pendingCompanies.slice(0, 8).map((c) => (
                  <li key={c.id} className="px-6 py-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-stone-900 truncate">{c.name}</p>
                      <p className="text-xs text-stone-400 truncate">{c.email}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => setConfirmApprove(c)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 text-xs font-medium transition-colors"
                      >
                        <CheckCircle size={12} /> Approve
                      </button>
                      <button
                        onClick={() => setRejectModal(c)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium transition-colors"
                      >
                        <XCircle size={12} /> Reject
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )
          }
        </div>

        {/* Open Breakdowns */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
          <div className="px-6 py-4 border-b border-stone-100">
            <h2 className="text-sm font-semibold text-stone-900">Open Breakdowns</h2>
            <p className="text-xs text-stone-400 mt-0.5">{openBreakdowns.length} reported</p>
          </div>
          {openBreakdowns.length === 0
            ? <EmptyState icon={AlertTriangle} title="No open breakdowns" description="All reported breakdowns are being handled." />
            : (
              <ul className="divide-y divide-stone-100">
                {openBreakdowns.slice(0, 6).map((b) => (
                  <li key={b.id} className="px-6 py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-stone-900">{b.vehiclePlateNumber}</p>
                        <p className="text-xs text-stone-400 truncate">{b.locationDescription ?? `${b.latitude}, ${b.longitude}`}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={b.status} />
                        <span className="text-xs text-stone-400">{formatRelativeTime(b.reportedAt)}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )
          }
        </div>

        {/* Unassigned Flags */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)] lg:col-span-2">
          <div className="px-6 py-4 border-b border-stone-100">
            <h2 className="text-sm font-semibold text-stone-900">Unassigned Maintenance Flags</h2>
            <p className="text-xs text-stone-400 mt-0.5">{openFlags.length} open, no crew assigned</p>
          </div>
          {openFlags.length === 0
            ? <EmptyState icon={Wrench} title="No unassigned flags" description="All maintenance flags have assigned crew." />
            : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-stone-100 bg-stone-50">
                      {['Vehicle', 'Description', 'Trigger', 'Opened', 'Status'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {openFlags.slice(0, 8).map((f) => (
                      <tr key={f.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50">
                        <td className="px-4 py-3 text-sm font-mono text-stone-900">{f.plateNumber}</td>
                        <td className="px-4 py-3 text-sm text-stone-600 max-w-xs truncate">{f.description}</td>
                        <td className="px-4 py-3"><StatusBadge status={f.triggerType} /></td>
                        <td className="px-4 py-3 text-xs text-stone-400">{formatRelativeTime(f.openedAt)}</td>
                        <td className="px-4 py-3"><StatusBadge status={f.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        </div>
      </div>

      {/* Approve Confirm */}
      <ConfirmModal
        open={!!confirmApprove}
        onClose={() => setConfirmApprove(null)}
        onConfirm={() => handleApprove(confirmApprove?.id)}
        title="Approve Company"
        description={`Approve ${confirmApprove?.name}? They will gain full platform access.`}
        confirmLabel="Approve"
        confirmVariant="primary"
        isLoading={approving}
      />

      {/* Reject Modal */}
      <Modal open={!!rejectModal} onClose={() => { setRejectModal(null); setRejectReason('') }} title="Reject Company">
        <p className="text-sm text-stone-500 mb-4">Provide a reason for rejecting <strong>{rejectModal?.name}</strong>.</p>
        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Reason for rejection…"
          rows={3}
          className="w-full rounded-lg border border-stone-200 text-sm px-3 py-2.5 text-stone-900 placeholder-stone-400
            focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700 resize-none mb-4"
        />
        <div className="flex justify-end gap-3">
          <button onClick={() => setRejectModal(null)} className="px-4 py-2 rounded-lg text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors">Cancel</button>
          <button
            onClick={handleReject}
            disabled={rejecting || !rejectReason.trim()}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-60"
          >
            {rejecting ? 'Rejecting…' : 'Reject Company'}
          </button>
        </div>
      </Modal>
    </PageWrapper>
  )
}

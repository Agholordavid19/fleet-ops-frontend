import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Send, CheckCircle, XCircle } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import StatusBadge from '../../components/ui/StatusBadge'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import SkeletonCard from '../../components/ui/SkeletonCard'
import { StarInput, StarDisplay } from '../../components/ui/StarRating'
import {
  useGetMaintenanceFlagByIdQuery,
  useGetFlagMessagesQuery,
  useSendFlagMessageMutation,
  useApproveQuoteMutation,
  useRejectQuoteMutation,
  useResolveFlagMutation,
  useAssignCrewToFlagMutation,
} from '../../features/maintenance/maintenanceApi'
import { useGetAvailableCrewQuery } from '../../features/users/usersApi'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { formatDateTime, formatCurrency } from '../../utils/formatters'
import { cn } from '../../utils/cn'

const STEPS = [
  'OPEN', 'CREW_ASSIGNED', 'QUOTE_SUBMITTED', 'QUOTE_APPROVED',
  'IN_PROGRESS', 'PENDING_APPROVAL', 'RESOLVED',
]

const STEP_LABELS = {
  OPEN: 'Open',
  CREW_ASSIGNED: 'Assigned',
  QUOTE_SUBMITTED: 'Quote Submitted',
  QUOTE_APPROVED: 'Quote Approved',
  IN_PROGRESS: 'In Progress',
  PENDING_APPROVAL: 'Pending Approval',
  RESOLVED: 'Resolved',
}

function StatusStepper({ currentStatus }) {
  const currentIdx = STEPS.indexOf(currentStatus)
  return (
    <div className="flex items-center gap-0 overflow-x-auto pb-2">
      {STEPS.map((step, i) => {
        const done = i < currentIdx
        const active = i === currentIdx
        return (
          <div key={step} className="flex items-center flex-shrink-0">
            <div className="flex flex-col items-center gap-1.5">
              <div className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors',
                done ? 'bg-stone-900 text-white' : active ? 'bg-stone-200 text-stone-800 ring-2 ring-stone-800' : 'bg-stone-100 text-stone-400',
              )}>
                {done ? <CheckCircle size={14} /> : i + 1}
              </div>
              <span className={cn(
                'text-[10px] font-medium whitespace-nowrap',
                active ? 'text-stone-800' : done ? 'text-stone-600' : 'text-stone-400',
              )}>
                {STEP_LABELS[step]}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn('h-0.5 w-8 mx-1 mt-[-12px]', i < currentIdx ? 'bg-stone-900' : 'bg-stone-200')} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function MessageThread({ flagId, userId }) {
  const { data: messages, isLoading } = useGetFlagMessagesQuery(flagId)
  const [sendMessage, { isLoading: sending }] = useSendFlagMessageMutation()
  const [text, setText] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e) {
    e.preventDefault()
    if (!text.trim()) return
    try {
      await sendMessage({ id: flagId, message: text.trim() }).unwrap()
      setText('')
    } catch { /* ignore */ }
  }

  return (
    <div className="flex flex-col h-96">
      <div className="flex-1 overflow-y-auto space-y-3 p-4">
        {isLoading && <div className="text-center text-stone-400 text-sm">Loading messages…</div>}
        {!isLoading && (messages ?? []).length === 0 && (
          <EmptyState title="No messages yet" description="Start the conversation." />
        )}
        {(messages ?? []).map((msg) => {
          const isOwn = msg.senderId === userId
          return (
            <div key={msg.id} className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
              <div className={cn(
                'max-w-xs rounded-xl px-4 py-2.5',
                isOwn ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-900',
              )}>
                {!isOwn && <p className="text-[11px] font-medium opacity-60 mb-0.5">{msg.senderName}</p>}
                <p className="text-sm leading-snug">{msg.message}</p>
                <p className={cn('text-[11px] mt-1 opacity-50', isOwn ? 'text-right' : '')}>{formatDateTime(msg.sentAt)}</p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSend} autoComplete="on" className="flex items-center gap-3 p-4 border-t border-stone-200">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 h-9 px-3 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="w-9 h-9 bg-stone-900 hover:bg-stone-800 text-white rounded-lg flex items-center justify-center disabled:opacity-60 transition-colors"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  )
}

export default function MaintenanceDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { user, role } = useAuth()
  const [rejectQuoteModal, setRejectQuoteModal] = useState(false)
  const [rejectQuoteReason, setRejectQuoteReason] = useState('')
  const [resolveModal, setResolveModal] = useState(false)
  const [stars, setStars] = useState(0)
  const [assignModal, setAssignModal] = useState(false)
  const [selectedCrew, setSelectedCrew] = useState('')

  const { data: flag, isLoading } = useGetMaintenanceFlagByIdQuery(id)
  const [approveQuote, { isLoading: approvingQuote }] = useApproveQuoteMutation()
  const [rejectQuote, { isLoading: rejectingQuote }] = useRejectQuoteMutation()
  const [resolveFlag, { isLoading: resolving }] = useResolveFlagMutation()
  const [assignCrew, { isLoading: assigning }] = useAssignCrewToFlagMutation()
  const { data: availableCrew } = useGetAvailableCrewQuery()
  const { register: regResolve, handleSubmit: submitResolve } = useForm()

  const isAdminOrManager = ['COMPANY_ADMIN', 'FLEET_MANAGER'].includes(role)

  async function handleApproveQuote() {
    try {
      await approveQuote(id).unwrap()
      toast.success('Quotation approved')
    } catch { toast.error('Failed to approve quotation') }
  }

  async function handleRejectQuote() {
    try {
      await rejectQuote({ id, reason: rejectQuoteReason }).unwrap()
      toast.success('Quotation rejected')
      setRejectQuoteModal(false)
    } catch { toast.error('Failed to reject quotation') }
  }

  async function handleAssignCrew() {
    try {
      await assignCrew({ id, crewId: selectedCrew }).unwrap()
      toast.success('Crew assigned')
      setAssignModal(false)
      setSelectedCrew('')
    } catch { toast.error('Failed to assign crew') }
  }

  async function handleResolve(data) {
    try {
      await resolveFlag({ id, stars, comment: data.comment, actualCost: data.actualCost ? Number(data.actualCost) : undefined }).unwrap()
      toast.success('Flag resolved')
      setResolveModal(false)
    } catch { toast.error('Failed to resolve flag') }
  }

  if (isLoading) {
    return (
      <PageWrapper title="Maintenance Detail" crumbs={['Admin', 'Maintenance', 'Detail']}>
        <SkeletonCard lines={6} />
      </PageWrapper>
    )
  }

  return (
    <PageWrapper title="Maintenance Detail" crumbs={['Admin', 'Maintenance', flag?.plateNumber ?? '']}>
      <button type="button" onClick={() => navigate('/admin/maintenance')} className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 mb-6 transition-colors">
        <ArrowLeft size={14} /> Back to Maintenance
      </button>

      {/* Status Stepper */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6 mb-6">
        <StatusStepper currentStatus={flag?.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vehicle info */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6">
            <h2 className="text-sm font-semibold text-stone-900 mb-4">Flag Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-stone-400 mb-0.5">Vehicle</p>
                <p className="text-sm font-mono font-medium text-stone-900">{flag?.plateNumber}</p>
              </div>
              <div>
                <p className="text-xs text-stone-400 mb-0.5">Trigger Type</p>
                <StatusBadge status={flag?.triggerType} />
              </div>
              <div>
                <p className="text-xs text-stone-400 mb-0.5">Status</p>
                <StatusBadge status={flag?.status} />
              </div>
              <div>
                <p className="text-xs text-stone-400 mb-0.5">Assigned Crew</p>
                <p className="text-sm text-stone-700">{flag?.assignedCrewName ?? <span className="text-stone-400">Unassigned</span>}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-stone-100">
              <p className="text-xs text-stone-400 mb-1">Description</p>
              <p className="text-sm text-stone-700 leading-relaxed">{flag?.description}</p>
            </div>
            {isAdminOrManager && flag?.status === 'OPEN' && !flag?.assignedCrewId && (
              <div className="mt-4 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setAssignModal(true)}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Assign Crew
                </button>
              </div>
            )}
            {flag?.progressNotes && (
              <div className="mt-4 pt-4 border-t border-stone-100">
                <p className="text-xs text-stone-400 mb-1">Progress Notes</p>
                <p className="text-sm text-stone-700 leading-relaxed">{flag.progressNotes}</p>
              </div>
            )}
            {flag?.stars != null && flag.stars > 0 && (
              <div className="mt-4 pt-4 border-t border-stone-100">
                <p className="text-xs text-stone-400 mb-1">Crew Rating</p>
                <StarDisplay rating={flag.stars} />
              </div>
            )}
          </div>

          {/* Quotation */}
          {flag?.latestQuotation && (
            <div className="bg-white rounded-xl border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6">
              <h2 className="text-sm font-semibold text-stone-900 mb-4">Quotation</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-stone-400 mb-0.5">Estimated Cost</p>
                  <p className="text-lg font-semibold text-stone-900">{formatCurrency(flag.latestQuotation.estimatedCost)}</p>
                </div>
                {flag.latestQuotation.partsNeeded && (
                  <div>
                    <p className="text-xs text-stone-400 mb-0.5">Parts Needed</p>
                    <p className="text-sm text-stone-700">{flag.latestQuotation.partsNeeded}</p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-stone-400 mb-1">Description</p>
                <p className="text-sm text-stone-700">{flag.latestQuotation.description}</p>
              </div>
            </div>
          )}

          {/* Quote actions — gated on status + role only */}
          {flag?.status === 'QUOTE_SUBMITTED' && isAdminOrManager && (
            <div className="bg-white rounded-xl border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6">
              <h3 className="text-sm font-semibold text-stone-900 mb-1">Review Quotation</h3>
              <p className="text-sm text-stone-500 mb-4">Approve or reject the submitted quotation.</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleApproveQuote}
                  disabled={approvingQuote}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
                >
                  <CheckCircle size={14} /> Approve Quote
                </button>
                <button
                  type="button"
                  onClick={() => setRejectQuoteModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium rounded-lg transition-colors"
                >
                  <XCircle size={14} /> Reject Quote
                </button>
              </div>
            </div>
          )}

          {/* Quote Rejected Panel */}
          {flag?.status === 'QUOTE_REJECTED' && isAdminOrManager && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-stone-900 mb-1">Quotation Rejected</h3>
              <p className="text-sm text-stone-700 mb-4">The quotation was rejected. You can reassign to a different crew member, or wait for the current crew to submit a revised quotation.</p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setAssignModal(true)}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Reassign Crew
                </button>
                <span className="text-xs text-stone-500">or</span>
                <span className="text-xs text-stone-500 italic">Waiting for crew to revise quotation</span>
              </div>
            </div>
          )}

          {/* Resolve Panel */}
          {flag?.status === 'PENDING_APPROVAL' && isAdminOrManager && (
            <div className="bg-stone-100 border border-stone-300 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-stone-900 mb-1">Ready to Resolve</h3>
              <p className="text-sm text-stone-800 mb-4">The crew has marked this flag as done. Review and resolve it.</p>
              <button
                type="button"
                onClick={() => setResolveModal(true)}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Resolve Flag
              </button>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-200">
            <h2 className="text-sm font-semibold text-stone-900">Messages</h2>
          </div>
          <MessageThread flagId={id} userId={user?.userId} />
        </div>
      </div>

      {/* Assign Crew Modal */}
      <Modal open={assignModal} onClose={() => setAssignModal(false)} title="Assign Crew" size="sm">
        <p className="text-sm text-stone-500 mb-4">Assign a maintenance crew member to <strong>{flag?.plateNumber}</strong>.</p>
        <select
          value={selectedCrew}
          onChange={(e) => setSelectedCrew(e.target.value)}
          className="w-full h-9 px-3 rounded-lg border border-stone-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700 mb-4"
        >
          <option value="">Select crew member…</option>
          {(availableCrew ?? []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} — ⭐ {c.averageRating?.toFixed(1) ?? '0.0'} | {c.totalJobsCompleted ?? 0} jobs
            </option>
          ))}
        </select>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => setAssignModal(false)} className="px-4 py-2 text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg">Cancel</button>
          <button
            type="button"
            onClick={handleAssignCrew}
            disabled={assigning || !selectedCrew}
            className="px-4 py-2 text-sm font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg disabled:opacity-60"
          >
            {assigning ? 'Assigning…' : 'Assign'}
          </button>
        </div>
      </Modal>

      {/* Reject Quote Modal */}
      <Modal open={rejectQuoteModal} onClose={() => setRejectQuoteModal(false)} title="Reject Quotation" size="sm">
        <textarea
          value={rejectQuoteReason}
          onChange={(e) => setRejectQuoteReason(e.target.value)}
          placeholder="Reason for rejection…"
          rows={3}
          className="w-full rounded-lg border border-stone-200 text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700 resize-none mb-4"
        />
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => setRejectQuoteModal(false)} className="px-4 py-2 text-sm font-medium text-stone-700 bg-stone-100 rounded-lg">Cancel</button>
          <button
            type="button"
            onClick={handleRejectQuote}
            disabled={rejectingQuote || !rejectQuoteReason.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-60"
          >
            {rejectingQuote ? 'Rejecting…' : 'Reject'}
          </button>
        </div>
      </Modal>

      {/* Resolve Modal */}
      <Modal open={resolveModal} onClose={() => setResolveModal(false)} title="Resolve Flag">
        <form onSubmit={submitResolve(handleResolve)} autoComplete="on" className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Rating <span className="text-red-500">*</span></label>
            <StarInput value={stars} onChange={setStars} />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Comment</label>
            <textarea
              {...regResolve('comment')}
              rows={2}
              placeholder="Optional feedback…"
              className="w-full rounded-lg border border-stone-200 text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Actual Cost</label>
            <input
              {...regResolve('actualCost')}
              type="number"
              placeholder="0"
              className="w-full h-9 px-3 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setResolveModal(false)} className="px-4 py-2 text-sm font-medium text-stone-700 bg-stone-100 rounded-lg">Cancel</button>
            <button
              type="submit"
              disabled={resolving || stars === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg disabled:opacity-60"
            >
              {resolving ? 'Resolving…' : 'Resolve'}
            </button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  )
}

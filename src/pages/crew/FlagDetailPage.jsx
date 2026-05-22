import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Send, CheckSquare } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import StatusBadge from '../../components/ui/StatusBadge'
import SkeletonCard from '../../components/ui/SkeletonCard'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import {
  useGetMaintenanceFlagByIdQuery,
  useGetFlagMessagesQuery,
  useSendFlagMessageMutation,
  useSubmitQuotationMutation,
  useReviseQuotationMutation,
  useUpdateProgressMutation,
  useMarkDoneMutation,
} from '../../features/maintenance/maintenanceApi'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { formatDateTime, formatCurrency } from '../../utils/formatters'
import { cn } from '../../utils/cn'

export default function FlagDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useAuth()
  const [quotationModal, setQuotationModal] = useState(false)
  const [progressModal, setProgressModal] = useState(false)
  const [msgText, setMsgText] = useState('')
  const bottomRef = useRef(null)

  const { data: flag, isLoading } = useGetMaintenanceFlagByIdQuery(id)
  const { data: messages } = useGetFlagMessagesQuery(id)
  const [sendMessage, { isLoading: sending }] = useSendFlagMessageMutation()
  const [submitQuotation, { isLoading: submittingQuote }] = useSubmitQuotationMutation()
  const [reviseQuotation, { isLoading: revisingQuote }] = useReviseQuotationMutation()
  const [updateProgress, { isLoading: updatingProgress }] = useUpdateProgressMutation()
  const [markDone, { isLoading: markingDone }] = useMarkDoneMutation()

  const { register: regQuote, handleSubmit: submitQuote, reset: resetQuote } = useForm()
  const { register: regProgress, handleSubmit: submitProgress } = useForm()

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function handleSend(e) {
    e.preventDefault()
    if (!msgText.trim()) return
    try { await sendMessage({ id, message: msgText.trim() }).unwrap(); setMsgText('') } catch {}
  }

  async function handleQuotation(data) {
    try {
      const fn = flag?.status === 'QUOTATION_REJECTED' ? reviseQuotation : submitQuotation
      await fn({ id, ...data, estimatedCost: Number(data.estimatedCost) }).unwrap()
      toast.success('Quotation submitted')
      resetQuote()
      setQuotationModal(false)
    } catch { toast.error('Failed to submit quotation') }
  }

  async function handleProgress(data) {
    try {
      await updateProgress({ id, progressNotes: data.progressNotes }).unwrap()
      toast.success('Progress updated')
      setProgressModal(false)
    } catch { toast.error('Failed to update progress') }
  }

  async function handleMarkDone() {
    try {
      await markDone(id).unwrap()
      toast.success('Marked as done — awaiting approval')
    } catch { toast.error('Failed to mark as done') }
  }

  if (isLoading) return <PageWrapper title="Flag Detail" crumbs={['Crew', 'Flags']}><SkeletonCard lines={5} /></PageWrapper>

  return (
    <PageWrapper title="Flag Detail" crumbs={['Crew', 'My Flags', flag?.plateNumber ?? '']}>
      <button onClick={() => navigate('/crew/flags')} className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 mb-6 transition-colors">
        <ArrowLeft size={14} /> Back to Flags
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-lg font-mono font-semibold text-stone-900">{flag?.plateNumber}</h2>
              <StatusBadge status={flag?.status} />
              <StatusBadge status={flag?.triggerType} />
            </div>
            <p className="text-sm text-stone-700 mb-4">{flag?.description}</p>
            {flag?.progressNotes && (
              <div className="bg-stone-50 rounded-lg p-3">
                <p className="text-xs text-stone-400 mb-1">Progress Notes</p>
                <p className="text-sm text-stone-700">{flag.progressNotes}</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 mt-5 pt-4 border-t border-stone-100">
              {(flag?.status === 'ASSIGNED' || flag?.status === 'QUOTATION_REJECTED') && (
                <button onClick={() => setQuotationModal(true)}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium rounded-lg transition-colors">
                  {flag?.status === 'QUOTATION_REJECTED' ? 'Revise Quotation' : 'Submit Quotation'}
                </button>
              )}
              {flag?.status === 'IN_PROGRESS' && (
                <>
                  <button onClick={() => setProgressModal(true)}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-medium rounded-lg transition-colors">
                    Update Progress
                  </button>
                  <button onClick={handleMarkDone} disabled={markingDone}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60">
                    <CheckSquare size={14} />
                    {markingDone ? 'Marking…' : 'Mark as Done'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Quotation */}
          {flag?.quotation && (
            <div className="bg-white rounded-xl border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6">
              <h3 className="text-sm font-semibold text-stone-900 mb-3">My Quotation</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-stone-400 mb-0.5">Estimated Cost</p><p className="font-semibold">{formatCurrency(flag.quotation.estimatedCost)}</p></div>
                <div><p className="text-xs text-stone-400 mb-0.5">Parts Needed</p><p>{flag.quotation.partsNeeded ?? '—'}</p></div>
              </div>
              <p className="text-sm text-stone-600 mt-3">{flag.quotation.description}</p>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-200">
            <h2 className="text-sm font-semibold text-stone-900">Messages</h2>
          </div>
          <div className="flex flex-col h-80">
            <div className="flex-1 overflow-y-auto space-y-3 p-4">
              {(messages ?? []).length === 0 && <EmptyState title="No messages" description="Start the conversation." />}
              {(messages ?? []).map((msg) => {
                const isOwn = msg.senderId === user?.userId
                return (
                  <div key={msg.id} className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
                    <div className={cn('max-w-xs rounded-xl px-3 py-2', isOwn ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-900')}>
                      {!isOwn && <p className="text-[10px] font-medium opacity-60 mb-0.5">{msg.senderName}</p>}
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>
            <form onSubmit={handleSend} className="flex items-center gap-2 p-3 border-t border-stone-200">
              <input type="text" value={msgText} onChange={(e) => setMsgText(e.target.value)} placeholder="Message…"
                className="flex-1 h-9 px-3 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700" />
              <button type="submit" disabled={sending || !msgText.trim()}
                className="w-9 h-9 bg-stone-900 hover:bg-stone-800 text-white rounded-lg flex items-center justify-center disabled:opacity-60">
                <Send size={13} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Quotation Modal */}
      <Modal open={quotationModal} onClose={() => setQuotationModal(false)} title="Submit Quotation" size="sm">
        <form onSubmit={submitQuote(handleQuotation)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Estimated Cost <span className="text-red-500">*</span></label>
            <input {...regQuote('estimatedCost', { required: 'Required', min: 0 })} type="number" placeholder="0"
              className="w-full h-9 px-3 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Description <span className="text-red-500">*</span></label>
            <textarea {...regQuote('description', { required: 'Required' })} rows={3} placeholder="Work to be done…"
              className="w-full rounded-lg border border-stone-200 text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Parts Needed</label>
            <input {...regQuote('partsNeeded')} placeholder="Optional list of parts…"
              className="w-full h-9 px-3 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700" />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setQuotationModal(false)} className="px-4 py-2 text-sm font-medium text-stone-700 bg-stone-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={submittingQuote || revisingQuote} className="px-4 py-2 text-sm font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg disabled:opacity-60">
              {submittingQuote || revisingQuote ? 'Submitting…' : 'Submit Quotation'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Progress Modal */}
      <Modal open={progressModal} onClose={() => setProgressModal(false)} title="Update Progress" size="sm">
        <form onSubmit={submitProgress(handleProgress)} className="space-y-4">
          <textarea {...regProgress('progressNotes', { required: 'Required' })}
            defaultValue={flag?.progressNotes}
            rows={4} placeholder="Describe current progress…"
            className="w-full rounded-lg border border-stone-200 text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700 resize-none" />
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setProgressModal(false)} className="px-4 py-2 text-sm font-medium text-stone-700 bg-stone-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={updatingProgress} className="px-4 py-2 text-sm font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg disabled:opacity-60">
              {updatingProgress ? 'Updating…' : 'Update'}
            </button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  )
}

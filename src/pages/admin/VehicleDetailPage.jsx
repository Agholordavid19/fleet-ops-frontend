import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Download, Gauge, DollarSign, AlertTriangle, Wrench, Activity, Edit2, AlertCircle, Images, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react'
import CloudinaryUpload from '../../components/ui/CloudinaryUpload'
import PageWrapper from '../../components/layout/PageWrapper'
import StatusBadge from '../../components/ui/StatusBadge'
import SkeletonCard from '../../components/ui/SkeletonCard'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import { selectToken } from '../../features/auth/authSlice'
import { useGetVehicleByIdQuery, useGetVehicleHealthQuery, useUpdateMilestoneIntervalMutation, useBulkUploadVehicleMediaMutation, useDeleteVehicleMediaMutation } from '../../features/vehicles/vehiclesApi'
import { useGetVehicleMaintenanceFlagsQuery } from '../../features/maintenance/maintenanceApi'
import { useGetMileageLogsQuery } from '../../features/users/usersApi'
import { useToast } from '../../hooks/useToast'
import { formatMileage, formatCurrency, formatDate, formatRelativeTime } from '../../utils/formatters'
import { healthGradeColors } from '../../utils/statusColors'
import { cn } from '../../utils/cn'

const TABS = ['Maintenance', 'Images', 'Mileage Logs', 'Activity']

function HealthGauge({ score, grade }) {
  const gradeColor = {
    EXCELLENT: '#16A34A', GOOD: '#0D9488', FAIR: '#D97706', POOR: '#EA580C', CRITICAL: '#DC2626',
  }[grade] ?? '#A8A29E'

  const r = 54
  const circ = 2 * Math.PI * r
  const dash = ((score ?? 0) / 100) * circ

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36">
        <svg width="144" height="144" className="rotate-[-90deg]">
          <circle cx="72" cy="72" r={r} fill="none" stroke="#F5F5F4" strokeWidth="12" />
          <circle
            cx="72" cy="72" r={r} fill="none"
            stroke={gradeColor} strokeWidth="12"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.8s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-stone-900">{Math.round(score ?? 0)}</span>
          <span className="text-xs text-stone-400 mt-0.5">/ 100</span>
        </div>
      </div>
      <span className={cn('mt-2 text-sm font-semibold px-3 py-1 rounded-full', healthGradeColors[grade] ?? 'bg-stone-100 text-stone-600')}>
        {grade ?? '—'}
      </span>
    </div>
  )
}

export default function VehicleDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [activeTab, setActiveTab] = useState('Maintenance')
  const [milestoneModal, setMilestoneModal] = useState(false)

  const { data: vehicle, isLoading } = useGetVehicleByIdQuery(id)
  useGetVehicleHealthQuery(id)
  const { data: maintenanceFlags } = useGetVehicleMaintenanceFlagsQuery(id)
  const { data: mileageLogs } = useGetMileageLogsQuery(id)
  const [updateMilestone, { isLoading: updatingMilestone }] = useUpdateMilestoneIntervalMutation()
  const [bulkUploadMedia, { isLoading: bulkUploadingMedia }] = useBulkUploadVehicleMediaMutation()
  const [deleteMedia, { isLoading: deletingMedia }] = useDeleteVehicleMediaMutation()
  const { register: regMilestone, handleSubmit: submitMilestone, reset: resetMilestone } = useForm()
  const token = useSelector(selectToken)

  const [lightboxIdx, setLightboxIdx] = useState(null)
  const [pendingImages, setPendingImages] = useState([])

  const mediaList = vehicle?.images ?? []
  async function handleDownloadPdf() {
    try {
      const url = `${import.meta.env.VITE_API_BASE_URL}/api/vehicles/${id}/lifecycle.pdf`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/pdf',
        },
      })

      if (!response.ok) {
        toast.error(`Failed to download PDF: ${response.status}`)
        return
      }

      const blob = await response.blob()
      const fileUrl = window.URL.createObjectURL(blob)
      window.open(fileUrl, '_blank')
    } catch (error) {
      toast.error('Could not connect to backend to download PDF'+ error)
    }
  }

  function removePending(idx) {
    setPendingImages(prev => prev.filter((_, i) => i !== idx))
  }

  async function handleBulkSave() {
    if (pendingImages.length === 0) return
    try {
      await bulkUploadMedia({ id, media: pendingImages }).unwrap()
      toast.success(`${pendingImages.length} image${pendingImages.length > 1 ? 's' : ''} saved`)
      setPendingImages([])
    } catch { toast.error('Failed to save images') }
  }

  async function handleDeleteMedia(publicId) {
    try {
      await deleteMedia({ id, mediaId: publicId }).unwrap()
      toast.success('Image removed')
      setLightboxIdx(null)
    } catch { toast.error('Failed to remove image') }
  }

  async function handleMilestoneUpdate({ milestoneInterval }) {
    try {
      await updateMilestone({ id, milestoneInterval: Number(milestoneInterval) }).unwrap()
      toast.success('Milestone interval updated')
      setMilestoneModal(false)
      resetMilestone()
    } catch {
      toast.error('Failed to update milestone interval')
    }
  }

  if (isLoading) {
    return (
      <PageWrapper title="Vehicle Detail" crumbs={['Admin', 'Vehicles', 'Detail']}>
        <SkeletonCard lines={5} />
      </PageWrapper>
    )
  }

  if (!vehicle) {
    return (
      <PageWrapper title="Vehicle Detail" crumbs={['Admin', 'Vehicles', 'Detail']}>
        <EmptyState icon={AlertTriangle} title="Vehicle not found" />
      </PageWrapper>
    )
  }

  return (
    <PageWrapper title={vehicle.plateNumber} crumbs={['Admin', 'Vehicles', vehicle.plateNumber]}>
      {/* Back */}
      <button
        type="button"
        onClick={() => navigate('/admin/vehicles')}
        className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 mb-6 transition-colors"
      >
        <ArrowLeft size={14} /> Back to Vehicles
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-mono font-bold text-stone-900">{vehicle.plateNumber}</h1>
              <StatusBadge status={vehicle.status} />
              {vehicle.healthGrade && vehicle.status !== 'BROKEN_DOWN' && <StatusBadge status={vehicle.healthGrade} />}
            </div>
            <p className="text-lg text-stone-600">{vehicle.make} {vehicle.model}</p>
            {vehicle.markedForSale && (
              <div className="mt-3 flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 w-fit">
                <AlertCircle size={14} /> This vehicle is recommended for sale
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="flex items-center gap-2 px-4 py-2 border border-stone-200 hover:bg-stone-50 text-stone-700 text-sm font-medium rounded-lg transition-colors flex-shrink-0"
          >
            <Download size={14} /> Lifecycle PDF
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Current Mileage', value: formatMileage(vehicle.currentMileage), icon: Gauge },
          { label: 'Total Maintenance Spend', value: formatCurrency(vehicle.totalMaintenanceSpend), icon: DollarSign },
          { label: 'Breakdown Count', value: vehicle.breakdownCount ?? 0, icon: AlertTriangle },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center">
                <s.icon size={16} className="text-stone-500" />
              </div>
              <div>
                <p className="text-xs text-stone-400 font-medium">{s.label}</p>
                <p className="text-lg font-semibold text-stone-900">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Health Panel */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6">
          <h2 className="text-sm font-semibold text-stone-900 mb-6">Vehicle Health</h2>
          <HealthGauge score={vehicle.healthScore} grade={vehicle.healthGrade} />
        </div>

        {/* Lifecycle Panel */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-stone-900">Lifecycle</h2>
            <button
              type="button"
              onClick={() => setMilestoneModal(true)}
              className="flex items-center gap-1.5 text-xs text-stone-800 hover:text-stone-800 font-medium"
            >
              <Edit2 size={11} /> Update interval
            </button>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-stone-500">Lifecycle progress</span>
              <span className="font-semibold text-stone-900">{vehicle.lifecyclePercentage?.toFixed(1) ?? 0}%</span>
            </div>
            <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-stone-700 rounded-full transition-all duration-700"
                style={{ width: `${vehicle.lifecyclePercentage ?? 0}%` }}
              />
            </div>
            <p className="text-xs text-stone-400 mt-3">
              Milestone interval: <span className="font-medium text-stone-600">{formatMileage(vehicle.milestoneInterval)}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        <div className="flex border-b border-stone-200 px-6">
          {TABS.map((tab) => (
            <button
              type="button"
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'py-4 px-1 mr-6 text-sm font-medium border-b-2 -mb-px transition-colors',
                activeTab === tab
                  ? 'border-stone-800 text-stone-800'
                  : 'border-transparent text-stone-500 hover:text-stone-800',
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'Maintenance' && (
            (maintenanceFlags ?? []).length === 0
              ? <EmptyState icon={Wrench} title="No maintenance history" />
              : (
                <div className="space-y-2">
                  {maintenanceFlags.map((f) => (
                    <div key={f.id} className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-stone-50 border border-stone-100 transition-colors">
                      <div>
                        <p className="text-sm font-medium text-stone-900">{f.description}</p>
                        <p className="text-xs text-stone-400">{formatRelativeTime(f.openedAt)}</p>
                      </div>
                      <StatusBadge status={f.status} />
                    </div>
                  ))}
                </div>
              )
          )}

          {activeTab === 'Mileage Logs' && (
            (mileageLogs ?? []).length === 0
              ? <EmptyState icon={Gauge} title="No mileage logs" />
              : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-stone-100">
                      {['Date', 'Reported Mileage', 'Trip'].map((h) => (
                        <th key={h} className="pb-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mileageLogs.map((log) => (
                      <tr key={log.id} className="border-b border-stone-100 last:border-0">
                        <td className="py-3 text-sm text-stone-700">{formatDate(log.loggedAt)}</td>
                        <td className="py-3 text-sm text-stone-900 font-medium">{formatMileage(log.reportedMileage)}</td>
                        <td className="py-3 text-xs text-stone-400">{log.tripRequestId ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
          )}

          {activeTab === 'Images' && (
            <div className="space-y-6">
              {/* Saved image grid */}
              {mediaList.length === 0 && pendingImages.length === 0 ? (
                <EmptyState icon={Images} title="No images yet" description="Add images below to document this vehicle." />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {mediaList.map((img, idx) => (
                    <div
                      key={img.id ?? idx}
                      onClick={() => setLightboxIdx(idx)}
                      className="relative aspect-square rounded-lg overflow-hidden bg-stone-100 cursor-pointer group"
                    >
                      <img src={img.url} alt={`Vehicle ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    </div>
                  ))}
                </div>
              )}

              {/* Pending images queue */}
              {pendingImages.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-2">Pending ({pendingImages.length})</p>
                  <div className="flex flex-wrap gap-3">
                    {pendingImages.map((img, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden bg-stone-100">
                        <img src={img.url} alt={`Pending ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePending(idx)}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-stone-700 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors shadow-sm"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add new images */}
              <div className="border-t border-stone-100 pt-4">
                <p className="text-sm font-medium text-stone-700 mb-3">Add Images</p>
                <CloudinaryUpload
                  value=""
                  onUpload={(url, publicId) => setPendingImages(prev => [...prev, { url, publicId }])}
                  label="Upload image"
                />
                {pendingImages.length > 0 && (
                  <button
                    type="button"
                    onClick={handleBulkSave}
                    disabled={bulkUploadingMedia}
                    className="mt-3 px-4 py-2 text-sm font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg disabled:opacity-60 transition-colors"
                  >
                    {bulkUploadingMedia ? 'Saving…' : `Save ${pendingImages.length} image${pendingImages.length > 1 ? 's' : ''} to vehicle`}
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'Activity' && (
            <EmptyState icon={Activity} title="Activity filtered by vehicle" description="Check the Activity Logs page for vehicle-specific events." />
          )}
        </div>
      </div>

      {/* Image lightbox */}
      {lightboxIdx !== null && mediaList[lightboxIdx] && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setLightboxIdx(null)}>
          <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={mediaList[lightboxIdx].url}
              alt={`Vehicle ${lightboxIdx + 1}`}
              className="w-full max-h-[70vh] object-contain rounded-lg"
            />
            <div className="absolute top-3 right-3 flex gap-2">
              <button
                type="button"
                onClick={() => handleDeleteMedia(mediaList[lightboxIdx].publicId)}
                disabled={deletingMedia}
                className="p-2 bg-red-600/90 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-60"
                title="Delete image"
              >
                <Trash2 size={16} />
              </button>
              <button
                type="button"
                onClick={() => setLightboxIdx(null)}
                className="p-2 bg-black/60 hover:bg-black/80 text-white rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            {mediaList.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setLightboxIdx((i) => (i - 1 + mediaList.length) % mediaList.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black/80 text-white rounded-lg"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxIdx((i) => (i + 1) % mediaList.length)}
                  className="absolute right-16 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black/80 text-white rounded-lg"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}
            <p className="text-center text-white/60 text-xs mt-3">{lightboxIdx + 1} / {mediaList.length}</p>
          </div>
        </div>
      )}

      {/* Milestone Modal */}
      <Modal open={milestoneModal} onClose={() => setMilestoneModal(false)} title="Update Milestone Interval" size="sm">
        <form onSubmit={submitMilestone(handleMilestoneUpdate)} autoComplete="on">
          <div className="mb-4">
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Interval (km)</label>
            <input
              {...regMilestone('milestoneInterval', { required: 'Required', min: 1 })}
              type="number"
              defaultValue={vehicle.milestoneInterval}
              className="w-full h-9 px-3 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setMilestoneModal(false)} className="px-4 py-2 text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg">Cancel</button>
            <button type="submit" disabled={updatingMilestone} className="px-4 py-2 text-sm font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg disabled:opacity-60">
              {updatingMilestone ? 'Updating…' : 'Update'}
            </button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Truck, Plus, Gauge, X, ImagePlus } from 'lucide-react'
import CloudinaryUpload from '../../components/ui/CloudinaryUpload'
import { motion } from 'framer-motion'
import PageWrapper from '../../components/layout/PageWrapper'
import StatusBadge from '../../components/ui/StatusBadge'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import { SkeletonVehicleCard } from '../../components/ui/SkeletonCard'
import { FilterBar, SearchInput, SelectFilter } from '../../components/ui/FilterBar'
import {
  useGetVehiclesQuery,
  useCreateVehicleMutation,
  useUploadVehicleMediaMutation,
} from '../../features/vehicles/vehiclesApi'
import { useToast } from '../../hooks/useToast'
import { formatMileage } from '../../utils/formatters'
import { healthGradeBarColors, healthGradeColors } from '../../utils/statusColors'
import { cn } from '../../utils/cn'

function VehicleCard({ vehicle, onClick }) {
  const gradeBar = healthGradeBarColors[vehicle.healthGrade] ?? 'bg-stone-300'
  const gradeText = healthGradeColors[vehicle.healthGrade] ?? 'bg-stone-100 text-stone-600'
  const firstImage = vehicle.images?.[0]?.url ?? null

  return (
      <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={onClick}
          className="bg-white rounded-xl border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden cursor-pointer hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-200"
      >
        <div className="h-36 bg-gradient-to-br from-stone-100 to-stone-200 relative flex items-center justify-center overflow-hidden">
          {firstImage
              ? <img src={firstImage} alt={vehicle.plateNumber} className="w-full h-full object-cover" />
              : <Truck size={40} className="text-stone-300" />
          }
          <div className="absolute top-3 right-3">
            <StatusBadge status={vehicle.status} />
          </div>
          {vehicle.images?.length > 1 && (
              <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-md">
                +{vehicle.images.length - 1} photos
              </div>
          )}
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <p className="text-sm font-semibold text-stone-900">{vehicle.make} {vehicle.model}</p>
              <p className="text-xs font-mono text-stone-400">{vehicle.plateNumber}</p>
            </div>
            <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full', gradeText)}>
            {vehicle.healthGrade}
          </span>
          </div>

          <div className="mt-3 mb-2">
            <div className="flex justify-between text-xs text-stone-400 mb-1">
              <span>Health Score</span>
              <span className="font-medium text-stone-700">{vehicle.healthScore ?? 0}/100</span>
            </div>
            <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div
                  className={cn('h-full rounded-full transition-all duration-500', gradeBar)}
                  style={{ width: `${vehicle.healthScore ?? 0}%` }}
              />
            </div>
          </div>

          {vehicle.lifecyclePercentage != null && (
              <div className="mb-3">
                <div className="flex justify-between text-xs text-stone-400 mb-1">
                  <span>Lifecycle</span>
                  <span>{vehicle.lifecyclePercentage?.toFixed(0)}%</span>
                </div>
                <div className="h-1 bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-stone-700 rounded-full" style={{ width: `${vehicle.lifecyclePercentage}%` }} />
                </div>
              </div>
          )}

          <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-3">
            <Gauge size={12} />
            <span>{formatMileage(vehicle.currentMileage)}</span>
          </div>
        </div>
      </motion.div>
  )
}

export default function VehiclesPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [gradeFilter, setGradeFilter] = useState('')
  const [imageRows, setImageRows] = useState([{ imageUrl: '', imageId: '' }])

  const { data: vehicles, isLoading } = useGetVehiclesQuery()
  const [createVehicle, { isLoading: creating }] = useCreateVehicleMutation()
  const [uploadVehicleMedia, { isLoading: uploading }] = useUploadVehicleMediaMutation()
  const { register, handleSubmit, formState: { errors }, reset } = useForm()

  const filtered = (vehicles ?? []).filter((v) => {
    const q = search.toLowerCase()
    const matchesSearch = !q || v.make?.toLowerCase().includes(q) || v.model?.toLowerCase().includes(q) || v.plateNumber?.toLowerCase().includes(q)
    const matchesStatus = !statusFilter || v.status === statusFilter
    const matchesGrade = !gradeFilter || v.healthGrade === gradeFilter
    return matchesSearch && matchesStatus && matchesGrade
  })

  function addImageRow() {
    setImageRows((rows) => [...rows, { imageUrl: '', imageId: '' }])
  }

  function removeImageRow(idx) {
    setImageRows((rows) => rows.filter((_, i) => i !== idx))
  }

  function updateImageRow(idx, imageUrl, imageId) {
    setImageRows((rows) => rows.map((r, i) => i === idx ? { imageUrl, imageId } : r))
  }

  function closeModal() {
    setModalOpen(false)
    reset()
    setImageRows([{ imageUrl: '', imageId: '' }])
  }

  async function onSubmit(data) {
    try {
      // Step 1: create vehicle — no images in this payload
      const vehicle = await createVehicle({
        make: data.make,
        model: data.model,
        plateNumber: data.plateNumber,
        milestoneInterval: data.milestoneInterval ? Number(data.milestoneInterval) : undefined,
        purchasePrice: data.purchasePrice ? Number(data.purchasePrice) : undefined,
        purchaseDate: data.purchaseDate || undefined,
      }).unwrap()

      // Step 2: attach each uploaded image to the created vehicle
      const validImages = imageRows.filter((r) => r.imageUrl && r.imageId)
      if (validImages.length > 0) {
        await Promise.all(
            validImages.map((r) =>
                uploadVehicleMedia({
                  id: vehicle.id,
                  url: r.imageUrl,
                  publicId: r.imageId,
                }).unwrap()
            )
        )
      }

      toast.success('Vehicle registered successfully')
      closeModal()
    } catch (err) {
      toast.error(err?.data?.message ?? 'Failed to register vehicle')
    }
  }

  const isBusy = creating || uploading

  return (
      <PageWrapper title="Vehicles" crumbs={['Admin', 'Vehicles']}>
        <div className="flex items-center justify-between mb-6">
          <FilterBar className="mb-0">
            <SearchInput value={search} onChange={setSearch} placeholder="Search plate, make, model…" />
            <SelectFilter
                value={statusFilter}
                onChange={setStatusFilter}
                placeholder="All statuses"
                options={[
                  { value: 'AVAILABLE', label: 'Available' },
                  { value: 'IN_USE', label: 'In Use' },
                  { value: 'MAINTENANCE', label: 'Maintenance' },
                  { value: 'DECOMMISSIONED', label: 'Decommissioned' },
                ]}
            />
            <SelectFilter
                value={gradeFilter}
                onChange={setGradeFilter}
                placeholder="All grades"
                options={['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'CRITICAL'].map((g) => ({ value: g, label: g }))}
            />
          </FilterBar>
          <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium rounded-lg transition-colors flex-shrink-0"
          >
            <Plus size={15} /> Register Vehicle
          </button>
        </div>

        {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array(6).fill(0).map((_, i) => <SkeletonVehicleCard key={i} />)}
            </div>
        ) : filtered.length === 0 ? (
            <EmptyState
                icon={Truck}
                title="No vehicles found"
                description="Register your first vehicle to get started."
                action={
                  <button onClick={() => setModalOpen(true)} className="px-4 py-2 bg-stone-900 text-white text-sm font-medium rounded-lg">
                    Register Vehicle
                  </button>
                }
            />
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((v) => (
                  <VehicleCard key={v.id} vehicle={v} onClick={() => navigate(`/admin/vehicles/${v.id}`)} />
              ))}
            </div>
        )}

        <Modal open={modalOpen} onClose={closeModal} title="Register Vehicle" size="md">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Make <span className="text-red-500">*</span>
                </label>
                <input
                    {...register('make', { required: 'Required' })}
                    placeholder="Toyota"
                    className="w-full h-9 px-3 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700"
                />
                {errors.make && <p className="text-xs text-red-600 mt-1">{errors.make.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Model <span className="text-red-500">*</span>
                </label>
                <input
                    {...register('model', { required: 'Required' })}
                    placeholder="Hilux"
                    className="w-full h-9 px-3 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700"
                />
                {errors.model && <p className="text-xs text-red-600 mt-1">{errors.model.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Plate Number <span className="text-red-500">*</span>
              </label>
              <input
                  {...register('plateNumber', {
                    required: 'Required',
                    pattern: { value: /^[A-Z]{3}-\d{3}[A-Z]{2}$/, message: 'Format: AAA-000AA' },
                  })}
                  placeholder="ABC-123XY"
                  className="w-full h-9 px-3 rounded-lg border border-stone-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700"
              />
              {errors.plateNumber && <p className="text-xs text-red-600 mt-1">{errors.plateNumber.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Milestone Interval (km)</label>
                <input
                    {...register('milestoneInterval')}
                    type="number"
                    placeholder="10000"
                    className="w-full h-9 px-3 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Purchase Price</label>
                <input
                    {...register('purchasePrice')}
                    type="number"
                    placeholder="25000"
                    className="w-full h-9 px-3 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Purchase Date</label>
              <input
                  {...register('purchaseDate')}
                  type="date"
                  className="w-full h-9 px-3 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700"
              />
            </div>

            {/* Vehicle Images */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-stone-700 flex items-center gap-1.5">
                  <ImagePlus size={14} className="text-stone-400" /> Vehicle Images
                </label>
                <button
                    type="button"
                    onClick={addImageRow}
                    className="text-xs text-stone-600 hover:text-stone-900 font-medium flex items-center gap-1"
                >
                  <Plus size={11} /> Add slot
                </button>
              </div>
              <div className="flex flex-wrap gap-3">
                {imageRows.map((row, idx) => (
                    <div key={idx} className="relative">
                      <CloudinaryUpload
                          value={row.imageUrl}
                          onUpload={(url, id) => updateImageRow(idx, url, id)}
                          onRemove={() => updateImageRow(idx, '', '')}
                          label="Upload"
                      />
                      {imageRows.length > 1 && !row.imageUrl && (
                          <button
                              type="button"
                              onClick={() => removeImageRow(idx)}
                              className="absolute -top-1 -right-1 w-4 h-4 bg-stone-400 hover:bg-red-500 rounded-full flex items-center justify-center text-white transition-colors"
                          >
                            <X size={8} />
                          </button>
                      )}
                    </div>
                ))}
              </div>
              <p className="text-xs text-stone-400 mt-2">Images are optional. Upload from your device.</p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                  type="button"
                  onClick={closeModal}
                  disabled={isBusy}
                  className="px-4 py-2 text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                  type="submit"
                  disabled={isBusy}
                  className="px-4 py-2 text-sm font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors disabled:opacity-60"
              >
                {creating ? 'Registering…' : uploading ? 'Uploading images…' : 'Register Vehicle'}
              </button>
            </div>
          </form>
        </Modal>
      </PageWrapper>
  )
}
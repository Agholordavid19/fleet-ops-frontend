import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { MapPin, Navigation, CheckCircle, AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'
import PageWrapper from '../../components/layout/PageWrapper'
import { useReportBreakdownMutation } from '../../features/breakdowns/breakdownsApi'
import { useGetMyApprovedTripsQuery } from '../../features/trips/tripsApi'
import { useToast } from '../../hooks/useToast'

export default function ReportBreakdownPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [submitted, setSubmitted] = useState(false)
  const [locating, setLocating] = useState(false)

  const { data: approvedTrips } = useGetMyApprovedTripsQuery()
  const [reportBreakdown, { isLoading }] = useReportBreakdownMutation()
  const { register, handleSubmit, setValue, formState: { errors } } = useForm()

  // Only show vehicles tied to the worker's active/approved trips
  const tripVehicles = useMemo(() => {
    const seen = new Set()
    return (approvedTrips ?? []).reduce((acc, t) => {
      if (t.vehicleId && !seen.has(t.vehicleId)) {
        seen.add(t.vehicleId)
        acc.push({ id: t.vehicleId, plateNumber: t.plateNumber, make: t.make, model: t.model })
      }
      return acc
    }, [])
  }, [approvedTrips])

  function getLocation() {
    if (!navigator.geolocation) { toast.warning('Geolocation not supported'); return }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue('latitude', pos.coords.latitude)
        setValue('longitude', pos.coords.longitude)
        toast.success('Location detected')
        setLocating(false)
      },
      () => { toast.error('Could not get location'); setLocating(false) },
    )
  }

  async function onSubmit(data) {
    try {
      await reportBreakdown({
        ...data,
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
      }).unwrap()
      setSubmitted(true)
    } catch (err) {
      toast.error(err?.data?.message ?? 'Failed to report breakdown')
    }
  }

  if (submitted) {
    return (
      <PageWrapper title="Report Breakdown" crumbs={['Staff', 'Breakdown']}>
        <div className="max-w-md mx-auto text-center py-12">
          <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={28} className="text-green-500" />
          </div>
          <h2 className="text-xl font-semibold text-stone-900 mb-2">Breakdown reported!</h2>
          <p className="text-sm text-stone-500 mb-6">Our team has been notified and will respond shortly.</p>
          <button onClick={() => navigate('/staff/dashboard')} className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium rounded-lg transition-colors">
            Back to Dashboard
          </button>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper title="Report Breakdown" crumbs={['Staff', 'Report Breakdown']}>
      <div className="max-w-lg">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700">Report vehicle breakdowns for immediate assistance. Your location helps us respond faster.</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Vehicle <span className="text-red-500">*</span></label>
              <select {...register('vehicleId', { required: 'Required' })}
                className="w-full h-9 px-3 rounded-lg border border-stone-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700">
                <option value="">Select vehicle from your active trips…</option>
                {tripVehicles.map((v) => (
                  <option key={v.id} value={v.id}>{v.plateNumber}{v.make ? ` — ${v.make} ${v.model}` : ''}</option>
                ))}
              </select>
              {tripVehicles.length === 0 && (
                <p className="text-xs text-stone-400 mt-1">No vehicles found — you must have an approved trip to report a breakdown.</p>
              )}
              {errors.vehicleId && <p className="text-xs text-red-600 mt-1">{errors.vehicleId.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Description <span className="text-red-500">*</span></label>
              <textarea {...register('description', { required: 'Required' })} rows={3}
                placeholder="Describe what happened…"
                className="w-full rounded-lg border border-stone-200 text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700 resize-none" />
              {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Location Description</label>
              <input {...register('locationDescription')} placeholder="Near Westgate Mall, main road…"
                className="w-full h-9 px-3 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700" />
            </div>

            {/* GPS */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-stone-700">GPS Coordinates <span className="text-red-500">*</span></label>
                <button type="button" onClick={getLocation} disabled={locating}
                  className="flex items-center gap-1 text-xs text-stone-800 hover:text-stone-800 font-medium disabled:opacity-60">
                  <Navigation size={11} /> {locating ? 'Detecting…' : 'Auto-detect'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input {...register('latitude', { required: 'Required' })} type="number" step="any" placeholder="Latitude"
                    className="w-full h-9 px-3 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700" />
                  {errors.latitude && <p className="text-xs text-red-600 mt-1">{errors.latitude.message}</p>}
                </div>
                <div>
                  <input {...register('longitude', { required: 'Required' })} type="number" step="any" placeholder="Longitude"
                    className="w-full h-9 px-3 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700" />
                  {errors.longitude && <p className="text-xs text-red-600 mt-1">{errors.longitude.message}</p>}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Linked Trip (optional)</label>
              <select {...register('tripRequestId')}
                className="w-full h-9 px-3 rounded-lg border border-stone-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700">
                <option value="">No linked trip</option>
                {(approvedTrips ?? []).map((t) => (
                  <option key={t.id} value={t.id}>→ {t.destination}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => navigate('/staff/dashboard')} className="px-4 py-2 text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg">Cancel</button>
              <button type="submit" disabled={isLoading} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-60">
                <AlertTriangle size={14} />
                {isLoading ? 'Reporting…' : 'Report Breakdown'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </PageWrapper>
  )
}

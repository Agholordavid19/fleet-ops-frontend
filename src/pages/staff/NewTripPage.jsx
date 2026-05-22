import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { MapPin, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import PageWrapper from '../../components/layout/PageWrapper'
import { useCreateTripMutation } from '../../features/trips/tripsApi'
import { useGetAvailableVehiclesQuery } from '../../features/vehicles/vehiclesApi'
import { useToast } from '../../hooks/useToast'

export default function NewTripPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [submitted, setSubmitted] = useState(false)
  const { data: vehicles } = useGetAvailableVehiclesQuery()
  const [createTrip, { isLoading }] = useCreateTripMutation()
  const { register, handleSubmit, formState: { errors } } = useForm()

  // Earliest selectable date: today + 2 days
  const minDate = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + 2)
    return d.toISOString().split('T')[0]
  }, [])

  async function onSubmit(data) {
    try {
      await createTrip(data).unwrap()
      toast.success('Trip request submitted successfully!')
      setSubmitted(true)
    } catch (err) {
      toast.error(err?.data?.message ?? 'Failed to submit trip request')
    }
  }

  if (submitted) {
    return (
      <PageWrapper title="New Trip Request" crumbs={['Staff', 'Trips', 'New']}>
        <div className="max-w-md mx-auto text-center py-12">
          <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={28} className="text-green-500" />
          </div>
          <h2 className="text-xl font-semibold text-stone-900 mb-2">Trip requested!</h2>
          <p className="text-sm text-stone-500 mb-6">Your trip request has been submitted and is pending approval.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/staff/trips/my')} className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium rounded-lg transition-colors">
              View My Trips
            </button>
            <button onClick={() => setSubmitted(false)} className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-medium rounded-lg transition-colors">
              New Request
            </button>
          </div>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper title="New Trip Request" crumbs={['Staff', 'Trips', 'New']}>
      <div className="max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-xl border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6"
        >
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <div>
              <label htmlFor="vehicleId" className="block text-sm font-medium text-stone-700 mb-1.5">Vehicle <span className="text-red-500">*</span></label>
              <select id="vehicleId" {...register('vehicleId', { required: 'Required' })}
                className="w-full h-9 px-3 rounded-lg border border-stone-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700">
                <option value="">Select available vehicle…</option>
                {(vehicles ?? []).map((v) => (
                  <option key={v.id} value={v.id}>{v.plateNumber} — {v.make} {v.model}</option>
                ))}
              </select>
              {errors.vehicleId && <p className="text-xs text-red-600 mt-1">{errors.vehicleId.message}</p>}
            </div>

            <div>
              <label htmlFor="destination" className="block text-sm font-medium text-stone-700 mb-1.5">Destination <span className="text-red-500">*</span></label>
              <input id="destination" {...register('destination', { required: 'Required' })} placeholder="City, Address or Location"
                className="w-full h-9 px-3 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700" />
              {errors.destination && <p className="text-xs text-red-600 mt-1">{errors.destination.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-stone-700 mb-1.5">Start Date <span className="text-red-500">*</span></label>
                <input
                  id="startDate"
                  {...register('startDate', {
                    required: 'Required',
                    validate: (v) => v >= minDate || 'Must be at least 2 days from today',
                  })}
                  type="date"
                  min={minDate}
                  onKeyDown={(e) => e.preventDefault()}
                  className="w-full h-9 px-3 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700"
                />
                {errors.startDate && <p className="text-xs text-red-600 mt-1">{errors.startDate.message}</p>}
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-stone-700 mb-1.5">End Date <span className="text-red-500">*</span></label>
                <input
                  id="endDate"
                  {...register('endDate', {
                    required: 'Required',
                    validate: (v) => v >= minDate || 'Must be at least 2 days from today',
                  })}
                  type="date"
                  min={minDate}
                  onKeyDown={(e) => e.preventDefault()}
                  className="w-full h-9 px-3 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700"
                />
                {errors.endDate && <p className="text-xs text-red-600 mt-1">{errors.endDate.message}</p>}
              </div>
            </div>

            <p className="text-xs text-stone-400">Trips can only be scheduled from {minDate} onwards.</p>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => navigate('/staff/dashboard')} className="px-4 py-2 text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors">Cancel</button>
              <button type="submit" disabled={isLoading} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors disabled:opacity-60">
                <MapPin size={14} />
                {isLoading ? 'Submitting…' : 'Request Trip'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </PageWrapper>
  )
}

// import { useState } from 'react'
// import { useNavigate, useSearchParams } from 'react-router-dom'
// import { useForm } from 'react-hook-form'
// import { Gauge, CheckCircle, Info } from 'lucide-react'
// import PageWrapper from '../../components/layout/PageWrapper'
// import { useLogMileageMutation } from '../../features/users/usersApi'
// import { useGetAvailableVehiclesQuery } from '../../features/vehicles/vehiclesApi'
// import { useGetMyTripsQuery } from '../../features/trips/tripsApi'
// import { useToast } from '../../hooks/useToast'
// import { formatMileage } from '../../utils/formatters'
//
// export default function LogMileagePage() {
//   const navigate = useNavigate()
//   const toast = useToast()
//   const [submitted, setSubmitted] = useState(false)
//   const [searchParams] = useSearchParams()
//
//   const prefilledTripId = searchParams.get('tripId') || ''
//   const prefilledVehicleId = searchParams.get('vehicleId') || ''
//   const fromCompletion = !!prefilledTripId
//
//   const { data: vehicles } = useGetAvailableVehiclesQuery()
//   const { data: allTrips } = useGetMyTripsQuery()
//   const [logMileage, { isLoading }] = useLogMileageMutation()
//
//   const { register, handleSubmit, watch, formState: { errors } } = useForm({
//     defaultValues: {
//       vehicleId: prefilledVehicleId,
//       tripRequestId: prefilledTripId,
//     },
//   })
//
//   const selectedVehicleId = watch('vehicleId')
//
//   // Merge available vehicles + pre-filled vehicle (in case it's no longer "available" post-trip)
//   const vehicleOptions = vehicles ?? []
//   const selectedVehicle = vehicleOptions.find((v) => v.id === selectedVehicleId)
//     ?? vehicleOptions.find((v) => v.id === prefilledVehicleId)
//
//   // Find the completed trip for display
//   const completedTrip = prefilledTripId
//     ? (allTrips ?? []).find((t) => t.id === prefilledTripId)
//     : null
//
//   async function onSubmit(data) {
//     try {
//       await logMileage({
//         vehicleId: data.vehicleId,
//         reportedMileage: Number(data.reportedMileage),
//         tripRequestId: data.tripRequestId || undefined,
//       }).unwrap()
//       setSubmitted(true)
//     } catch (err) {
//       toast.error(err?.data?.message ?? 'Failed to log mileage')
//     }
//   }
//
//   if (submitted) {
//     return (
//       <PageWrapper title="Log Mileage" crumbs={['Staff', 'Mileage']}>
//         <div className="max-w-md mx-auto text-center py-12">
//           <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
//             <CheckCircle size={28} className="text-green-500" />
//           </div>
//           <h2 className="text-xl font-semibold text-stone-900 mb-2">Mileage logged!</h2>
//           {fromCompletion && (
//             <p className="text-sm text-stone-500 mb-2">Your fleet manager has been notified and will review the trip completion.</p>
//           )}
//           <p className="text-sm text-stone-400 mb-6">The record has been saved successfully.</p>
//           <button onClick={() => navigate('/staff/dashboard')} className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium rounded-lg">
//             Back to Dashboard
//           </button>
//         </div>
//       </PageWrapper>
//     )
//   }
//
//   return (
//     <PageWrapper title="Log Mileage" crumbs={['Staff', 'Mileage']}>
//       <div className="max-w-lg">
//         {/* Banner when redirected from trip completion */}
//         {fromCompletion && (
//           <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
//             <Info size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
//             <div className="text-sm text-blue-800">
//               <span className="font-semibold">Trip completed</span>
//               {completedTrip && <span> — {completedTrip.destination}</span>}. Please log the final mileage to notify your fleet manager for approval.
//             </div>
//           </div>
//         )}
//
//         <div className="bg-white rounded-xl border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6">
//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
//             <div>
//               <label className="block text-sm font-medium text-stone-700 mb-1.5">Vehicle <span className="text-red-500">*</span></label>
//               <select
//                 {...register('vehicleId', { required: 'Required' })}
//                 disabled={!!prefilledVehicleId}
//                 className="w-full h-9 px-3 rounded-lg border border-stone-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700 disabled:bg-stone-50 disabled:text-stone-500"
//               >
//                 <option value="">Select vehicle…</option>
//                 {vehicleOptions.map((v) => (
//                   <option key={v.id} value={v.id}>{v.plateNumber} — {v.make} {v.model} (current: {formatMileage(v.currentMileage)})</option>
//                 ))}
//                 {/* Ensure pre-filled vehicle appears even if not in available list */}
//                 {prefilledVehicleId && !vehicleOptions.find((v) => v.id === prefilledVehicleId) && (
//                   <option value={prefilledVehicleId}>Vehicle #{prefilledVehicleId}</option>
//                 )}
//               </select>
//               {errors.vehicleId && <p className="text-xs text-red-600 mt-1">{errors.vehicleId.message}</p>}
//             </div>
//
//             {selectedVehicle && (
//               <div className="bg-stone-50 rounded-lg p-3 text-sm text-stone-600">
//                 Current mileage: <span className="font-semibold text-stone-900">{formatMileage(selectedVehicle.currentMileage)}</span>
//                 — reported mileage must be higher.
//               </div>
//             )}
//
//             <div>
//               <label className="block text-sm font-medium text-stone-700 mb-1.5">Reported Mileage (km) <span className="text-red-500">*</span></label>
//               <input {...register('reportedMileage', {
//                 required: 'Required',
//                 min: { value: (selectedVehicle?.currentMileage ?? 0) + 1, message: 'Must exceed current mileage' },
//               })}
//                 type="number"
//                 placeholder={selectedVehicle ? String((selectedVehicle.currentMileage ?? 0) + 1) : '0'}
//                 className="w-full h-9 px-3 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700" />
//               {errors.reportedMileage && <p className="text-xs text-red-600 mt-1">{errors.reportedMileage.message}</p>}
//             </div>
//
//             <div>
//               <label className="block text-sm font-medium text-stone-700 mb-1.5">Linked Trip {fromCompletion ? <span className="text-red-500">*</span> : '(optional)'}</label>
//               <select
//                 {...register('tripRequestId', fromCompletion ? { required: 'Required' } : {})}
//                 disabled={!!prefilledTripId}
//                 className="w-full h-9 px-3 rounded-lg border border-stone-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700 disabled:bg-stone-50 disabled:text-stone-500"
//               >
//                 <option value="">No linked trip</option>
//                 {/* Show pre-filled trip */}
//                 {completedTrip && <option value={completedTrip.id}>{completedTrip.destination}</option>}
//                 {/* Show other approved trips if not pre-filled */}
//                 {!prefilledTripId && (allTrips ?? [])
//                   .filter((t) => t.status === 'APPROVED')
//                   .map((t) => <option key={t.id} value={t.id}>→ {t.destination}</option>)
//                 }
//               </select>
//               {errors.tripRequestId && <p className="text-xs text-red-600 mt-1">{errors.tripRequestId.message}</p>}
//             </div>
//
//             <div className="flex justify-end gap-3 pt-2">
//               <button type="button" onClick={() => navigate('/staff/dashboard')} className="px-4 py-2 text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg">Cancel</button>
//               <button type="submit" disabled={isLoading} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg disabled:opacity-60">
//                 <Gauge size={14} />
//                 {isLoading ? 'Logging…' : 'Log Mileage'}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </PageWrapper>
//   )
// }
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Gauge, CheckCircle, Info } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import { useLogMileageMutation } from '../../features/users/usersApi'
import { useGetAvailableVehiclesQuery } from '../../features/vehicles/vehiclesApi'
import { useGetMyTripsQuery } from '../../features/trips/tripsApi'
import { useToast } from '../../hooks/useToast'
import { formatMileage } from '../../utils/formatters'

export default function LogMileagePage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [submitted, setSubmitted] = useState(false)
  const [searchParams] = useSearchParams()

  const prefilledTripId = searchParams.get('tripId') || ''
  const prefilledVehicleId = searchParams.get('vehicleId') || ''
  const fromCompletion = !!prefilledTripId

  const { data: vehicles } = useGetAvailableVehiclesQuery()
  const { data: allTrips } = useGetMyTripsQuery()
  const [logMileage, { isLoading }] = useLogMileageMutation()

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      vehicleId: prefilledVehicleId,
      tripRequestId: prefilledTripId,
    },
  })

  const selectedVehicleId = watch('vehicleId')

  const vehicleOptions = vehicles ?? []

  // Fix: use String comparison to handle number vs string id mismatch
  const selectedVehicle =
      vehicleOptions.find((v) => String(v.id) === String(selectedVehicleId)) ??
      vehicleOptions.find((v) => String(v.id) === String(prefilledVehicleId))

  // Fix: use String comparison for trip id lookup
  const completedTrip = prefilledTripId
      ? (allTrips ?? []).find((t) => String(t.id) === String(prefilledTripId))
      : null

  async function onSubmit(data) {
    try {
      await logMileage({
        vehicleId: data.vehicleId,
        reportedMileage: Number(data.reportedMileage),
        tripRequestId: data.tripRequestId || undefined,
      }).unwrap()
      setSubmitted(true)
    } catch (err) {
      toast.error(err?.data?.message ?? 'Failed to log mileage')
    }
  }

  if (submitted) {
    return (
        <PageWrapper title="Log Mileage" crumbs={['Staff', 'Mileage']}>
          <div className="max-w-md mx-auto text-center py-12">
            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-green-500" />
            </div>
            <h2 className="text-xl font-semibold text-stone-900 mb-2">Mileage logged!</h2>
            {fromCompletion && (
                <p className="text-sm text-stone-500 mb-2">
                  Your fleet manager has been notified and will review the trip completion.
                </p>
            )}
            <p className="text-sm text-stone-400 mb-6">The record has been saved successfully.</p>
            <button
                type="button"
                onClick={() => navigate('/staff/dashboard')}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium rounded-lg"
            >
              Back to Dashboard
            </button>
          </div>
        </PageWrapper>
    )
  }

  return (
      <PageWrapper title="Log Mileage" crumbs={['Staff', 'Mileage']}>
        <div className="max-w-lg">
          {/* Banner when redirected from trip completion */}
          {fromCompletion && (
              <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <Info size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <span className="font-semibold">Trip completed</span>
                  {completedTrip && <span> — {completedTrip.destination}</span>}.
                  {' '}Please log the final mileage to notify your fleet manager for approval.
                </div>
              </div>
          )}

          <div className="bg-white rounded-xl border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)] p-6">
            <form onSubmit={handleSubmit(onSubmit)} autoComplete="on" className="space-y-5">
              {/* Vehicle */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Vehicle <span className="text-red-500">*</span>
                </label>
                <select
                    {...register('vehicleId', { required: 'Required' })}
                    disabled={!!prefilledVehicleId}
                    className="w-full h-9 px-3 rounded-lg border border-stone-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700 disabled:bg-stone-50 disabled:text-stone-500"
                >
                  <option value="">Select vehicle…</option>
                  {vehicleOptions.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.plateNumber} — {v.make} {v.model} (current: {formatMileage(v.currentMileage)})
                      </option>
                  ))}
                  {/* Ensure pre-filled vehicle appears even if not in available list */}
                  {prefilledVehicleId &&
                      !vehicleOptions.find((v) => String(v.id) === String(prefilledVehicleId)) && (
                          <option value={prefilledVehicleId}>Vehicle #{prefilledVehicleId}</option>
                      )}
                </select>
                {errors.vehicleId && (
                    <p className="text-xs text-red-600 mt-1">{errors.vehicleId.message}</p>
                )}
              </div>

              {/* Current mileage hint */}
              {selectedVehicle && (
                  <div className="bg-stone-50 rounded-lg p-3 text-sm text-stone-600">
                    Current mileage:{' '}
                    <span className="font-semibold text-stone-900">
                  {formatMileage(selectedVehicle.currentMileage)}
                </span>{' '}
                    — reported mileage must be higher.
                  </div>
              )}

              {/* Reported Mileage */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Reported Mileage (km) <span className="text-red-500">*</span>
                </label>
                <input
                    {...register('reportedMileage', {
                      required: 'Required',
                      min: {
                        value: (selectedVehicle?.currentMileage ?? 0) + 1,
                        message: 'Must exceed current mileage',
                      },
                    })}
                    type="number"
                    placeholder={
                      selectedVehicle ? String((selectedVehicle.currentMileage ?? 0) + 1) : '0'
                    }
                    className="w-full h-9 px-3 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700"
                />
                {errors.reportedMileage && (
                    <p className="text-xs text-red-600 mt-1">{errors.reportedMileage.message}</p>
                )}
              </div>

              {/* Linked Trip */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Linked Trip{' '}
                  {fromCompletion ? (
                      <span className="text-red-500">*</span>
                  ) : (
                      <span className="text-stone-400 font-normal">(optional)</span>
                  )}
                </label>
                {/*<select*/}
                {/*    {...register('tripRequestId', fromCompletion ? { required: 'Required' } : {})}*/}
                {/*    disabled={!!prefilledTripId}*/}
                {/*    className="w-full h-9 px-3 rounded-lg border border-stone-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700 disabled:bg-stone-50 disabled:text-stone-500"*/}
                {/*>*/}
                {/*  <option value="">No linked trip</option>*/}
                {/*  /!* Show pre-filled completed trip *!/*/}
                {/*  {completedTrip && (*/}
                {/*      <option value={completedTrip.id}>{completedTrip.destination}</option>*/}
                {/*  )}*/}
                {/*  /!* Show other approved trips if not pre-filled *!/*/}
                {/*  {!prefilledTripId &&*/}
                {/*      (allTrips ?? [])*/}
                {/*          .filter((t) => t.status === 'APPROVED')*/}
                {/*          .map((t) => (*/}
                {/*              <option key={t.id} value={t.id}>*/}
                {/*                → {t.destination}*/}
                {/*              </option>*/}
                {/*          ))}*/}
                {/*</select>*/}
                <select
                    {...register('tripRequestId', fromCompletion ? { required: 'Required' } : {})}
                    disabled={!!prefilledTripId}
                    className="w-full h-9 px-3 rounded-lg border border-stone-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700 disabled:bg-stone-50 disabled:text-stone-500"
                >
                  <option value="">No linked trip</option>

                  {/* Always render pre-filled option so the default value has a matching option */}
                  {prefilledTripId && (
                      <option value={prefilledTripId}>
                        {completedTrip ? completedTrip.destination : `Trip #${prefilledTripId}`}
                      </option>
                  )}

                  {/* Show other approved trips only when not pre-filled */}
                  {!prefilledTripId &&
                      (allTrips ?? [])
                          .filter((t) => t.status === 'APPROVED')
                          .map((t) => (
                              <option key={t.id} value={t.id}>
                                → {t.destination}
                              </option>
                          ))}
                </select>
                {errors.tripRequestId && (
                    <p className="text-xs text-red-600 mt-1">{errors.tripRequestId.message}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                    type="button"
                    onClick={() => navigate('/staff/dashboard')}
                    className="px-4 py-2 text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg disabled:opacity-60"
                >
                  <Gauge size={14} />
                  {isLoading ? 'Logging…' : 'Log Mileage'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </PageWrapper>
  )
}
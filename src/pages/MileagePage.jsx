import { useState } from 'react'
import toast from 'react-hot-toast'
import { useCreateMileageLogMutation, useGetMyTripRequestsQuery } from '../apis/fleetApi.jsx'
import PageHeader from "../components/Pageheader";
import { FormField, Input, Select, SubmitButton } from '../components/Form'
import { getErrorMessage } from '../utils/format.js'

const emptyForm = { tripRequestId: '', reportedMileage: '' }
const getTripVehicleId = (trip) => trip?.vehicleId ?? trip?.vehicle?.id

export default function MileageScreen() {
    const { data: trips } = useGetMyTripRequestsQuery()
    const [createMileageLog, { isLoading }] = useCreateMileageLogMutation()
    const [form, setForm] = useState(emptyForm)
    const [submitted, setSubmitted] = useState([])

    const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    const completedTrips = (trips ?? []).filter((trip) => trip.status === 'COMPLETED')
    const selectedTrip = completedTrips.find((trip) => String(trip.id) === String(form.tripRequestId))

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!selectedTrip) {
            toast.error('Select a completed trip')
            return
        }

        if (!getTripVehicleId(selectedTrip)) {
            toast.error('Selected trip is missing vehicle information')
            return
        }

        try {
            const res = await createMileageLog({
                vehicleId: getTripVehicleId(selectedTrip),
                reportedMileage: Number(form.reportedMileage),
            }).unwrap()
            toast.success('Mileage log submitted')
            setSubmitted((prev) => [{ ...form, ...selectedTrip, id: Date.now(), ...res }, ...prev])
            setForm(emptyForm)
        } catch (err) {
            toast.error(getErrorMessage(err))
        }
    }

    return (
        <>
            <PageHeader title="Mileage Log" subtitle="Record mileage for your assigned vehicles" />

            <div className="max-w-md">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <form onSubmit={handleSubmit}>
                        <FormField label="Completed Trip">
                            <Select name="tripRequestId" value={form.tripRequestId} onChange={handleChange} required>
                                <option value="">Select a completed trip</option>
                                {completedTrips.map((trip) => (
                                    <option key={trip.id} value={trip.id}>
                                        {trip.plateNumber} — {trip.destination}
                                    </option>
                                ))}
                            </Select>
                        </FormField>
                        <FormField label="Current Odometer Reading (km)">
                            <Input
                                type="number"
                                name="reportedMileage"
                                placeholder="e.g. 3200"
                                min="0"
                                step="0.1"
                                value={form.reportedMileage}
                                onChange={handleChange}
                                required
                            />
                        </FormField>
                        <SubmitButton loading={isLoading}>Submit Log</SubmitButton>
                    </form>
                </div>

                {/* Recent logs in this session */}
                {submitted.length > 0 && (
                    <div className="mt-6">
                        <p className="text-[11px] font-medium uppercase tracking-widest text-gray-600 mb-3">
                            Submitted this session
                        </p>
                        <div className="space-y-2">
                            {submitted.map((log) => (
                                <div
                                    key={log.id}
                                    className="flex items-center justify-between border border-gray-800/60 rounded-xl px-4 py-3"
                                >
                                                    <span className="text-[13px] text-gray-400">Vehicle #{log.vehicleId}</span>
                                    <span className="text-[13px] font-semibold text-emerald-400">{log.reportedMileage} km</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

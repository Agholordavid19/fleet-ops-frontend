import { useState } from 'react'
import toast from 'react-hot-toast'
import { useGetVehiclesQuery, useCreateMileageLogMutation } from '../apis/fleetApi.jsx'
import PageHeader from '../components/PageHeader'
import { FormField, Input, Select, SubmitButton } from '../components/Form'
import { ErrorAlert } from '../components/Feedback'
import { getErrorMessage } from '../utils/format.js'

const emptyForm = { vehicleId: '', mileageAdded: '' }

export default function MileageScreen() {
    const { data: vehicles } = useGetVehiclesQuery()
    const [createMileageLog, { isLoading }] = useCreateMileageLogMutation()
    const [form, setForm] = useState(emptyForm)
    const [submitted, setSubmitted] = useState([])

    const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const res = await createMileageLog({
                vehicleId: form.vehicleId,
                mileageAdded: Number(form.mileageAdded),
            }).unwrap()
            toast.success('Mileage log submitted')
            setSubmitted((prev) => [{ ...form, id: Date.now(), ...res }, ...prev])
            setForm(emptyForm)
        } catch (err) {
            toast.error(getErrorMessage(err))
        }
    }

    const assignedVehicles = vehicles?.filter((v) => v.status === 'ASSIGNED') ?? []

    return (
        <>
            <PageHeader title="Mileage Log" subtitle="Record mileage for your assigned vehicles" />

            <div className="max-w-md">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <form onSubmit={handleSubmit}>
                        <FormField label="Vehicle">
                            <Select name="vehicleId" value={form.vehicleId} onChange={handleChange} required>
                                <option value="">Select a vehicle</option>
                                {assignedVehicles.map((v) => (
                                    <option key={v.id} value={v.id}>
                                        {v.plateNumber} — {v.make} {v.model}
                                    </option>
                                ))}
                            </Select>
                        </FormField>
                        <FormField label="Mileage Added (km)">
                            <Input
                                type="number"
                                name="mileageAdded"
                                placeholder="e.g. 150"
                                min="0"
                                value={form.mileageAdded}
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
                        <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-gray-600 mb-3">
                            Submitted this session
                        </p>
                        <div className="space-y-2">
                            {submitted.map((log) => (
                                <div
                                    key={log.id}
                                    className="flex items-center justify-between border border-gray-800/60 rounded-xl px-4 py-3"
                                >
                                                    <span className="text-[13px] text-gray-400">Vehicle #{log.vehicleId}</span>
                                    <span className="text-[13px] font-semibold text-emerald-400">+{log.mileageAdded} km</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
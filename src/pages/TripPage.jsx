import { useState } from 'react'
import toast from 'react-hot-toast'
import {
    useGetAvailableVehiclesQuery,
    useCreateTripRequestMutation,
} from '../apis/fleetApi'

import Table from '../components/Table.jsx'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import PageHeader from '../components/PageHeader'
import { FormField, Input, Select, SubmitButton } from '../components/Form'
import { getErrorMessage } from '../utils/format.js'

const emptyForm = {
    vehicleId: '',
    destination: '',
    startDate: '',
    endDate: '',
}

export default function TripsScreen() {
    const { data: vehicles } = useGetAvailableVehiclesQuery()
    const [createTripRequest, { isLoading: submitting }] =
        useCreateTripRequestMutation()

    const [open, setOpen] = useState(false)
    const [form, setForm] = useState(emptyForm)

    const availableVehicles = vehicles ?? []

    const handleChange = (e) =>
        setForm((f) => ({
            ...f,
            [e.target.name]: e.target.value,
        }))

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            await createTripRequest(form).unwrap()
            toast.success('Trip request submitted')
            setForm(emptyForm)
            setOpen(false)
        } catch (err) {
            toast.error(getErrorMessage(err))
        }
    }

    const vehicleCols = [
        { key: 'plateNumber', label: 'Plate' },
        { key: 'make', label: 'Make' },
        { key: 'model', label: 'Model' },
        {
            key: 'status',
            label: 'Status',
            render: (r) => <Badge status={r.status} />,
        },
    ]

    return (
        <>
            <PageHeader
                title="Request Trip"
                subtitle="View available vehicles and submit a trip request"
                action={
                    <button
                        onClick={() => setOpen(true)}
                        className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-[13px] font-semibold px-4 py-2 rounded-lg transition-all duration-150"
                    >
                        + Request Trip
                    </button>
                }
            />

            <section>
                <h2 className="text-[11px] font-medium uppercase tracking-widest text-gray-600 mb-3">
                    Available Vehicles
                </h2>

                <Table
                    columns={vehicleCols}
                    data={availableVehicles}
                    emptyMessage="No vehicles currently available."
                />
            </section>

            <Modal
                open={open}
                onClose={() => setOpen(false)}
                title="Submit Trip Request"
            >
                <form onSubmit={handleSubmit}>
                    <FormField label="Vehicle">
                        <Select
                            name="vehicleId"
                            value={form.vehicleId}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select a vehicle</option>

                            {availableVehicles.map((v) => (
                                <option key={v.id} value={v.id}>
                                    {v.plateNumber} — {v.make} {v.model}
                                </option>
                            ))}
                        </Select>
                    </FormField>

                    <FormField label="Destination">
                        <Input
                            name="destination"
                            placeholder="e.g. Abuja"
                            value={form.destination}
                            onChange={handleChange}
                            required
                        />
                    </FormField>

                    <FormField label="Start Date">
                        <Input
                            type="date"
                            name="startDate"
                            value={form.startDate}
                            onChange={handleChange}
                            required
                        />
                    </FormField>

                    <FormField label="End Date">
                        <Input
                            type="date"
                            name="endDate"
                            value={form.endDate}
                            onChange={handleChange}
                            required
                        />
                    </FormField>

                    <SubmitButton loading={submitting}>
                        Submit Request
                    </SubmitButton>
                </form>
            </Modal>
        </>
    )
}
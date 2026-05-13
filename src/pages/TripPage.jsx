import { useState } from 'react'
import toast from 'react-hot-toast'
import {
    useGetAvailableVehiclesQuery,
    useCreateTripRequestMutation,
} from '../apis/fleetApi'

import Table from '../components/Table.jsx'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import PageHeader from "../components/Pageheader";
import VehicleDetailModal from '../components/VehicleScreenModal.jsx'
import { FormField, Input, Select, SubmitButton } from '../components/Form'
import { getErrorMessage } from '../utils/format.js'
import { useAuth } from '../utils/useAuth.jsx'

const emptyForm = {
    vehicleId: '',
    destination: '',
    startDate: '',
    endDate: '',
}

const normalizeStatus = (status) => String(status ?? '').trim().toUpperCase()
const isVehicleAvailable = (vehicle) => normalizeStatus(vehicle?.status) === 'AVAILABLE'
const dateRangesOverlap = (firstStart, firstEnd, secondStart, secondEnd) =>
    firstStart <= secondEnd && secondStart <= firstEnd

export default function TripsScreen() {
    const { isFieldStaff } = useAuth()
    const { data: vehicles, refetch: refetchAvailableVehicles } =
        useGetAvailableVehiclesQuery(undefined, {
            refetchOnMountOrArgChange: true,
        })
    const [createTripRequest, { isLoading: submitting }] =
        useCreateTripRequestMutation()

    const [open, setOpen] = useState(false)
    const [selectedVehicle, setSelectedVehicle] = useState(null)
    const [form, setForm] = useState(emptyForm)
    const [periodConflicts, setPeriodConflicts] = useState([])
    const [conflictMessage, setConflictMessage] = useState('')

    const availableVehicles = (vehicles ?? []).filter(isVehicleAvailable)
    const hasKnownPeriodConflict = (vehicleId, startDate = form.startDate, endDate = form.endDate) =>
        !!vehicleId && !!startDate && !!endDate && periodConflicts.some((conflict) =>
            String(conflict.vehicleId) === String(vehicleId) &&
            dateRangesOverlap(startDate, endDate, conflict.startDate, conflict.endDate)
        )
    const tripDatesSelected = !!form.startDate && !!form.endDate
    const selectedVehicleHasConflict = hasKnownPeriodConflict(form.vehicleId)

    const handleChange = (e) => {
        setConflictMessage('')
        setForm((f) => ({
            ...f,
            [e.target.name]: e.target.value,
        }))
    }

    const openRequestModal = (vehicle = null) => {
        if (!isFieldStaff) return

        if (vehicle && !isVehicleAvailable(vehicle)) {
            toast.error('This vehicle is not available for trip requests')
            return
        }

        setForm((f) => ({
            ...f,
            vehicleId: vehicle?.id ? String(vehicle.id) : f.vehicleId,
        }))

        setSelectedVehicle(null)
        setConflictMessage('')
        refetchAvailableVehicles()
        setOpen(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (form.startDate > form.endDate) {
            toast.error('End date must be after start date')
            return
        }

        const selectedVehicle = availableVehicles.find(
            (vehicle) => String(vehicle.id) === String(form.vehicleId)
        )

        if (!selectedVehicle) {
            toast.error('Select an available vehicle')
            return
        }

        if (hasKnownPeriodConflict(form.vehicleId)) {
            setConflictMessage('This vehicle is already assigned for the selected period.')
            toast.error('Choose another vehicle or change the dates')
            return
        }

        const requestPayload = {
            ...form,
            vehicleId: Number(form.vehicleId),
        }

        try {
            await createTripRequest(requestPayload).unwrap()

            toast.success('Trip request submitted')
            setForm(emptyForm)
            setOpen(false)
        } catch (err) {
            const message = getErrorMessage(err)

            if (/assigned for this period/i.test(message)) {
                setPeriodConflicts((conflicts) => [
                    ...conflicts.filter((conflict) =>
                        String(conflict.vehicleId) !== String(form.vehicleId) ||
                        conflict.startDate !== form.startDate ||
                        conflict.endDate !== form.endDate
                    ),
                    {
                        vehicleId: form.vehicleId,
                        startDate: form.startDate,
                        endDate: form.endDate,
                    },
                ])
                setConflictMessage('This vehicle is already assigned for the selected period.')
            } else {
                setConflictMessage(message)
            }

            refetchAvailableVehicles()
            toast.error(message)
        }
    }

    const vehicleCols = [
        { key: 'plateNumber', label: 'Plate' },
        { key: 'make', label: 'Make' },
        { key: 'model', label: 'Model' },
        {
            key: 'status',
            label: 'Status',
            render: (r) => tripDatesSelected && hasKnownPeriodConflict(r.id)
                ? <Badge status="UNAVAILABLE_FOR_PERIOD" />
                : <Badge status={r.status} />,
        },
        {
            key: 'actions',
            label: '',
            render: (row) => (
                <button
                    type="button"
                    onClick={() => setSelectedVehicle(row)}
                    className="text-[12px] font-semibold text-primary hover:text-primary-hover transition-colors duration-150"
                >
                    View Details →
                </button>
            ),
        },
    ]

    return (
        <>
            <PageHeader
                title="Request Trip"
                subtitle="View currently available vehicles and submit a trip request"
                action={isFieldStaff && (
                    <button
                        onClick={() => openRequestModal()}
                        className="bg-primary hover:bg-primary-hover text-white text-[13px] font-semibold px-4 py-2 rounded-lg transition-all duration-150"
                    >
                        + Request Trip
                    </button>
                )}
            />

            <section>
                <h2 className="text-[11px] font-medium uppercase tracking-widest text-gray-600 mb-3">
                    Currently Available Vehicles
                </h2>

                <Table
                    columns={vehicleCols}
                    data={availableVehicles}
                    emptyMessage="No vehicles currently available."
                />
            </section>

            <VehicleDetailModal
                vehicle={selectedVehicle}
                vehicleId={selectedVehicle?.id}
                onClose={() => setSelectedVehicle(null)}
                onRequest={isFieldStaff ? openRequestModal : undefined}
            />

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
                                <option
                                    key={v.id}
                                    value={String(v.id)}
                                    disabled={hasKnownPeriodConflict(v.id)}
                                >
                                    {v.plateNumber} — {v.make} {v.model}
                                    {hasKnownPeriodConflict(v.id) ? ' (unavailable for selected period)' : ''}
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

                    {(conflictMessage || selectedVehicleHasConflict) && (
                        <p className="text-[12px] text-red-400 leading-relaxed mb-3">
                            {conflictMessage || 'This vehicle is already assigned for the selected period.'}
                            {selectedVehicleHasConflict && ' Choose another vehicle or change the dates.'}
                        </p>
                    )}

                    <SubmitButton loading={submitting} disabled={selectedVehicleHasConflict}>
                        Submit Request
                    </SubmitButton>
                </form>
            </Modal>
        </>
    )
}

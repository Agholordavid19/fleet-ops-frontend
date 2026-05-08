import { useState } from 'react'
import toast from 'react-hot-toast'
import { useGetVehiclesQuery, useCreateVehicleMutation } from '../apis/fleetApi'
import VehicleDetailModal from '../components/VehicleScreenModal.jsx'
import Table from '../components/Table'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import PageHeader from '../components/PageHeader'
import { FormField, Input, SubmitButton } from '../components/Form'
import { LoadingSpinner, ErrorAlert } from '../components/Feedback'
import { getErrorMessage } from '../utils/format.js'

const emptyForm = { make: '', model: '', plateNumber: '' }

export default function VehiclesScreen() {
    const { data: vehicles, isLoading, isError } = useGetVehiclesQuery()
    const [createVehicle, { isLoading: creating }] = useCreateVehicleMutation()
    const [addOpen, setAddOpen] = useState(false)
    const [selectedId, setSelectedId] = useState(null)
    const [form, setForm] = useState(emptyForm)

    const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await createVehicle(form).unwrap()
            toast.success('Vehicle registered')
            setForm(emptyForm)
            setAddOpen(false)
        } catch (err) {
            toast.error(getErrorMessage(err))
        }
    }

    const columns = [
        { key: 'plateNumber', label: 'Plate Number' },
        { key: 'make',        label: 'Make' },
        { key: 'model',       label: 'Model' },
        {
            key: 'status',
            label: 'Status',
            render: (row) => <Badge status={row.status} />,
        },
        {
            key: 'actions',
            label: '',
            render: (row) => (
                <button
                    onClick={() => setSelectedId(row.id)}
                    className="text-[12px] text-primary hover:text-primary-hover font-medium transition-colors duration-150"
                >
                    View Details →
                </button>
            ),
        },
    ]

    return (
        <>
            <PageHeader
                title="Vehicles"
                subtitle="Register and manage the fleet"
                action={
                    <button
                        onClick={() => setAddOpen(true)}
                        className="bg-primary hover:bg-primary-hover text-gray-900 text-[13px] font-semibold px-4 py-2 rounded-lg transition-all duration-150"
                    >
                        + Register Vehicle
                    </button>
                }
            />

            {isLoading && <LoadingSpinner />}
            {isError && <ErrorAlert message="Failed to load vehicles." />}
            {!isLoading && !isError && (
                <Table columns={columns} data={vehicles} emptyMessage="No vehicles registered." />
            )}

            {/* Register modal */}
            <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Register Vehicle">
                <form onSubmit={handleSubmit}>
                    <FormField label="Make">
                        <Input name="make" placeholder="Toyota" value={form.make} onChange={handleChange} required />
                    </FormField>
                    <FormField label="Model">
                        <Input name="model" placeholder="Hilux" value={form.model} onChange={handleChange} required />
                    </FormField>
                    <FormField label="Plate Number">
                        <Input name="plateNumber" placeholder="ABC-1234" value={form.plateNumber} onChange={handleChange} required />
                    </FormField>
                    <SubmitButton loading={creating}>Register</SubmitButton>
                </form>
            </Modal>

            {/* Detail modal */}
            <VehicleDetailModal vehicleId={selectedId} onClose={() => setSelectedId(null)} />
        </>
    )
}
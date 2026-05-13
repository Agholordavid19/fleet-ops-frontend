import { useState } from 'react'
import toast from 'react-hot-toast'
import {
    useAddVehicleMediaMutation,
    useCreateVehicleMutation,
    useGetVehiclesQuery,
} from '../apis/fleetApi'
import { uploadManyToCloudinary } from '../utils/cloudinary.js'

import Table from '../components/Table.jsx'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import PageHeader from "../components/Pageheader";
import VehicleDetailModal from "../components/Vehiclescreenmodal.jsx";
import { FormField, Input, SubmitButton } from '../components/Form'
import { LoadingSpinner, ErrorAlert } from '../components/Feedback'
import { getErrorMessage } from '../utils/format.js'

const emptyForm = {
    make: '',
    model: '',
    plateNumber: '',
    milestoneInterval: '',
}

const getLifecycle = (vehicle) => {
    const value = Number(vehicle?.lifecyclePercentage)
    return Number.isFinite(value) ? value : null
}

const shouldSellVehicle = (vehicle) =>
    vehicle?.markedForSale === true ||
    vehicle?.status === 'OUT_OF_SERVICE' ||
    (getLifecycle(vehicle) ?? 0) >= 80

export default function VehiclesScreen() {
    const { data: vehicles, isLoading, isError } = useGetVehiclesQuery()
    const [createVehicle, { isLoading: creating }] = useCreateVehicleMutation()
    const [addVehicleMedia, { isLoading: uploading }] = useAddVehicleMediaMutation()

    const [addOpen, setAddOpen] = useState(false)
    const [selectedId, setSelectedId] = useState(null)
    const [form, setForm] = useState(emptyForm)
    const [files, setFiles] = useState([])

    const handleChange = (e) => {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    }

    const handleFileChange = (e) => {
        setFiles(Array.from(e.target.files || []))
    }

    const handleClose = () => {
        setAddOpen(false)
        setForm(emptyForm)
        setFiles([])
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const body = {
            make: form.make,
            model: form.model,
            plateNumber: form.plateNumber,
        }

        if (form.milestoneInterval) {
            body.milestoneInterval = Number(form.milestoneInterval)
        }

        try {
            const createdVehicle = await createVehicle(body).unwrap()

            if (files.length > 0) {
                const uploads = await uploadManyToCloudinary(files, 'fleetops/vehicles')

                await addVehicleMedia({
                    id: createdVehicle.id,
                    media: uploads.map((u) => ({
                        publicId: u.publicId,
                        url: u.url,
                    })),
                }).unwrap()
            }

            toast.success('Vehicle registered')
            handleClose()
        } catch (err) {
            toast.error(getErrorMessage(err))
        }
    }

    const vehicleCols = [
        { key: 'plateNumber', label: 'Plate Number' },
        { key: 'make', label: 'Make' },
        { key: 'model', label: 'Model' },
        { key: 'currentMileage', label: 'Mileage', render: (row) => `${row.currentMileage ?? 0} km` },
        { key: 'milestoneInterval', label: 'Milestone', render: (row) => `${row.milestoneInterval ?? 0} km` },
        {
            key: 'lifecyclePercentage',
            label: 'Health',
            render: (row) => {
                const lifecycle = getLifecycle(row)
                return lifecycle == null ? '—' : `${lifecycle.toFixed(1)}%`
            },
        },
        {
            key: 'markedForSale',
            label: 'Sale',
            render: (row) => shouldSellVehicle(row) ? 'Sell' : 'Keep',
        },
        {
            key: 'status',
            label: 'Status',
            render: (r) => <Badge status={r.status} />,
        },
        {
            key: 'actions',
            label: '',
            render: (row) => (
                <button
                    type="button"
                    onClick={() => setSelectedId(row.id)}
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
                title="Vehicles"
                subtitle="Register and manage the fleet"
                action={
                    <button
                        onClick={() => setAddOpen(true)}
                        className="bg-primary hover:bg-primary-hover text-white text-[13px] font-semibold px-4 py-2 rounded-lg transition-all duration-150"
                    >
                        + Register Vehicle
                    </button>
                }
            />

            {isLoading && <LoadingSpinner />}
            {isError && <ErrorAlert message="Failed to load vehicles." />}

            {!isLoading && !isError && (
            <section>
                <h2 className="text-[11px] font-medium uppercase tracking-widest text-gray-600 mb-3">
                    Registered Vehicles
                </h2>

                <Table
                    columns={vehicleCols}
                    data={vehicles ?? []}
                    emptyMessage="No vehicles registered."
                />
            </section>
            )}

            <Modal open={addOpen} onClose={handleClose} title="Register Vehicle">
                <form onSubmit={handleSubmit}>
                    <FormField label="Make">
                        <Input
                            name="make"
                            placeholder="Toyota"
                            value={form.make}
                            onChange={handleChange}
                            required
                        />
                    </FormField>

                    <FormField label="Model">
                        <Input
                            name="model"
                            placeholder="Hilux"
                            value={form.model}
                            onChange={handleChange}
                            required
                        />
                    </FormField>

                    <FormField label="Plate Number">
                        <Input
                            name="plateNumber"
                            placeholder="KJA-245BX"
                            value={form.plateNumber}
                            onChange={handleChange}
                            required
                        />
                    </FormField>

                    <FormField label="Milestone Interval (km, optional)">
                        <Input
                            type="number"
                            name="milestoneInterval"
                            placeholder="Default: 3000"
                            min="100"
                            value={form.milestoneInterval}
                            onChange={handleChange}
                        />
                    </FormField>

                    <FormField label="Vehicle Images">
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileChange}
                            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-[13px] text-gray-200 file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-[12px] file:font-semibold file:text-white"
                        />
                    </FormField>

                    {files.length > 0 && (
                        <p className="text-[11px] text-gray-500 mb-3">
                            {files.length} image{files.length > 1 ? 's' : ''} selected
                        </p>
                    )}

                    <SubmitButton loading={creating || uploading}>
                        {uploading ? 'Uploading Images...' : 'Register'}
                    </SubmitButton>
                </form>
            </Modal>

            <VehicleDetailModal
                vehicleId={selectedId}
                onClose={() => setSelectedId(null)}
            />
        </>
    )
}

import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
    useGetVehicleQuery,
    useGetVehicleAssignmentsQuery,
    useGetMileageLogsByVehicleQuery,
    useUpdateVehicleMilestoneIntervalMutation,
} from '../apis/fleetApi'
import { useAuth } from '../utils/useAuth.jsx'
import Modal from './Modal.jsx'
import Badge from './Badge.jsx'
import Table from './Table.jsx'
import { LoadingSpinner, ErrorAlert } from './Feedback.jsx'
import { formatDate, getErrorMessage } from '../utils/format.js'

const normalizeStatus = (status) => String(status ?? '').trim().toUpperCase()
const getLifecycle = (vehicle) => {
    const value = Number(vehicle?.lifecyclePercentage)
    return Number.isFinite(value) ? value : null
}
const shouldSellVehicle = (vehicle) =>
    vehicle?.markedForSale === true ||
    normalizeStatus(vehicle?.status) === 'OUT_OF_SERVICE' ||
    (getLifecycle(vehicle) ?? 0) >= 80

const getLifecycleLabel = (vehicle) => {
    const lifecycle = getLifecycle(vehicle)

    if (shouldSellVehicle(vehicle)) return 'Sell'
    if (lifecycle == null) return 'Not available'
    if (lifecycle >= 65) return 'Watch closely'
    if (lifecycle >= 50) return 'Plan replacement'
    return 'Keep in service'
}

export default function VehicleDetailModal({
                                               vehicleId,
                                               vehicle: vehicleFromProps,
                                               onClose,
                                               onRequest,
                                           }) {
    const { role } = useAuth()
    const [milestoneInterval, setMilestoneInterval] = useState('')
    const [activeImage, setActiveImage] = useState('')

    const isManager = role === 'FLEET_MANAGER' || role === 'ADMIN'
    const isFieldStaff = role === 'FIELD_STAFF'
    const canRequestTrip = isFieldStaff && typeof onRequest === 'function'

    const shouldFetchVehicle = !!vehicleId && !vehicleFromProps && isManager

    const {
        data: fetchedVehicle,
        isLoading,
        isError,
    } = useGetVehicleQuery(vehicleId, {
        skip: !shouldFetchVehicle,
    })

    const vehicle = vehicleFromProps || fetchedVehicle
    const vehicleStatus = normalizeStatus(vehicle?.status)
    const vehicleAvailable = vehicleStatus === 'AVAILABLE'

    const {
        data: assignments,
        isLoading: loadingAss,
    } = useGetVehicleAssignmentsQuery(vehicleId, {
        skip: !vehicleId || !isManager,
    })

    const {
        data: mileageLogs,
        isLoading: loadingMileage,
        isError: mileageError,
    } = useGetMileageLogsByVehicleQuery(vehicleId, {
        skip: !vehicleId || !isManager,
    })

    const [updateMilestone, { isLoading: updatingMilestone }] =
        useUpdateVehicleMilestoneIntervalMutation()

    const images = useMemo(() => {
        const media = vehicle?.mediaFiles || vehicle?.media || vehicle?.images || []

        return media
            .map((m) => m.url || m.fileUrl || m.filePath || m.secureUrl)
            .filter(Boolean)
    }, [vehicle])

    const selectedImage = activeImage && images.includes(activeImage)
        ? activeImage
        : images[0] || ''

    const handleUpdateMilestone = async (e) => {
        e.preventDefault()

        try {
            await updateMilestone({
                id: vehicleId,
                milestoneInterval: Number(milestoneInterval),
            }).unwrap()

            toast.success('Milestone interval updated')
            setMilestoneInterval('')
        } catch (err) {
            toast.error(getErrorMessage(err))
        }
    }

    const assignmentCols = [
        { key: 'fieldStaffName', label: 'Staff', render: (r) => r.fieldStaffName || 'N/A' },
        { key: 'destination', label: 'Destination', render: (r) => r.destination || 'N/A' },
        { key: 'startDate', label: 'From', render: (r) => formatDate(r.startDate) },
        { key: 'endDate', label: 'To', render: (r) => formatDate(r.endDate) },
    ]

    const mileageCols = [
        {
            key: 'reportedMileage',
            label: 'Reported Mileage',
            render: (r) => `${r.reportedMileage ?? 0} km`,
        },
        {
            key: 'previousMileage',
            label: 'Previous Mileage',
            render: (r) => `${r.previousMileage ?? 0} km`,
        },
        {
            key: 'mileageAdded',
            label: 'Mileage Added',
            render: (r) =>
                `${r.mileageAdded ?? (r.reportedMileage ?? 0) - (r.previousMileage ?? 0)} km`,
        },
        {
            key: 'submittedByName',
            label: 'Logged By',
            render: (r) =>
                r.submittedByName || r.loggedByName || r.fieldStaffName || 'N/A',
        },
        {
            key: 'loggedAt',
            label: 'Date',
            render: (r) => formatDate(r.loggedAt || r.createdAt),
        },
    ]

    const serviceHistoryCols = [
        { key: 'fleetManagerName', label: 'Approved By', render: (r) => r.fleetManagerName || 'N/A' },
        { key: 'notes', label: 'Service Notes' },
        {
            key: 'newMilestoneInterval',
            label: 'New Milestone',
            render: (r) => `${r.newMilestoneInterval ?? 0} km`,
        },
        {
            key: 'servicedAt',
            label: 'Serviced',
            render: (r) => formatDate(r.servicedAt),
        },
    ]

    return (
        <Modal
            open={!!vehicleId || !!vehicleFromProps}
            onClose={onClose}
            title="Vehicle Details"
            size="xl"
        >
            {isLoading && <LoadingSpinner />}
            {isError && <ErrorAlert message="Failed to load vehicle." />}

            {!isLoading && !isError && !vehicle && (
                <ErrorAlert message="Vehicle details are not available." />
            )}

            {vehicle && (
                <div className="space-y-6">
                    <div>
                        <div className="h-[320px] w-full overflow-hidden rounded-2xl bg-gray-900 border border-gray-800">
                            {selectedImage ? (
                                <img
                                    src={selectedImage}
                                    alt={`${vehicle.make} ${vehicle.model}`}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-[13px] text-gray-500">
                                    No vehicle image uploaded
                                </div>
                            )}
                        </div>

                        {images.length > 0 && (
                            <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
                                {images.map((img, index) => (
                                    <button
                                        key={`${img}-${index}`}
                                        type="button"
                                        onClick={() => setActiveImage(img)}
                                        className={`h-20 w-28 shrink-0 overflow-hidden rounded-xl border transition ${
                                            selectedImage === img
                                                ? 'border-primary'
                                                : 'border-gray-800 hover:border-gray-600'
                                        }`}
                                    >
                                        <img
                                            src={img}
                                            alt={`Vehicle ${index + 1}`}
                                            className="h-full w-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-100">
                                {vehicle.make} {vehicle.model}
                            </h2>
                            <p className="text-[13px] text-gray-500 mt-1">
                                Plate Number: {vehicle.plateNumber}
                            </p>
                        </div>

                        <Badge status={vehicle.status || 'UNKNOWN'} />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[
                            ['Current Mileage', `${vehicle.currentMileage ?? 0} km`],
                            ['Milestone Interval', `${vehicle.milestoneInterval ?? 0} km`],
                            ...(isManager
                                ? [
                                    [
                                        'Lifecycle',
                                        getLifecycle(vehicle) == null
                                            ? '—'
                                            : `${getLifecycle(vehicle).toFixed(1)}%`,
                                    ],
                                    ['Sale Decision', shouldSellVehicle(vehicle) ? 'Sell' : 'Keep'],
                                ]
                                : []),
                            ['Registered', formatDate(vehicle.registeredAt)],
                        ].map(([label, val]) => (
                            <div key={label} className="bg-gray-800/40 rounded-xl px-3 py-3">
                                <p className="text-[10px] font-medium uppercase tracking-widest text-gray-600 mb-1">
                                    {label}
                                </p>
                                <div className="text-[13px] font-semibold text-gray-200">
                                    {val}
                                </div>
                            </div>
                        ))}
                    </div>

                    {isManager && (
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div>
                                    <p className="text-[10px] font-medium uppercase tracking-widest text-gray-600 mb-1">
                                        Vehicle Health
                                    </p>
                                    <p className="text-[15px] font-semibold text-gray-100">
                                        {getLifecycleLabel(vehicle)}
                                    </p>
                                </div>

                                <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                                    shouldSellVehicle(vehicle)
                                        ? 'bg-red-500/10 text-red-400'
                                        : 'bg-emerald-500/10 text-emerald-400'
                                }`}>
                                    {shouldSellVehicle(vehicle) ? 'Marked for sale' : 'Not for sale'}
                                </span>
                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-gray-800">
                                <div
                                    className={`h-full rounded-full ${
                                        shouldSellVehicle(vehicle)
                                            ? 'bg-red-500'
                                            : 'bg-primary'
                                    }`}
                                    style={{ width: `${Math.min(getLifecycle(vehicle) ?? 0, 100)}%` }}
                                />
                            </div>

                            <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500">
                                <span>0%</span>
                                <span>{getLifecycle(vehicle) == null ? 'No lifecycle score' : `${getLifecycle(vehicle).toFixed(1)}% lifecycle used`}</span>
                                <span>80% sale trigger</span>
                            </div>
                        </div>
                    )}

                    {canRequestTrip && (
                        <button
                            type="button"
                            onClick={() => onRequest?.(vehicle)}
                            disabled={!vehicleAvailable}
                            className="w-full rounded-xl bg-primary py-3 text-[13px] font-bold text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {vehicleAvailable
                                ? 'Request This Vehicle'
                                : 'Vehicle Not Available'}
                        </button>
                    )}

                    {isManager && (
                        <>
                            <form
                                onSubmit={handleUpdateMilestone}
                                className="bg-gray-900 border border-gray-800 rounded-2xl p-4"
                            >
                                <p className="text-[10px] font-medium uppercase tracking-widest text-gray-600 mb-3">
                                    Fleet Manager Control
                                </p>

                                <div className="flex gap-3">
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="New milestone interval"
                                        value={milestoneInterval}
                                        onChange={(e) => setMilestoneInterval(e.target.value)}
                                        required
                                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-[13px] text-gray-200 placeholder-gray-600 focus:outline-none focus:border-gray-500"
                                    />

                                    <button
                                        type="submit"
                                        disabled={updatingMilestone}
                                        className="px-4 py-2 bg-primary text-white text-[12px] font-semibold rounded-lg hover:bg-primary-hover disabled:opacity-50"
                                    >
                                        {updatingMilestone ? 'Updating...' : 'Update'}
                                    </button>
                                </div>
                            </form>

                            <div>
                                <p className="text-[10px] font-medium uppercase tracking-widest text-gray-600 mb-3">
                                    Assignment History
                                </p>

                                {loadingAss ? (
                                    <LoadingSpinner />
                                ) : (
                                    <Table
                                        columns={assignmentCols}
                                        data={assignments ?? []}
                                        emptyMessage="No assignment history."
                                    />
                                )}
                            </div>

                            <div>
                                <p className="text-[10px] font-medium uppercase tracking-widest text-gray-600 mb-3">
                                    Mileage History
                                </p>

                                {loadingMileage && <LoadingSpinner />}
                                {mileageError && (
                                    <ErrorAlert message="Failed to load mileage history." />
                                )}

                                {!loadingMileage && !mileageError && (
                                    <Table
                                        columns={mileageCols}
                                        data={mileageLogs ?? []}
                                        emptyMessage="No mileage history."
                                    />
                                )}
                            </div>

                            <div>
                                <p className="text-[10px] font-medium uppercase tracking-widest text-gray-600 mb-3">
                                    Service History
                                </p>

                                <Table
                                    columns={serviceHistoryCols}
                                    data={vehicle.serviceHistories ?? []}
                                    emptyMessage="No service history."
                                />
                            </div>
                        </>
                    )}
                </div>
            )}
        </Modal>
    )
}

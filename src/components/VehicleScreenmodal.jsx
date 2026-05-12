import { useState } from 'react'
import toast from 'react-hot-toast'
import {
    useGetVehicleQuery,
    useGetVehicleAssignmentsQuery,
    useGetMileageLogsByVehicleQuery,
    useUpdateVehicleMilestoneIntervalMutation,
} from '../apis/fleetApi'
import Modal from '../components/Modal.jsx'
import Badge from '../components/Badge.jsx'
import Table from '../components/Table.jsx'
import { LoadingSpinner, ErrorAlert } from '../components/Feedback.jsx'
import { formatDate, getErrorMessage } from '../utils/format.js'

export default function VehicleDetailModal({ vehicleId, onClose }) {
    const [milestoneInterval, setMilestoneInterval] = useState('')

    const {
        data: vehicle,
        isLoading,
        isError,
    } = useGetVehicleQuery(vehicleId, { skip: !vehicleId })

    const {
        data: assignments,
        isLoading: loadingAss,
    } = useGetVehicleAssignmentsQuery(vehicleId, { skip: !vehicleId })

    const {
        data: mileageLogs,
        isLoading: loadingMileage,
        isError: mileageError,
    } = useGetMileageLogsByVehicleQuery(vehicleId, { skip: !vehicleId })

    const [updateMilestone, { isLoading: updatingMilestone }] =
        useUpdateVehicleMilestoneIntervalMutation()

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
        {
            key: 'fieldStaffName',
            label: 'Staff',
            render: (r) => r.fieldStaffName || 'N/A',
        },
        {
            key: 'destination',
            label: 'Destination',
            render: (r) => r.destination || 'N/A',
        },
        {
            key: 'startDate',
            label: 'From',
            render: (r) => formatDate(r.startDate),
        },
        {
            key: 'endDate',
            label: 'To',
            render: (r) => formatDate(r.endDate),
        },
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
            render: (r) => {
                const reported = r.reportedMileage ?? 0
                const previous = r.previousMileage ?? 0
                const added = r.mileageAdded ?? reported - previous

                return `${added} km`
            },
        },
        {
            key: 'submittedByName',
            label: 'Logged By',
            render: (r) =>
                r.submittedByName ||
                r.loggedByName ||
                r.fieldStaffName ||
                'N/A',
        },
        {
            key: 'loggedAt',
            label: 'Date',
            render: (r) => formatDate(r.loggedAt || r.createdAt),
        },
    ]

    return (
        <Modal
            open={!!vehicleId}
            onClose={onClose}
            title="Vehicle Details"
            size="xl"
        >
            {isLoading && <LoadingSpinner />}

            {isError && (
                <ErrorAlert message="Failed to load vehicle." />
            )}

            {vehicle && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            ['Plate', vehicle.plateNumber],
                            ['Make', vehicle.make],
                            ['Model', vehicle.model],
                            ['Current Mileage', `${vehicle.currentMileage ?? 0} km`],
                            ['Milestone Interval', `${vehicle.milestoneInterval ?? 0} km`],
                            ['Status', <Badge key="s" status={vehicle.status || 'UNKNOWN'} />],
                        ].map(([label, val]) => (
                            <div
                                key={label}
                                className="bg-gray-800/40 rounded-xl px-3 py-3"
                            >
                                <p className="text-[10px] font-medium uppercase tracking-widest text-gray-600 mb-1">
                                    {label}
                                </p>

                                <div className="text-[13px] font-semibold text-gray-200">
                                    {val}
                                </div>
                            </div>
                        ))}
                    </div>

                    <form
                        onSubmit={handleUpdateMilestone}
                        className="bg-gray-900 border border-gray-800 rounded-2xl p-4"
                    >
                        <p className="text-[10px] font-medium uppercase tracking-widest text-gray-600 mb-3">
                            Update Milestone Interval
                        </p>

                        <div className="flex gap-3">
                            <input
                                type="number"
                                min="1"
                                placeholder="e.g. 10000"
                                value={milestoneInterval}
                                onChange={(e) => setMilestoneInterval(e.target.value)}
                                required
                                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-[13px] text-gray-200 placeholder-gray-600 focus:outline-none focus:border-gray-500"
                            />

                            <button
                                type="submit"
                                disabled={updatingMilestone}
                                className="px-4 py-2 bg-primary text-gray-900 text-[12px] font-semibold rounded-lg hover:opacity-90 disabled:opacity-50"
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
                </div>
            )}
        </Modal>
    )
}
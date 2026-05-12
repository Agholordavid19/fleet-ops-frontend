import {
    useGetVehicleQuery,
    useGetVehicleAssignmentsQuery,
    useGetMileageLogsByVehicleQuery
} from '../apis/fleetApi'
import Modal from '../components/Modal.jsx'
import Badge from '../components/Badge.jsx'
import Table from '../components/Table.jsx'
import { LoadingSpinner, ErrorAlert } from '../components/Feedback.jsx'
import { formatDate } from '../utils/format.js'

export default function VehicleDetailModal({ vehicleId, onClose }) {
    const {
        data: vehicle,
        isLoading,
        isError
    } = useGetVehicleQuery(vehicleId, { skip: !vehicleId })

    const {
        data: assignments,
        isLoading: loadingAss
    } = useGetVehicleAssignmentsQuery(vehicleId, { skip: !vehicleId })

    const {
        data: mileageLogs,
        isLoading: loadingMileage,
        isError: mileageError
    } = useGetMileageLogsByVehicleQuery(vehicleId, { skip: !vehicleId })

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
            render: (r) => `${r.mileageAdded ?? 0} km`,
        },
        {
            key: 'loggedByName',
            label: 'Logged By',
            render: (r) => r.loggedByName || r.fieldStaffName || 'N/A',
        },
        {
            key: 'createdAt',
            label: 'Date',
            render: (r) => formatDate(r.createdAt || r.loggedAt),
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
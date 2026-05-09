import { useGetVehicleQuery, useGetVehicleAssignmentsQuery } from '../apis/fleetApi'
import Modal from '../components/Modal.jsx'
import Badge from '../components/Badge.jsx'
import Table from '../components/Table.jsx'
import { LoadingSpinner, ErrorAlert } from '../components/Feedback.jsx'
import { formatDate } from '../utils/format.js'

export default function VehicleDetailModal({ vehicleId, onClose }) {
    const { data: vehicle, isLoading, isError } = useGetVehicleQuery(vehicleId, { skip: !vehicleId })
    const { data: assignments, isLoading: loadingAss } = useGetVehicleAssignmentsQuery(vehicleId, { skip: !vehicleId })

    const assignmentCols = [
        { key: 'staffName',  label: 'Staff' },
        { key: 'destination', label: 'Destination' },
        { key: 'startDate',  label: 'From', render: (r) => formatDate(r.startDate) },
        { key: 'endDate',    label: 'To',   render: (r) => formatDate(r.endDate) },
        { key: 'status',     label: 'Status', render: (r) => <Badge status={r.status} /> },
    ]

    return (
        <Modal open={!!vehicleId} onClose={onClose} title="Vehicle Details">
            {isLoading && <LoadingSpinner />}
            {isError && <ErrorAlert message="Failed to load vehicle." />}
            {vehicle && (
                <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            ['Plate', vehicle.plateNumber],
                            ['Make', vehicle.make],
                            ['Model', vehicle.model],
                            ['Status', <Badge key="s" status={vehicle.status} />],
                        ].map(([label, val]) => (
                            <div key={label} className="bg-gray-800/40 rounded-xl px-3 py-3">
                                <p className="text-[10px] font-medium uppercase tracking-widest text-gray-600 mb-1">{label}</p>
                                <p className="text-[13px] font-semibold text-gray-200">{val}</p>
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
                            <Table columns={assignmentCols} data={assignments} emptyMessage="No assignment history." />
                        )}
                    </div>
                </div>
            )}
        </Modal>
    )
}
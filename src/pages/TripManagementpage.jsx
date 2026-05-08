import toast from 'react-hot-toast'
import { useGetTripRequestsQuery, useApproveTripMutation, useRejectTripMutation } from '../apis/fleetApi.jsx'
import Table from '../components/Table'
import Badge from '../components/Badge'
import PageHeader from '../components/PageHeader'
import { LoadingSpinner, ErrorAlert } from '../components/Feedback'
import { formatDate } from '../utils/format.js'

export default function TripManagementScreen() {
    const { data: trips, isLoading, isError } = useGetTripRequestsQuery()
    const [approveTrip, { isLoading: approving }] = useApproveTripMutation()
    const [rejectTrip,  { isLoading: rejecting }]  = useRejectTripMutation()

    const handleApprove = async (id) => {
        try {
            await approveTrip(id).unwrap()
            toast.success('Trip approved')
        } catch {
            toast.error('Failed to approve trip')
        }
    }

    const handleReject = async (id) => {
        try {
            await rejectTrip(id).unwrap()
            toast.success('Trip rejected')
        } catch {
            toast.error('Failed to reject trip')
        }
    }

    const columns = [
        { key: 'staffName',   label: 'Requested By' },
        { key: 'vehiclePlate', label: 'Vehicle' },
        { key: 'destination', label: 'Destination' },
        { key: 'startDate',   label: 'Start', render: (r) => formatDate(r.startDate) },
        { key: 'endDate',     label: 'End',   render: (r) => formatDate(r.endDate) },
        { key: 'status',      label: 'Status', render: (r) => <Badge status={r.status} /> },
        {
            key: 'actions',
            label: 'Actions',
            render: (row) =>
                row.status === 'PENDING' ? (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleApprove(row.id)}
                            disabled={approving}
                            className="text-[11px] bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg font-medium transition-all duration-150 disabled:opacity-40"
                        >
                            Approve
                        </button>
                        <button
                            onClick={() => handleReject(row.id)}
                            disabled={rejecting}
                            className="text-[11px] bg-red-500/10 text-red-400 hover:bg-red-500/20 px-3 py-1.5 rounded-lg font-medium transition-all duration-150 disabled:opacity-40"
                        >
                            Reject
                        </button>
                    </div>
                ) : (
                    <span className="text-[13px] text-gray-700">—</span>
                ),
        },
    ]

    const pending = trips?.filter((t) => t.status === 'PENDING') ?? []

    return (
        <>
            <PageHeader
                title="Trip Requests"
                subtitle={`${pending.length} pending approval`}
            />

            {isLoading && <LoadingSpinner />}
            {isError && <ErrorAlert message="Failed to load trip requests." />}
            {!isLoading && !isError && (
                <Table columns={columns} data={trips} emptyMessage="No trip requests." />
            )}
        </>
    )
}
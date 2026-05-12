import { useState } from 'react'
import toast from 'react-hot-toast'
import {
    useGetAllTripRequestsQuery,
    useApproveTripMutation,
    useRejectTripMutation
} from '../apis/fleetApi.jsx'
import Table from '../components/Table'
import Badge from '../components/Badge'
import PageHeader from '../components/PageHeader'
import { LoadingSpinner, ErrorAlert } from '../components/Feedback'
import { formatDate } from '../utils/format.js'

export default function TripManagementScreen() {
    const { data: trips, isLoading, isError } = useGetAllTripRequestsQuery()
    const [approveTrip] = useApproveTripMutation()
    const [rejectTrip] = useRejectTripMutation()
    const [loadingId, setLoadingId] = useState(null)
    const [filter, setFilter] = useState('PENDING')

    const allTrips = trips ?? []

    const filteredTrips = allTrips.filter((trip) => {
        if (filter === 'ALL') return true
        return trip.status === filter
    })

    const pending = allTrips.filter((t) => t.status === 'PENDING')

    const handleApprove = async (id) => {
        setLoadingId(`approve-${id}`)
        try {
            await approveTrip(id).unwrap()
            toast.success('Trip approved')
        } catch {
            toast.error('Failed to approve trip')
        } finally {
            setLoadingId(null)
        }
    }

    const handleReject = async (id) => {
        setLoadingId(`reject-${id}`)
        try {
            await rejectTrip(id).unwrap()
            toast.success('Trip rejected')
        } catch {
            toast.error('Failed to reject trip')
        } finally {
            setLoadingId(null)
        }
    }

    const columns = [
        { key: 'fieldStaffName', label: 'Requested By' },
        { key: 'plateNumber', label: 'Vehicle' },
        { key: 'destination', label: 'Destination' },
        { key: 'startDate', label: 'Start', render: (r) => formatDate(r.startDate) },
        { key: 'endDate', label: 'End', render: (r) => formatDate(r.endDate) },
        { key: 'status', label: 'Status', render: (r) => <Badge status={r.status} /> },
        {
            key: 'actions',
            label: 'Actions',
            render: (row) =>
                row.status === 'PENDING' ? (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleApprove(row.id)}
                            disabled={loadingId !== null}
                            className="text-[11px] bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg font-medium transition-all duration-150 disabled:opacity-40"
                        >
                            {loadingId === `approve-${row.id}` ? '...' : 'Approve'}
                        </button>
                        <button
                            onClick={() => handleReject(row.id)}
                            disabled={loadingId !== null}
                            className="text-[11px] bg-red-500/10 text-red-400 hover:bg-red-500/20 px-3 py-1.5 rounded-lg font-medium transition-all duration-150 disabled:opacity-40"
                        >
                            {loadingId === `reject-${row.id}` ? '...' : 'Reject'}
                        </button>
                    </div>
                ) : (
                    <span className="text-[13px] text-gray-700">—</span>
                ),
        },
    ]

    const filters = ['PENDING', 'APPROVED', 'COMPLETED', 'REJECTED', 'ALL']

    return (
        <>
            <PageHeader
                title="Trip Requests"
                subtitle={`${pending.length} pending approval`}
            />

            <div className="flex flex-wrap gap-2 mb-5">
                {filters.map((item) => (
                    <button
                        key={item}
                        onClick={() => setFilter(item)}
                        className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                            filter === item
                                ? 'bg-primary text-gray-900'
                                : 'bg-gray-800 text-gray-400 hover:text-gray-200'
                        }`}
                    >
                        {item}
                    </button>
                ))}
            </div>

            {isLoading && <LoadingSpinner />}
            {isError && <ErrorAlert message="Failed to load trip requests." />}

            {!isLoading && !isError && (
                <>
                    <div className="block md:hidden space-y-3">
                        {filteredTrips.length === 0 ? (
                            <p className="text-[13px] text-gray-600 text-center py-8">
                                No trip requests.
                            </p>
                        ) : (
                            filteredTrips.map((row) => (
                                <div
                                    key={row.id}
                                    className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-4 space-y-3"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className="text-[13px] font-semibold text-gray-100">
                                                {row.fieldStaffName}
                                            </p>
                                            <p className="text-[12px] text-gray-500 mt-0.5">
                                                {row.plateNumber ?? '—'}
                                            </p>
                                        </div>
                                        <Badge status={row.status} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[12px]">
                                        <div>
                                            <span className="text-gray-600">Destination</span>
                                            <p className="text-gray-300">{row.destination}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Start</span>
                                            <p className="text-gray-300">{formatDate(row.startDate)}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">End</span>
                                            <p className="text-gray-300">{formatDate(row.endDate)}</p>
                                        </div>
                                    </div>

                                    {row.status === 'PENDING' && (
                                        <div className="flex items-center gap-2 border-t border-gray-800 pt-3">
                                            <button
                                                onClick={() => handleApprove(row.id)}
                                                disabled={loadingId !== null}
                                                className="flex-1 text-[12px] bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 py-2 rounded-lg font-medium transition-all duration-150 disabled:opacity-40"
                                            >
                                                {loadingId === `approve-${row.id}` ? '...' : 'Approve'}
                                            </button>
                                            <button
                                                onClick={() => handleReject(row.id)}
                                                disabled={loadingId !== null}
                                                className="flex-1 text-[12px] bg-red-500/10 text-red-400 hover:bg-red-500/20 py-2 rounded-lg font-medium transition-all duration-150 disabled:opacity-40"
                                            >
                                                {loadingId === `reject-${row.id}` ? '...' : 'Reject'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    <div className="hidden md:block">
                        <Table
                            columns={columns}
                            data={filteredTrips}
                            emptyMessage="No trip requests."
                        />
                    </div>
                </>
            )}
        </>
    )
}
import { useState } from 'react'
import toast from 'react-hot-toast'
import {
    useGetMyApprovedTripRequestsQuery,
    useCompleteTripMutation
} from '../apis/fleetApi.jsx'
import Table from '../components/Table.jsx'
import Badge from '../components/Badge.jsx'
import PageHeader from '../components/PageHeader'
import { LoadingSpinner, ErrorAlert } from '../components/Feedback'
import { formatDate, getErrorMessage } from '../utils/format.js'

export default function CompleteTripPage() {
    const { data: trips, isLoading, isError } = useGetMyApprovedTripRequestsQuery()
    const [completeTrip] = useCompleteTripMutation()
    const [loadingId, setLoadingId] = useState(null)

    const approvedTrips = trips ?? []

    const handleComplete = async (id) => {
        setLoadingId(id)

        try {
            await completeTrip({ id }).unwrap()
            toast.success('Trip completed successfully')
        } catch (err) {
            toast.error(getErrorMessage(err))
        } finally {
            setLoadingId(null)
        }
    }

    const columns = [
        { key: 'plateNumber', label: 'Vehicle' },
        { key: 'destination', label: 'Destination' },
        {
            key: 'startDate',
            label: 'Start',
            render: (row) => formatDate(row.startDate),
        },
        {
            key: 'endDate',
            label: 'End',
            render: (row) => formatDate(row.endDate),
        },
        {
            key: 'status',
            label: 'Status',
            render: (row) => <Badge status={row.status} />,
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (row) => (
                <button
                    onClick={() => handleComplete(row.id)}
                    disabled={loadingId !== null}
                    className="text-[12px] bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-lg font-medium transition-all duration-150 disabled:opacity-40"
                >
                    {loadingId === row.id ? 'Completing...' : 'Complete Trip'}
                </button>
            ),
        },
    ]

    return (
        <>
            <PageHeader
                title="Complete Trips"
                subtitle="Mark approved trips as completed"
            />

            {isLoading && <LoadingSpinner />}

            {isError && (
                <ErrorAlert message="Failed to load approved trips." />
            )}

            {!isLoading && !isError && (
                <Table
                    columns={columns}
                    data={approvedTrips}
                    emptyMessage="No approved trips available to complete."
                />
            )}
        </>
    )
}
import { useState } from 'react'
import toast from 'react-hot-toast'
import {
    useGetAllTripRequestsQuery,
    useGetMyApprovedTripRequestsQuery,
    useCompleteTripMutation
} from '../apis/fleetApi.jsx'
import Table from '../components/Table.jsx'
import Badge from '../components/Badge.jsx'
import PageHeader from "../components/Pageheader";
import { LoadingSpinner, ErrorAlert } from '../components/Feedback'
import { formatDate, getErrorMessage } from '../utils/format.js'
import { useAuth } from '../utils/useAuth.jsx'

export default function CompleteTripPage() {
    const { role } = useAuth()
    const isFieldStaff = role === 'FIELD_STAFF'

    const {
        data: myApprovedTrips,
        isLoading: isLoadingMine,
        isError: isMineError,
    } = useGetMyApprovedTripRequestsQuery(undefined, {
        skip: !isFieldStaff,
    })

    const {
        data: allTrips,
        isLoading: isLoadingAll,
        isError: isAllError,
    } = useGetAllTripRequestsQuery(undefined, {
        skip: isFieldStaff,
    })

    const [completeTrip] = useCompleteTripMutation()
    const [loadingId, setLoadingId] = useState(null)

    const approvedTrips = isFieldStaff
        ? (myApprovedTrips ?? [])
        : (allTrips ?? []).filter((trip) => trip.status === 'APPROVED')
    const isLoading = isFieldStaff ? isLoadingMine : isLoadingAll
    const isError = isFieldStaff ? isMineError : isAllError

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
                    className="text-[12px] bg-primary text-white hover:bg-primary-hover px-3 py-1.5 rounded-lg font-semibold transition-all duration-150 disabled:opacity-40"
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

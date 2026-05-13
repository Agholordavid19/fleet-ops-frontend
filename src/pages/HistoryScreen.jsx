import { useState } from 'react'
import toast from 'react-hot-toast'
import {
    useCompleteTripMutation,
    useGetMyTripRequestsQuery,
} from '../apis/fleetApi'

import Table from '../components/Table.jsx'
import Badge from '../components/Badge'
import PageHeader from "../components/Pageheader";
import { LoadingSpinner, ErrorAlert } from '../components/Feedback'
import { formatDate, getErrorMessage } from '../utils/format.js'

export default function HistoryScreen() {
    const {
        data: trips,
        isLoading,
        isError,
    } = useGetMyTripRequestsQuery()
    const [completeTrip] = useCompleteTripMutation()

    const [activeTab, setActiveTab] = useState('ALL')
    const [completingId, setCompletingId] = useState(null)

    const myTrips = trips ?? []

    const filteredTrips = myTrips.filter((trip) => {
        if (activeTab === 'COMPLETED') return trip.status === 'COMPLETED'

        if (activeTab === 'PRESENT') {
            return ['PENDING', 'APPROVED', 'ONGOING', 'IN_PROGRESS'].includes(trip.status)
        }

        return true
    })

    const handleComplete = async (id) => {
        setCompletingId(id)

        try {
            await completeTrip({ id }).unwrap()
            toast.success('Trip completed')
        } catch (err) {
            toast.error(getErrorMessage(err))
        } finally {
            setCompletingId(null)
        }
    }

    const baseColumns = [
        { key: 'plateNumber', label: 'Vehicle' },
        { key: 'destination', label: 'Destination' },
        {
            key: 'startDate',
            label: 'Start',
            render: (r) => formatDate(r.startDate),
        },
        {
            key: 'endDate',
            label: 'End',
            render: (r) => formatDate(r.endDate),
        },
        {
            key: 'status',
            label: 'Status',
            render: (r) => <Badge status={r.status} />,
        },
    ]

    const columns = activeTab === 'PRESENT'
        ? [
            ...baseColumns,
            {
                key: 'actions',
                label: 'Actions',
                render: (row) => {
                    if (row.status !== 'APPROVED') {
                        return <span className="text-[13px] text-gray-700">—</span>
                    }

                    return (
                        <button
                            type="button"
                            onClick={() => handleComplete(row.id)}
                            disabled={completingId !== null}
                            className="text-[12px] bg-primary text-white hover:bg-primary-hover px-3 py-1.5 rounded-lg font-semibold transition-all duration-150 disabled:opacity-40"
                        >
                            {completingId === row.id ? 'Completing...' : 'Complete Trip'}
                        </button>
                    )
                },
            },
        ]
        : baseColumns

    const tabs = [
        { key: 'ALL', label: 'All Trips' },
        { key: 'PRESENT', label: 'Present Trips' },
        { key: 'COMPLETED', label: 'Completed Trips' },
    ]

    return (
        <>
            <PageHeader
                title="Trip History"
                subtitle="View your present, pending, and completed trips"
            />

            <div className="flex gap-2 mb-5">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                            activeTab === tab.key
                                ? 'bg-primary text-white'
                                : 'bg-gray-800 text-gray-400 hover:text-gray-200'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {isLoading && <LoadingSpinner />}

            {isError && (
                <ErrorAlert message="Failed to load trip history." />
            )}

            {!isLoading && !isError && (
                <Table
                    columns={columns}
                    data={filteredTrips}
                    emptyMessage="No trips found."
                />
            )}
        </>
    )
}

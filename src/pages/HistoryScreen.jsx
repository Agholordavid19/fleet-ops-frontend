import { useState } from 'react'
import { useGetMyTripRequestsQuery } from '../apis/fleetApi'

import Table from '../components/Table.jsx'
import Badge from '../components/Badge'
import PageHeader from '../components/PageHeader'
import { LoadingSpinner, ErrorAlert } from '../components/Feedback'
import { formatDate } from '../utils/format.js'

export default function HistoryScreen() {
    const {
        data: trips,
        isLoading,
        isError,
    } = useGetMyTripRequestsQuery()

    const [activeTab, setActiveTab] = useState('ALL')

    const myTrips = trips ?? []

    const filteredTrips =
        activeTab === 'COMPLETED'
            ? myTrips.filter((trip) => trip.status === 'COMPLETED')
            : myTrips

    const columns = [
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

    return (
        <>
            <PageHeader
                title="Trip History"
                subtitle="View all your trip requests and completed trips"
            />

            <div className="flex gap-2 mb-5">
                {['ALL', 'COMPLETED'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                            activeTab === tab
                                ? 'bg-primary text-gray-900'
                                : 'bg-gray-800 text-gray-400 hover:text-gray-200'
                        }`}
                    >
                        {tab === 'ALL' ? 'All Trips' : 'Completed Trips'}
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
                    emptyMessage="No trip history."
                />
            )}
        </>
    )
}
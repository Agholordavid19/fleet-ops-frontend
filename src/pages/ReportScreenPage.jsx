import { useGetUtilisationReportQuery, useGetVehicleHealthReportQuery } from '../apis/fleetApi.jsx'
import PageHeader from '../components/PageHeader'
import Table from '../components/Table.jsx'
import Badge from '../components/Badge'
import { LoadingSpinner, ErrorAlert, StatCard } from '../components/Feedback'
import { formatDate } from '../utils/format.js'

export default function ReportsScreen() {
    const { data: util, isLoading: loadingUtil, isError: errorUtil } = useGetUtilisationReportQuery()
    const { data: health, isLoading: loadingHealth, isError: errorHealth } = useGetVehicleHealthReportQuery()

    const utilisationCols = [
        { key: 'vehiclePlate', label: 'Plate' },
        { key: 'make',         label: 'Make' },
        { key: 'model',        label: 'Model' },
        { key: 'totalTrips',   label: 'Total Trips' },
        { key: 'totalMileage', label: 'Total Mileage (km)' },
        {
            key: 'utilisationRate',
            label: 'Utilisation %',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-800 rounded-full h-1.5 w-20">
                        <div
                            className="bg-primary h-1.5 rounded-full"
                            style={{ width: `${Math.min(row.utilisationRate ?? 0, 100)}%` }}
                        />
                    </div>
                    <span>{row.utilisationRate ?? 0}%</span>
                </div>
            ),
        },
    ]

    const healthCols = [
        { key: 'plateNumber', label: 'Plate' },
        { key: 'make',         label: 'Make' },
        { key: 'model',        label: 'Model' },
        {
            key: 'status',
            label: 'Status',
            render: (row) => <Badge status={row.status} />,
        },
        { key: 'openMaintenanceFlags', label: 'Open Flags' },
        { key: 'lastMaintained', label: 'Last Maintained', render: (row) => formatDate(row.lastMaintained) },
    ]

    return (
        <>
            <PageHeader title="Fleet Reports" subtitle="Operational overview and health metrics" />

            {/* Fleet Utilisation */}
            <section className="mb-8">
                <h2 className="text-[11px] font-medium uppercase tracking-widest text-gray-600 mb-4">
                    Fleet Utilisation
                </h2>
                {loadingUtil && <LoadingSpinner />}
                {errorUtil && <ErrorAlert message="Failed to load utilisation report." />}
                {!loadingUtil && !errorUtil && (
                    <>
                        <div className="grid grid-cols-3 gap-3 mb-6">
                            <StatCard label="Total Vehicles" value={util?.totalVehicles ?? '—'} color="blue" />
                            <StatCard label="Pending Requests" value={util?.pendingTripRequests ?? '—'} color="green" />
                            <StatCard label="Total Trips" value={util?.totalTripsAllTime ?? '—'} color="purple" />
                        </div>
                        <Table columns={utilisationCols} data={util?.vehicles} emptyMessage="No utilisation data." />
                    </>
                )}
            </section>

            {/* Vehicle Health */}
            <section>
                <h2 className="text-[11px] font-medium uppercase tracking-widest text-gray-600 mb-4">
                    Vehicle Health Summary
                </h2>
                {loadingHealth && <LoadingSpinner />}
                {errorHealth && <ErrorAlert message="Failed to load health report." />}
                {!loadingHealth && !errorHealth && (
                    <>
                        <div className="grid grid-cols-3 gap-3 mb-6">
                            <StatCard label="Healthy" value={health?.filter(v => v.status === 'AVAILABLE').length ?? '—'} color="green" />
                            <StatCard label="In Maintenance" value={health?.filter(v => v.status === 'MAINTENANCE').length ?? '—'} color="amber" />
                            <StatCard label="Critical Flags" value={health?.reduce((sum, v) => sum + (v.openMaintenanceFlags ?? 0), 0) ?? '—'} color="red" />
                        </div>
                        <Table columns={healthCols} data={health} emptyMessage="No health data." />
                    </>
                )}
            </section>
        </>
    )
}
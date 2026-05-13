import {
    useGetVehiclesQuery,
    useGetUtilisationReportQuery,
    useGetVehicleHealthReportQuery,
} from '../apis/fleetApi.jsx'
import PageHeader from "../components/Pageheader";
import { LoadingSpinner, ErrorAlert, StatCard } from '../components/Feedback'

const average = (items, selector) => {
    const values = items
        .map(selector)
        .map(Number)
        .filter(Number.isFinite)

    if (values.length === 0) return null

    return values.reduce((sum, value) => sum + value, 0) / values.length
}

const formatKm = (value) =>
    value == null
        ? '—'
        : `${Math.round(value).toLocaleString()} km`

const formatPercent = (value) =>
    value == null
        ? '—'
        : `${Number(value).toFixed(1)}%`

const getLifecycle = (vehicle) => {
    const value = Number(vehicle?.lifecyclePercentage)
    return Number.isFinite(value) ? value : null
}

const isMarkedForSale = (vehicle) =>
    vehicle?.markedForSale === true ||
    vehicle?.status === 'OUT_OF_SERVICE' ||
    (getLifecycle(vehicle) ?? 0) >= 80

export default function ReportsScreen() {
    const { data: util, isLoading: loadingUtil, isError: errorUtil } = useGetUtilisationReportQuery()
    const { data: health, isLoading: loadingHealth, isError: errorHealth } = useGetVehicleHealthReportQuery()
    const { data: vehicles, isLoading: loadingVehicles } = useGetVehiclesQuery()

    const healthRows = health ?? []
    const vehicleRows = vehicles ?? []
    const outOfServiceCount = healthRows.filter((v) => v.status === 'OUT_OF_SERVICE').length
    const openFlagsCount = healthRows.reduce((sum, v) => sum + (v.openMaintenanceFlags ?? 0), 0)
    const averageMileage = average(healthRows, (v) => v.currentMileage)
    const averageMilestone = average(healthRows, (v) => v.milestoneInterval)
    const averageLifecycle = average(vehicleRows, getLifecycle)
    const sellCount = vehicleRows.length
        ? vehicleRows.filter(isMarkedForSale).length
        : outOfServiceCount

    return (
        <>
            <PageHeader title="Fleet Reports" subtitle="Operational overview and health metrics" />

            <section className="mb-8">
                <h2 className="text-[11px] font-medium uppercase tracking-widest text-gray-600 mb-4">
                    Fleet Utilisation
                </h2>
                {loadingUtil && <LoadingSpinner />}
                {errorUtil && <ErrorAlert message="Failed to load utilisation report." />}
                {!loadingUtil && !errorUtil && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                        <StatCard label="Total Vehicles" value={util?.totalVehicles ?? '—'} color="blue" />
                        <StatCard label="Available" value={util?.availableVehicles ?? '—'} color="green" />
                        <StatCard label="Assigned" value={util?.assignedVehicles ?? '—'} color="blue" />
                        <StatCard label="In Maintenance" value={util?.maintenanceVehicles ?? '—'} color="amber" />
                        <StatCard label="Total Trips" value={util?.totalTripsAllTime ?? '—'} color="purple" />
                        <StatCard label="Pending Requests" value={util?.pendingTripRequests ?? '—'} color="amber" />
                    </div>
                )}
            </section>

            {/* Vehicle Health */}
            <section>
                <h2 className="text-[11px] font-medium uppercase tracking-widest text-gray-600 mb-4">
                    Vehicle Health Summary
                </h2>
                {loadingHealth && <LoadingSpinner />}
                {errorHealth && <ErrorAlert message="Failed to load health report." />}
                {!loadingHealth && !errorHealth && !loadingVehicles && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                        <StatCard label="Tracked Vehicles" value={healthRows.length} color="blue" />
                        <StatCard label="To Sell" value={sellCount} color="red" />
                        <StatCard label="Average Mileage" value={formatKm(averageMileage)} color="blue" />
                        <StatCard label="Average Lifecycle" value={formatPercent(averageLifecycle)} color="amber" />
                        <StatCard label="Average Milestone" value={formatKm(averageMilestone)} color="purple" />
                        <StatCard label="Out of Service" value={outOfServiceCount} color="red" />
                        <StatCard label="Open Flags" value={openFlagsCount} color="red" />
                    </div>
                )}
            </section>
        </>
    )
}

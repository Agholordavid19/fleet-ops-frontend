import { useState } from 'react'
import { useGetActivityLogsQuery } from '../apis/fleetApi.jsx'
import PageHeader from "../components/Pageheader";
import { LoadingSpinner, ErrorAlert } from '../components/Feedback'

const EVENT_COLORS = {
    TRIP_APPROVED:   { dot: 'bg-emerald-500', badge: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    TRIP_REJECTED:   { dot: 'bg-red-500',     badge: 'text-red-400 bg-red-500/10 border-red-500/20'           },
    TRIP_STARTED:    { dot: 'bg-blue-400',    badge: 'text-blue-400 bg-blue-500/10 border-blue-500/20'        },
    TRIP_COMPLETED:  { dot: 'bg-cyan-400',    badge: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'        },
    VEHICLE_CREATED: { dot: 'bg-violet-400',  badge: 'text-violet-400 bg-violet-500/10 border-violet-500/20'  },
    FLAG_RAISED:     { dot: 'bg-amber-400',   badge: 'text-amber-400 bg-amber-500/10 border-amber-500/20'     },
    FLAG_RESOLVED:   { dot: 'bg-teal-400',    badge: 'text-teal-400 bg-teal-500/10 border-teal-500/20'       },
    MILEAGE_LOGGED:  { dot: 'bg-sky-400',     badge: 'text-sky-400 bg-sky-500/10 border-sky-500/20'          },
}

const DEFAULT_COLOR = { dot: 'bg-gray-500', badge: 'text-gray-400 bg-gray-500/10 border-gray-500/20' }

function getColor(eventType) {
    return EVENT_COLORS[eventType] ?? DEFAULT_COLOR
}

function formatDateTime(iso) {
    const d = new Date(iso)
    return {
        date: d.toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
            timeZone: 'UTC'
        }),
        time: d.toLocaleTimeString('en-GB', {
            hour: '2-digit', minute: '2-digit',
            timeZone: 'UTC'
        }),
    }
}

export default function ActivityLogPage() {
    const [plateNumber, setPlateNumber] = useState('')
    const [date,        setDate]        = useState('')
    const [filters,     setFilters]     = useState({ plateNumber: '', date: '' })

    const { data: logs = [], isLoading, isError, isFetching } = useGetActivityLogsQuery(filters, {
        pollingInterval: 30000 // every 30 seconds
    })

    const handleSearch = (e) => {
        e.preventDefault()
        setFilters({ plateNumber: plateNumber.trim(), date })
    }

    const handleClear = () => {
        setPlateNumber('')
        setDate('')
        setFilters({ plateNumber: '', date: '' })
    }

    const hasFilters = filters.plateNumber || filters.date

    return (
        <>
            <PageHeader title="Activity Logs" subtitle="Full audit trail of all vehicle events" />

            <div className="space-y-5">

                {/* ── Filters ── */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                    <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-end">
                        <div className="flex flex-col gap-1.5 min-w-[160px]">
                            <label className="text-[10px] font-medium uppercase tracking-widest text-gray-600">
                                Plate Number
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. ABC-123"
                                value={plateNumber}
                                onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-[13px] text-gray-200 placeholder-gray-600 focus:outline-none focus:border-gray-500 transition-colors"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-medium uppercase tracking-widest text-gray-600">
                                Date
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-[13px] text-gray-200 focus:outline-none focus:border-gray-500 transition-colors [color-scheme:dark]"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-primary text-white text-[12px] font-semibold rounded-lg hover:bg-primary-hover transition-colors"
                        >
                            Search
                        </button>
                        {hasFilters && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="px-4 py-2 bg-gray-800 text-gray-400 text-[12px] rounded-lg hover:text-gray-200 hover:bg-gray-700 transition-colors"
                            >
                                Clear
                            </button>
                        )}
                    </form>
                </div>

                {/* ── Table ── */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">

                    {/* Header */}
                    <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
                        <div>
                            <p className="text-[13px] font-semibold text-gray-200">Vehicle Events</p>
                            {!isLoading && (
                                <p className="text-[11px] text-gray-600 mt-0.5">
                                    {logs.length} {logs.length === 1 ? 'entry' : 'entries'}
                                    {hasFilters && ' matching filters'}
                                </p>
                            )}
                        </div>
                        {isFetching && !isLoading && (
                            <span className="text-[11px] text-gray-600 animate-pulse">Refreshing…</span>
                        )}
                    </div>

                    {/* States */}
                    {isLoading && (
                        <div className="py-16 flex justify-center">
                            <LoadingSpinner />
                        </div>
                    )}
                    {isError && (
                        <div className="p-5">
                            <ErrorAlert message="Failed to load activity logs." />
                        </div>
                    )}

                    {/* Table */}
                    {!isLoading && !isError && (
                        <>
                            {/* Column headers */}
                            <div className="grid grid-cols-[140px_160px_1fr_140px_120px_160px] gap-4 px-5 py-2.5 border-b border-gray-800/60">
                                {['Plate', 'Event', 'Description', 'Actor', 'Role', 'Time'].map(h => (
                                    <span key={h} className="text-[10px] font-medium uppercase tracking-widest text-gray-600">
                                        {h}
                                    </span>
                                ))}
                            </div>

                            {logs.length === 0 ? (
                                <div className="py-16 text-center">
                                    <p className="text-[13px] text-gray-600">
                                        {hasFilters ? 'No logs match your filters.' : 'No activity logged yet.'}
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-800/50">
                                    {logs.map((log) => {
                                        const color = getColor(log.eventType)
                                        const { date: d, time: t } = formatDateTime(log.occurredAt)
                                        return (
                                            <div
                                                key={log.id}
                                                className="grid grid-cols-[140px_160px_1fr_140px_120px_160px] gap-4 px-5 py-3.5 hover:bg-gray-800/40 transition-colors duration-100"
                                            >
                                                {/* Plate */}
                                                <span className="text-[12px] font-mono font-semibold text-gray-200 self-center">
                                                    {log.plateNumber}
                                                </span>

                                                {/* Event badge */}
                                                <div className="flex items-center gap-2 self-center">
                                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${color.dot}`} />
                                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${color.badge} uppercase tracking-wide`}>
                                                        {log.eventType.replace(/_/g, ' ')}
                                                    </span>
                                                </div>

                                                {/* Description */}
                                                <span className="text-[12px] text-gray-400 self-center truncate" title={log.description}>
                                                    {log.description}
                                                </span>

                                                {/* Actor name */}
                                                <span className="text-[12px] text-gray-300 self-center truncate">
                                                    {log.actorName}
                                                </span>

                                                {/* Actor role */}
                                                <span className="text-[11px] text-gray-600 self-center">
                                                    {log.actorRole?.replace(/_/g, ' ')}
                                                </span>

                                                {/* Time */}
                                                <div className="self-center">
                                                    <p className="text-[12px] text-gray-400">{d}</p>
                                                    <p className="text-[11px] text-gray-600">{t}</p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    )
}

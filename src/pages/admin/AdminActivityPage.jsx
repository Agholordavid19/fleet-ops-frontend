import { useState } from 'react'
import { Activity, Truck, Wrench, AlertTriangle, CheckCircle } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import SkeletonTable from '../../components/ui/SkeletonTable'
import EmptyState from '../../components/ui/EmptyState'
import Pagination from '../../components/ui/Pagination'
import StatusBadge from '../../components/ui/StatusBadge'
import { FilterBar, SelectFilter } from '../../components/ui/FilterBar'
import { useGetAdminActivityLogsQuery } from '../../features/activity/activityApi'
import { formatRelativeTime } from '../../utils/formatters'

function EventIcon({ type }) {
  if (type?.includes('TRIP')) return <Truck size={13} className="text-stone-500" />
  if (type?.includes('MAINTENANCE')) return <Wrench size={13} className="text-amber-500" />
  if (type?.includes('BREAKDOWN')) return <AlertTriangle size={13} className="text-red-500" />
  return <CheckCircle size={13} className="text-stone-400" />
}

const EVENT_TYPES = [
  'TRIP_REQUESTED', 'TRIP_APPROVED', 'TRIP_REJECTED', 'TRIP_COMPLETED',
  'MAINTENANCE_FLAG_CREATED', 'MAINTENANCE_FLAG_RESOLVED',
  'BREAKDOWN_REPORTED', 'BREAKDOWN_RESOLVED',
  'VEHICLE_REGISTERED', 'MILEAGE_LOGGED',
]

export default function AdminActivityPage() {
  const [page, setPage] = useState(0)
  const [eventType, setEventType] = useState('')
  const size = 20

  const { data, isLoading } = useGetAdminActivityLogsQuery({ page, size })
  const logs = data?.content ?? []

  return (
    <PageWrapper title="Activity Logs" crumbs={['Admin', 'Activity']}>
      <FilterBar className="mb-6">
        <SelectFilter
          value={eventType}
          onChange={setEventType}
          placeholder="All event types"
          options={EVENT_TYPES.map((t) => ({ value: t, label: t.replace(/_/g, ' ') }))}
        />
      </FilterBar>

      {isLoading
        ? <SkeletonTable rows={8} cols={4} />
        : logs.length === 0
        ? <EmptyState icon={Activity} title="No activity" description="No events match your filters." />
        : (
          <div className="bg-white rounded-xl border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">
            <ul className="divide-y divide-stone-100">
              {logs.filter((l) => !eventType || l.eventType === eventType).map((log) => (
                <li key={log.id} className="px-6 py-4 flex items-start gap-4 hover:bg-stone-50 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <EventIcon type={log.eventType} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-stone-700">{log.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-stone-500 font-medium">{log.actorName}</span>
                      <StatusBadge status={log.actorRole} className="text-[10px]" />
                      {log.plateNumber && <span className="text-xs font-mono text-stone-400">{log.plateNumber}</span>}
                    </div>
                  </div>
                  <span className="text-xs text-stone-400 flex-shrink-0">{formatRelativeTime(log.occurredAt)}</span>
                </li>
              ))}
            </ul>
          </div>
        )
      }

      {data && data.totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={data.totalPages}
          totalElements={data.totalElements}
          size={size}
          onPageChange={setPage}
        />
      )}
    </PageWrapper>
  )
}

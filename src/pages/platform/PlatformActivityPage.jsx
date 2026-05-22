import { useState } from 'react'
import { Activity } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import SkeletonTable from '../../components/ui/SkeletonTable'
import EmptyState from '../../components/ui/EmptyState'
import Pagination from '../../components/ui/Pagination'
import StatusBadge from '../../components/ui/StatusBadge'
import { useGetPlatformActivityLogsQuery } from '../../features/activity/activityApi'
import { formatRelativeTime } from '../../utils/formatters'

export default function PlatformActivityPage() {
  const [page, setPage] = useState(0)
  const size = 20
  const { data, isLoading } = useGetPlatformActivityLogsQuery({ page, size })
  const logs = data?.content ?? []

  return (
    <PageWrapper title="Activity Logs" crumbs={['Platform', 'Activity']}>
      {isLoading
        ? <SkeletonTable rows={8} cols={4} />
        : logs.length === 0
        ? <EmptyState icon={Activity} title="No activity" />
        : (
          <div className="bg-white rounded-xl border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">
            <ul className="divide-y divide-stone-100">
              {logs.map((log) => (
                <li key={log.id} className="px-6 py-4 flex items-start gap-4 hover:bg-stone-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-stone-700">{log.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-stone-500 font-medium">{log.actorName}</span>
                      <StatusBadge status={log.actorRole} />
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
        <Pagination page={page} totalPages={data.totalPages} totalElements={data.totalElements} size={size} onPageChange={setPage} />
      )}
    </PageWrapper>
  )
}

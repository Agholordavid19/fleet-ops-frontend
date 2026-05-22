import { useNavigate } from 'react-router-dom'
import { Wrench } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import StatusBadge from '../../components/ui/StatusBadge'
import DataTable from '../../components/ui/DataTable'
import SkeletonTable from '../../components/ui/SkeletonTable'
import EmptyState from '../../components/ui/EmptyState'
import { useGetMyMaintenanceFlagsQuery } from '../../features/maintenance/maintenanceApi'
import { formatRelativeTime } from '../../utils/formatters'

export default function MyFlagsPage() {
  const navigate = useNavigate()
  const { data: flags, isLoading } = useGetMyMaintenanceFlagsQuery()

  const sorted = [...(flags ?? [])].sort((a, b) => new Date(b.assignedAt ?? b.openedAt) - new Date(a.assignedAt ?? a.openedAt))

  const columns = [
    { key: 'plateNumber', label: 'Vehicle', render: (v) => <span className="font-mono">{v}</span> },
    { key: 'description', label: 'Description', render: (v) => <span className="max-w-xs truncate block">{v}</span> },
    { key: 'triggerType', label: 'Trigger', render: (v) => <StatusBadge status={v} /> },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'openedAt', label: 'Opened', render: (v) => formatRelativeTime(v) },
  ]

  return (
    <PageWrapper title="My Maintenance Flags" crumbs={['Crew', 'My Flags']}>
      {isLoading
        ? <SkeletonTable rows={5} cols={5} />
        : sorted.length === 0
        ? <EmptyState icon={Wrench} title="No assigned flags" description="You have no maintenance flags assigned to you." />
        : <DataTable columns={columns} data={sorted} onRowClick={(row) => navigate(`/crew/flags/${row.id}`)} />
      }
    </PageWrapper>
  )
}

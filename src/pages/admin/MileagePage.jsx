import { useParams } from 'react-router-dom'
import { Gauge } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import SkeletonTable from '../../components/ui/SkeletonTable'
import EmptyState from '../../components/ui/EmptyState'
import DataTable from '../../components/ui/DataTable'
import { useGetMileageLogsQuery } from '../../features/users/usersApi'
import { formatDate, formatMileage } from '../../utils/formatters'

export default function MileagePage() {
  const { vehicleId } = useParams()
  const { data: logs, isLoading } = useGetMileageLogsQuery(vehicleId)

  const columns = [
    { key: 'loggedAt', label: 'Date', render: (v) => formatDate(v) },
    { key: 'reportedMileage', label: 'Mileage', render: (v) => <span className="font-medium">{formatMileage(v)}</span> },
    { key: 'submittedByName', label: 'Submitted By' },
    { key: 'tripRequestId', label: 'Trip', render: (v) => v ?? <span className="text-stone-400">—</span> },
  ]

  return (
    <PageWrapper title="Mileage Logs" crumbs={['Admin', 'Mileage']}>
      {isLoading
        ? <SkeletonTable rows={5} cols={4} />
        : (logs ?? []).length === 0
        ? <EmptyState icon={Gauge} title="No mileage logs" description="No mileage has been logged for this vehicle." />
        : <DataTable columns={columns} data={[...(logs ?? [])].sort((a, b) => new Date(b.loggedAt) - new Date(a.loggedAt))} />
      }
    </PageWrapper>
  )
}

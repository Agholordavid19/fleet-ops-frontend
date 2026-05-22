import { useNavigate } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import StatusBadge from '../../components/ui/StatusBadge'
import DataTable from '../../components/ui/DataTable'
import SkeletonTable from '../../components/ui/SkeletonTable'
import EmptyState from '../../components/ui/EmptyState'
import { TabFilter } from '../../components/ui/FilterBar'
import { useGetPlatformCompaniesQuery } from '../../features/companies/companiesApi'
import { formatDate } from '../../utils/formatters'
import { useState } from 'react'

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'SUSPENDED', label: 'Suspended' },
]

export default function CompaniesPage() {
  const navigate = useNavigate()
  const [statusTab, setStatusTab] = useState('')
  const { data: companies, isLoading } = useGetPlatformCompaniesQuery()

  const filtered = (companies ?? []).filter((c) => !statusTab || c.status === statusTab)

  const columns = [
    { key: 'name', label: 'Company', render: (v) => <span className="font-medium text-stone-900">{v}</span> },
    { key: 'email', label: 'Email', render: (v) => <span className="text-stone-500">{v}</span> },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'registeredAt', label: 'Registered', render: (v) => formatDate(v) },
  ]

  return (
    <PageWrapper title="Companies" crumbs={['Platform', 'Companies']}>
      <div className="mb-6">
        <TabFilter
          tabs={STATUS_TABS.map((t) => ({
            ...t,
            count: t.value ? (companies ?? []).filter((c) => c.status === t.value).length : undefined,
          }))}
          active={statusTab}
          onSelect={setStatusTab}
        />
      </div>

      {isLoading
        ? <SkeletonTable rows={5} cols={4} />
        : filtered.length === 0
        ? <EmptyState icon={Building2} title="No companies found" />
        : (
          <DataTable
            columns={columns}
            data={filtered}
            onRowClick={(row) => navigate(`/platform/companies/${row.id}`)}
          />
        )
      }
    </PageWrapper>
  )
}

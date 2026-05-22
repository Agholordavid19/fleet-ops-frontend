import { cn } from '../../utils/cn'
import {
  vehicleStatusColors,
  tripStatusColors,
  maintenanceStatusColors,
  breakdownStatusColors,
  companyStatusColors,
  healthGradeColors,
  roleColors,
} from '../../utils/statusColors'

const allStatusMaps = {
  ...vehicleStatusColors,
  ...tripStatusColors,
  ...maintenanceStatusColors,
  ...breakdownStatusColors,
  ...companyStatusColors,
  ...healthGradeColors,
  ...roleColors,
}

export default function StatusBadge({ status, className }) {
  const colorClass = allStatusMaps[status] ?? 'bg-stone-100 text-stone-600'
  const label = status?.replace(/_/g, ' ') ?? '—'

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide',
        colorClass,
        className,
      )}
    >
      {label}
    </span>
  )
}

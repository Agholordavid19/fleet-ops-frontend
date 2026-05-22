// Vehicle status
export const vehicleStatusColors = {
  AVAILABLE: 'bg-green-100 text-green-700',
  IN_USE: 'bg-blue-100 text-blue-700',
  MAINTENANCE: 'bg-amber-100 text-amber-700',
  DECOMMISSIONED: 'bg-stone-100 text-stone-600',
}

// Trip request status
export const tripStatusColors = {
  PENDING: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
}

// Maintenance flag status
export const maintenanceStatusColors = {
  OPEN: 'bg-red-100 text-red-700',
  ASSIGNED: 'bg-blue-100 text-blue-700',
  QUOTATION_SUBMITTED: 'bg-purple-100 text-purple-700',
  QUOTATION_APPROVED: 'bg-green-100 text-green-700',
  QUOTATION_REJECTED: 'bg-red-100 text-red-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  PENDING_APPROVAL: 'bg-amber-100 text-amber-700',
  RESOLVED: 'bg-green-100 text-green-700',
}

// Breakdown status
export const breakdownStatusColors = {
  REPORTED: 'bg-red-100 text-red-700',
  CREW_DISPATCHED: 'bg-blue-100 text-blue-700',
  REPLACEMENT_DISPATCHED: 'bg-purple-100 text-purple-700',
  RESOLVED: 'bg-green-100 text-green-700',
}

// Company status
export const companyStatusColors = {
  PENDING: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  SUSPENDED: 'bg-stone-100 text-stone-600',
}

// User roles
export const roleColors = {
  PLATFORM_ADMIN: 'bg-indigo-100 text-indigo-700',
  COMPANY_ADMIN: 'bg-purple-100 text-purple-700',
  FLEET_MANAGER: 'bg-blue-100 text-blue-700',
  FIELD_STAFF: 'bg-green-100 text-green-700',
  MAINTENANCE_CREW: 'bg-amber-100 text-amber-700',
}

// Health grade
export const healthGradeColors = {
  EXCELLENT: 'bg-green-100 text-green-700',
  GOOD: 'bg-teal-100 text-teal-700',
  FAIR: 'bg-amber-100 text-amber-700',
  POOR: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
}

export const healthGradeBarColors = {
  EXCELLENT: 'bg-green-500',
  GOOD: 'bg-teal-500',
  FAIR: 'bg-amber-500',
  POOR: 'bg-orange-500',
  CRITICAL: 'bg-red-500',
}

export function getStatusColor(status, type = 'maintenance') {
  const maps = {
    vehicle: vehicleStatusColors,
    trip: tripStatusColors,
    maintenance: maintenanceStatusColors,
    breakdown: breakdownStatusColors,
    company: companyStatusColors,
    health: healthGradeColors,
  }
  return maps[type]?.[status] ?? 'bg-stone-100 text-stone-600'
}

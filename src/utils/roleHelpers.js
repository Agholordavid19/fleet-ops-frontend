export const ROLES = {
  PLATFORM_ADMIN: 'PLATFORM_ADMIN',
  COMPANY_ADMIN: 'COMPANY_ADMIN',
  FLEET_MANAGER: 'FLEET_MANAGER',
  FIELD_STAFF: 'FIELD_STAFF',
  MAINTENANCE_CREW: 'MAINTENANCE_CREW',
}

export function isPlatformAdmin(role) {
  return role === ROLES.PLATFORM_ADMIN
}

export function isCompanyAdmin(role) {
  return role === ROLES.COMPANY_ADMIN
}

export function isFleetManager(role) {
  return role === ROLES.FLEET_MANAGER
}

export function isFieldStaff(role) {
  return role === ROLES.FIELD_STAFF
}

export function isMaintenanceCrew(role) {
  return role === ROLES.MAINTENANCE_CREW
}

export function isAdminOrManager(role) {
  return [ROLES.COMPANY_ADMIN, ROLES.FLEET_MANAGER].includes(role)
}

export function getDefaultRouteForRole(role) {
  switch (role) {
    case ROLES.PLATFORM_ADMIN: return '/platform/dashboard'
    case ROLES.COMPANY_ADMIN:
    case ROLES.FLEET_MANAGER: return '/admin/dashboard'
    case ROLES.FIELD_STAFF: return '/staff/dashboard'
    case ROLES.MAINTENANCE_CREW: return '/crew/dashboard'
    default: return '/login'
  }
}

export function getRoleLabel(role) {
  const labels = {
    PLATFORM_ADMIN: 'Platform Admin',
    COMPANY_ADMIN: 'Company Admin',
    FLEET_MANAGER: 'Fleet Manager',
    FIELD_STAFF: 'Field Staff',
    MAINTENANCE_CREW: 'Maintenance Crew',
  }
  return labels[role] ?? role
}

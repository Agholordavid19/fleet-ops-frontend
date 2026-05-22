import { describe, it, expect } from 'vitest'
import {
  ROLES, isPlatformAdmin, isCompanyAdmin, isFleetManager,
  isFieldStaff, isMaintenanceCrew, isAdminOrManager,
  getDefaultRouteForRole, getRoleLabel,
} from '../../utils/roleHelpers'

describe('role predicates', () => {
  it('isPlatformAdmin', () => {
    expect(isPlatformAdmin(ROLES.PLATFORM_ADMIN)).toBe(true)
    expect(isPlatformAdmin(ROLES.COMPANY_ADMIN)).toBe(false)
  })

  it('isCompanyAdmin', () => {
    expect(isCompanyAdmin(ROLES.COMPANY_ADMIN)).toBe(true)
    expect(isCompanyAdmin(ROLES.FLEET_MANAGER)).toBe(false)
  })

  it('isFleetManager', () => {
    expect(isFleetManager(ROLES.FLEET_MANAGER)).toBe(true)
    expect(isFleetManager(ROLES.FIELD_STAFF)).toBe(false)
  })

  it('isFieldStaff', () => {
    expect(isFieldStaff(ROLES.FIELD_STAFF)).toBe(true)
    expect(isFieldStaff(ROLES.MAINTENANCE_CREW)).toBe(false)
  })

  it('isMaintenanceCrew', () => {
    expect(isMaintenanceCrew(ROLES.MAINTENANCE_CREW)).toBe(true)
    expect(isMaintenanceCrew(ROLES.FIELD_STAFF)).toBe(false)
  })

  it('isAdminOrManager returns true for COMPANY_ADMIN and FLEET_MANAGER', () => {
    expect(isAdminOrManager(ROLES.COMPANY_ADMIN)).toBe(true)
    expect(isAdminOrManager(ROLES.FLEET_MANAGER)).toBe(true)
    expect(isAdminOrManager(ROLES.FIELD_STAFF)).toBe(false)
    expect(isAdminOrManager(ROLES.PLATFORM_ADMIN)).toBe(false)
  })
})

describe('getDefaultRouteForRole', () => {
  it('routes PLATFORM_ADMIN to /platform/dashboard', () => {
    expect(getDefaultRouteForRole(ROLES.PLATFORM_ADMIN)).toBe('/platform/dashboard')
  })

  it('routes COMPANY_ADMIN and FLEET_MANAGER to /admin/dashboard', () => {
    expect(getDefaultRouteForRole(ROLES.COMPANY_ADMIN)).toBe('/admin/dashboard')
    expect(getDefaultRouteForRole(ROLES.FLEET_MANAGER)).toBe('/admin/dashboard')
  })

  it('routes FIELD_STAFF to /staff/dashboard', () => {
    expect(getDefaultRouteForRole(ROLES.FIELD_STAFF)).toBe('/staff/dashboard')
  })

  it('routes MAINTENANCE_CREW to /crew/dashboard', () => {
    expect(getDefaultRouteForRole(ROLES.MAINTENANCE_CREW)).toBe('/crew/dashboard')
  })

  it('defaults unknown role to /login', () => {
    expect(getDefaultRouteForRole('UNKNOWN')).toBe('/login')
    expect(getDefaultRouteForRole(null)).toBe('/login')
  })
})

describe('getRoleLabel', () => {
  it('maps all known roles to human-readable labels', () => {
    expect(getRoleLabel(ROLES.PLATFORM_ADMIN)).toBe('Platform Admin')
    expect(getRoleLabel(ROLES.COMPANY_ADMIN)).toBe('Company Admin')
    expect(getRoleLabel(ROLES.FLEET_MANAGER)).toBe('Fleet Manager')
    expect(getRoleLabel(ROLES.FIELD_STAFF)).toBe('Field Staff')
    expect(getRoleLabel(ROLES.MAINTENANCE_CREW)).toBe('Maintenance Crew')
  })

  it('falls back to the raw role string for unknown values', () => {
    expect(getRoleLabel('UNKNOWN_ROLE')).toBe('UNKNOWN_ROLE')
  })
})

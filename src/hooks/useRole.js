import { useSelector } from 'react-redux'
import { selectUserRole } from '../features/auth/authSlice'
import { isPlatformAdmin, isCompanyAdmin, isFleetManager, isFieldStaff, isMaintenanceCrew, isAdminOrManager } from '../utils/roleHelpers'

export function useRole() {
  const role = useSelector(selectUserRole)
  return {
    role,
    isPlatformAdmin: isPlatformAdmin(role),
    isCompanyAdmin: isCompanyAdmin(role),
    isFleetManager: isFleetManager(role),
    isFieldStaff: isFieldStaff(role),
    isMaintenanceCrew: isMaintenanceCrew(role),
    isAdminOrManager: isAdminOrManager(role),
  }
}

import { useSelector, shallowEqual } from 'react-redux'
import { selectCurrentUser, selectIsAuthenticated, selectUserRole, selectCompanyId } from '../features/auth/authSlice'

export function useAuth() {
  const user = useSelector(selectCurrentUser, shallowEqual)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const role = useSelector(selectUserRole)
  const companyId = useSelector(selectCompanyId)
  return { user, isAuthenticated, role, companyId }
}

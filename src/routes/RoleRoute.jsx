import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { selectUserRole, selectIsAuthenticated } from '../features/auth/authSlice'

export default function RoleRoute({ children, allowed }) {
  const role = useSelector(selectUserRole)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!allowed.includes(role)) return <Navigate to="/login" replace />

  return children
}

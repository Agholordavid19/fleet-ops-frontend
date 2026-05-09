import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../store/authSlice'

export const useAuth = () => {
    const auth = useSelector((state) => state.auth)
    const dispatch = useDispatch()

    const handleLogout = () => {
        dispatch(logout())
    }

    return {
        ...auth,
        isAuthenticated: !!auth.token,
        isAdmin: auth.role === 'ADMIN',
        isFleetManager: auth.role === 'FLEET_MANAGER',
        isFieldStaff: auth.role === 'FIELD_STAFF',
        isMaintenance: auth.role === 'MAINTENANCE',
        logout: handleLogout,
    }
}
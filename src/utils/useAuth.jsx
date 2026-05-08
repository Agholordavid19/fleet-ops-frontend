import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../store/authSlice'
import { useLogoutMutation } from '../apis/fleetApi'

export const useAuth = () => {
    const auth = useSelector((state) => state.auth)
    const dispatch = useDispatch()
    const [logoutApi] = useLogoutMutation()

    const handleLogout = async () => {
        try {
            await logoutApi().unwrap()
        } catch {
            // backend call failed — still clear local state
        } finally {
            dispatch(logout())
        }
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
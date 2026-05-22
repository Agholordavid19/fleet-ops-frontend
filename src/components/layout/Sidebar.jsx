import { NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  LayoutDashboard, Truck, ClipboardList, Wrench, AlertTriangle,
  Users, Building2, HardHat, Activity, BarChart3, MapPin, FileText,
  LogOut, ChevronRight, User, X,
} from 'lucide-react'
import { logout } from '../../features/auth/authSlice'
import { setSidebarOpen } from '../../features/ui/uiSlice'
import { useAuth } from '../../hooks/useAuth'
import { getRoleLabel, ROLES } from '../../utils/roleHelpers'
import { cn } from '../../utils/cn'

const navByRole = {
  [ROLES.PLATFORM_ADMIN]: [
    { label: 'Dashboard', to: '/platform/dashboard', icon: LayoutDashboard },
    { label: 'Companies', to: '/platform/companies', icon: Building2 },
    { label: 'Crew', to: '/platform/crew', icon: HardHat },
    { label: 'Breakdowns', to: '/platform/breakdowns', icon: AlertTriangle },
    { label: 'Maintenance', to: '/platform/maintenance', icon: Wrench },
    { label: 'Activity', to: '/platform/activity-logs', icon: Activity },
  ],
  [ROLES.COMPANY_ADMIN]: [
    { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Company', to: '/admin/company', icon: Building2 },
    { label: 'Users', to: '/admin/users', icon: Users },
    { label: 'Vehicles', to: '/admin/vehicles', icon: Truck },
    { label: 'Trips', to: '/admin/trips', icon: MapPin },
    { label: 'Maintenance', to: '/admin/maintenance', icon: Wrench },
    { label: 'Breakdowns', to: '/admin/breakdowns', icon: AlertTriangle },
    { label: 'Reports', to: '/admin/reports/utilisation', icon: BarChart3 },
    { label: 'Activity', to: '/admin/activity-logs', icon: Activity },
    { label: 'Profile', to: '/admin/profile', icon: User },
  ],
  [ROLES.FLEET_MANAGER]: [
    { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Vehicles', to: '/admin/vehicles', icon: Truck },
    { label: 'Trips', to: '/admin/trips', icon: MapPin },
    { label: 'Maintenance', to: '/admin/maintenance', icon: Wrench },
    { label: 'Breakdowns', to: '/admin/breakdowns', icon: AlertTriangle },
    { label: 'Reports', to: '/admin/reports/utilisation', icon: BarChart3 },
    { label: 'Activity', to: '/admin/activity-logs', icon: Activity },
    { label: 'Profile', to: '/admin/profile', icon: User },
  ],
  [ROLES.FIELD_STAFF]: [
    { label: 'Dashboard', to: '/staff/dashboard', icon: LayoutDashboard },
    { label: 'Available Vehicles', to: '/staff/vehicles/available', icon: Truck },
    { label: 'New Trip', to: '/staff/trips/new', icon: MapPin },
    { label: 'My Trips', to: '/staff/trips/my', icon: ClipboardList },
    { label: 'Report Breakdown', to: '/staff/breakdowns/report', icon: AlertTriangle },
    { label: 'Log Mileage', to: '/staff/mileage/log', icon: FileText },
    { label: 'Profile', to: '/staff/profile', icon: User },
  ],
  [ROLES.MAINTENANCE_CREW]: [
    { label: 'Dashboard', to: '/crew/dashboard', icon: LayoutDashboard },
    { label: 'My Flags', to: '/crew/flags', icon: Wrench },
    { label: 'Profile', to: '/crew/profile', icon: User },
  ],
}

export default function Sidebar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, role } = useAuth()
  const sidebarOpen = useSelector((state) => state.ui.sidebarOpen)
  const links = navByRole[role] ?? []

  function handleLogout() {
    dispatch(logout())
    navigate('/login')
  }

  function close() {
    dispatch(setSidebarOpen(false))
  }

  const sidebarContent = (
    <aside className="w-60 h-full bg-white border-r border-stone-200 flex flex-col">
      {/* Wordmark */}
      <div className="px-6 pt-6 pb-5 border-b border-stone-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-stone-900 rounded-lg flex items-center justify-center">
            <Truck size={16} className="text-white" />
          </div>
          <span className="text-[15px] font-semibold text-stone-900 tracking-tight">FleetOps</span>
        </div>
        {/* Close button — mobile only */}
        <button
          type="button"
          onClick={close}
          className="md:hidden p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-0.5">
          {links.map(({ label, to, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                onClick={close}
                className={({ isActive }) => cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150',
                  isActive
                    ? 'bg-stone-900 text-white font-semibold'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900 font-medium',
                )}
              >
                {({ isActive }) => (
                  <>
                    <Icon size={16} className={isActive ? 'text-white' : 'text-stone-400'} />
                    <span className="flex-1">{label}</span>
                    {isActive && <ChevronRight size={12} className="text-white/60" />}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User footer */}
      <div className="p-4 border-t border-stone-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {user?.profilePictureUrl
              ? <img src={user.profilePictureUrl} alt={user.name} className="w-full h-full object-cover" />
              : <span className="text-xs font-semibold text-stone-600">{user?.name?.charAt(0)?.toUpperCase() ?? '?'}</span>
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-stone-900 truncate">{user?.name ?? '—'}</p>
            <p className="text-[11px] text-stone-400 truncate">{getRoleLabel(role)}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-stone-500 hover:bg-stone-100 hover:text-red-600 transition-colors"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  )

  return (
    <>
      {/* Desktop — always visible */}
      <div className="hidden md:flex flex-shrink-0 sticky top-0 h-screen">
        {sidebarContent}
      </div>

      {/* Mobile — backdrop */}
      <div
        onClick={close}
        className={cn(
          'fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity duration-200',
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
      />

      {/* Mobile — drawer */}
      <div
        className={cn(
          'fixed top-0 left-0 h-full z-50 md:hidden transition-transform duration-[250ms] ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {sidebarContent}
      </div>
    </>
  )
}

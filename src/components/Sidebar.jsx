import { NavLink } from 'react-router-dom'
import { useAuth } from '../utils/useAuth.jsx'
import Badge from '../components/Badge.jsx'

const navByRole = {
    ADMIN: [
        { to: '/admin/users', label: 'Users', icon: '👥' },
        { to: '/admin/reports', label: 'Reports', icon: '📊' },
    ],
    FLEET_MANAGER: [
        { to: '/fleet/vehicles', label: 'Vehicles', icon: '🚗' },
        { to: '/fleet/maintenance', label: 'Maintenance', icon: '🔧' },
        { to: '/fleet/trips', label: 'Trip Requests', icon: '📋' },
    ],
    FIELD_STAFF: [
        { to: '/staff/trips', label: 'My Trips', icon: '🗺️' },
        { to: '/staff/mileage', label: 'Mileage Log', icon: '📏' },
    ],
    MAINTENANCE: [
        { to: '/maintenance/flags', label: 'My Flags', icon: '🚩' },
    ],
}

export default function Sidebar() {
    const { role, name, logout } = useAuth()
    const navItems = navByRole[role] ?? []

    return (
        <aside className="w-60 min-w-60 bg-gray-900 border-r border-gray-800 flex flex-col">
            {/* Logo */}
            <div className="px-5 py-5 border-b border-gray-800">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-gray-900 text-sm font-bold">
                        F
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-100 tracking-tight">FleetOps</p>
                        <p className="text-xs text-gray-600">Management System</p>
                    </div>
                </div>
            </div>

            {/* User info */}
            <div className="px-4 py-4 border-b border-gray-800">
                <p className="text-sm font-semibold text-gray-200 truncate">{name ?? 'User'}</p>
                <div className="mt-1.5">
                    <Badge status={role} />
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-0.5">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-600 px-2 mb-2">
                    Navigation
                </p>
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                isActive
                                    ? 'bg-primary/15 text-primary border border-primary/30'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                            }`
                        }
                    >
                        <span className="text-base">{item.icon}</span>
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            {/* Logout */}
            <div className="px-3 py-4 border-t border-gray-800">
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-900/30 hover:text-red-400 transition-colors"
                >
                    <span>🚪</span> Sign out
                </button>
            </div>
        </aside>
    )
}
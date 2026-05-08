import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../utils/useAuth.jsx'

const navByRole = {
    ADMIN: [
        { to: '/admin/users',   label: 'Users'   },
        { to: '/admin/reports', label: 'Reports' },
    ],
    FLEET_MANAGER: [
        { to: '/fleet/vehicles',    label: 'Vehicles'      },
        { to: '/fleet/maintenance', label: 'Maintenance'   },
        { to: '/fleet/trips',       label: 'Trip Requests' },
    ],
    FIELD_STAFF: [
        { to: '/staff/trips',   label: 'My Trips'    },
        { to: '/staff/mileage', label: 'Mileage Log' },
    ],
    MAINTENANCE: [
        { to: '/maintenance/flags', label: 'My Flags' },
    ],
}

export default function Sidebar() {
    const { role, name, logout } = useAuth()
    const navItems = navByRole[role] ?? []
    const initials = name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ?? 'U'

    return (
        <aside className="w-[220px] min-w-[220px] bg-gray-900 border-r border-gray-800/70 flex flex-col">

            {/* Logo */}
            <div className="px-5 pt-6 pb-5">
                <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-gray-900 tracking-tight">F</span>
                    </div>
                    <span className="text-[13px] font-semibold text-gray-100 tracking-tight">FleetOps</span>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 space-y-0.5">
                <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-gray-600 px-2.5 mb-2.5">
                    Menu
                </p>
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `group relative flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] transition-colors duration-150 ${
                                isActive
                                    ? 'text-gray-100 font-medium'
                                    : 'text-gray-500 hover:text-gray-300 font-normal'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-active"
                                        className="absolute inset-0 bg-gray-800 rounded-lg"
                                        transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }}
                                    />
                                )}
                                <span className={`relative z-10 w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-150 ${
                                    isActive ? 'bg-primary' : 'bg-gray-700 group-hover:bg-gray-500'
                                }`} />
                                <span className="relative z-10">{item.label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* User + Logout */}
            <div className="px-4 py-5 border-t border-gray-800/70">
                <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-7 h-7 rounded-full bg-gray-800 border border-gray-700/60 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-semibold text-gray-300">{initials}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-semibold text-gray-200 truncate leading-tight">{name ?? 'User'}</p>
                        <p className="text-[10px] text-gray-600 leading-tight mt-0.5 truncate">
                            {role?.replace(/_/g, ' ')}
                        </p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="text-[11px] text-gray-600 hover:text-gray-400 transition-colors duration-150"
                >
                    Sign out
                </button>
            </div>

        </aside>
    )
}

import { useLocation } from 'react-router-dom'

const routes = {
    '/admin/users':          { title: 'Users',          subtitle: 'Manage accounts and system roles' },
    '/admin/reports':        { title: 'Reports',         subtitle: 'Fleet performance and health metrics' },
    '/fleet/vehicles':       { title: 'Vehicles',        subtitle: 'Register and manage the fleet' },
    '/fleet/maintenance':    { title: 'Maintenance',     subtitle: 'Review and assign reported issues' },
    '/fleet/trips':          { title: 'Trip Requests',   subtitle: 'Review and manage pending approvals' },
    '/staff/trips':          { title: 'My Trips',        subtitle: 'Available vehicles and your trip requests' },
    '/staff/mileage':        { title: 'Mileage Log',     subtitle: 'Record mileage for assigned vehicles' },
    '/maintenance/flags':    { title: 'Assigned Flags',  subtitle: 'Track and update your maintenance tasks' },
}

export default function Topbar({ onMenuClick }) {
    const { pathname } = useLocation()
    const route = routes[pathname] ?? { title: 'FleetOps', subtitle: '' }

    const dateStr = new Date().toLocaleDateString('en-GB', {
        weekday: 'short',
        day:     '2-digit',
        month:   'short',
        year:    'numeric',
    })

    return (
        <header className="h-15 bg-gray-900 border-b border-gray-700 flex items-center px-4 md:px-6 shrink-0 gap-3 md:gap-4">

            {/* Hamburger — mobile only */}
            <button
                onClick={onMenuClick}
                className="md:hidden flex flex-col justify-center gap-1.5 w-6 h-6 shrink-0"
                aria-label="Open menu"
            >
                <span className="block h-px w-full bg-gray-400" />
                <span className="block h-px w-full bg-gray-400" />
                <span className="block h-px w-5 bg-gray-400" />
            </button>

            <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2.5">
                    <h1 className="text-[14px] font-semibold text-gray-100 tracking-tight leading-none">
                        {route.title}
                    </h1>
                    {route.subtitle && (
                        <span className="text-[12px] text-gray-600 leading-none hidden sm:block truncate">
                            {route.subtitle}
                        </span>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
                <div className="h-4 w-px bg-gray-700" />
                <span className="text-[11px] text-gray-600 tabular-nums hidden sm:block">
                    {dateStr}
                </span>
            </div>
        </header>
    )
}
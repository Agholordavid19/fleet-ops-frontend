import { useLocation } from 'react-router-dom'

const titles = {
    '/admin/users':          'User Management',
    '/admin/reports':        'Fleet Reports',
    '/fleet/vehicles':       'Vehicles',
    '/fleet/maintenance':    'Maintenance Flags',
    '/fleet/trips':          'Trip Requests',
    '/staff/trips':          'My Trips',
    '/staff/mileage':        'Mileage Log',
    '/maintenance/flags':    'Assigned Flags',
}

export default function Topbar() {
    const { pathname } = useLocation()
    const title = titles[pathname] ?? 'FleetOps'

    return (
        <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center px-6 flex-shrink-0">
            <h1 className="text-base font-semibold text-gray-200 tracking-tight">{title}</h1>
            <div className="ml-auto flex items-center gap-3">
        <span className="text-xs text-gray-600 font-mono">
          {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
            </div>
        </header>
    )
}
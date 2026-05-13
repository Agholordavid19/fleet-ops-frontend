const variants = {
    // Vehicle statuses
    AVAILABLE:    'bg-emerald-500/10 text-emerald-400',
    ASSIGNED:     'bg-primary/10 text-primary',
    MAINTENANCE:  'bg-amber-500/10 text-amber-400',
    OUT_OF_SERVICE: 'bg-red-500/10 text-red-400',
    // Trip statuses
    PENDING:      'bg-yellow-500/10 text-yellow-400',
    APPROVED:     'bg-emerald-500/10 text-emerald-400',
    REJECTED:     'bg-red-500/10 text-red-400',
    UNAVAILABLE_FOR_PERIOD: 'bg-red-500/10 text-red-400',
    // Flag statuses
    OPEN:         'bg-red-500/10 text-red-400',
    IN_PROGRESS:  'bg-primary/10 text-primary',
    PENDING_APPROVAL: 'bg-amber-500/10 text-amber-400',
    RESOLVED:     'bg-emerald-500/10 text-emerald-400',
    // Roles (prefixed to avoid collision with vehicle status keys)
    ROLE_ADMIN:          'bg-purple-500/10 text-purple-400',
    ROLE_FLEET_MANAGER:  'bg-cyan-500/10 text-cyan-400',
    ROLE_FIELD_STAFF:    'bg-orange-500/10 text-orange-400',
    ROLE_MAINTENANCE_TEAM: 'bg-indigo-500/10 text-indigo-400',
}

export default function Badge({ status, type }) {
    const key = type === 'role' ? `ROLE_${status}` : status
    const cls = variants[key] ?? 'bg-gray-800/60 text-gray-500'
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium tracking-wide ${cls}`}>
            {status?.replace(/_/g, ' ')}
        </span>
    )
}

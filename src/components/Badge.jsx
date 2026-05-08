const variants = {
    // Vehicle statuses
    AVAILABLE:    'bg-emerald-500/10 text-emerald-400',
    ASSIGNED:     'bg-primary/10 text-primary',
    MAINTENANCE:  'bg-amber-500/10 text-amber-400',
    // Trip statuses
    PENDING:      'bg-yellow-500/10 text-yellow-400',
    APPROVED:     'bg-emerald-500/10 text-emerald-400',
    REJECTED:     'bg-red-500/10 text-red-400',
    // Flag statuses
    OPEN:         'bg-red-500/10 text-red-400',
    IN_PROGRESS:  'bg-primary/10 text-primary',
    RESOLVED:     'bg-emerald-500/10 text-emerald-400',
    // Roles
    ADMIN:         'bg-purple-500/10 text-purple-400',
    FLEET_MANAGER: 'bg-cyan-500/10 text-cyan-400',
    FIELD_STAFF:   'bg-orange-500/10 text-orange-400',
    MAINTENANCE:   'bg-amber-500/10 text-amber-400',
}

export default function Badge({ status }) {
    const cls = variants[status] ?? 'bg-gray-800/60 text-gray-500'
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium tracking-wide ${cls}`}>
            {status?.replace(/_/g, ' ')}
        </span>
    )
}
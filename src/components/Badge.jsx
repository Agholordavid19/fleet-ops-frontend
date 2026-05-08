const variants = {
    // Vehicle statuses
    AVAILABLE:    'bg-emerald-900/50 text-emerald-300 border border-emerald-700',
    ASSIGNED:     'bg-primary/10 text-primary border border-primary/30',
    MAINTENANCE:  'bg-amber-900/50 text-amber-300 border border-amber-700',
    // Trip statuses
    PENDING:      'bg-yellow-900/50 text-yellow-300 border border-yellow-700',
    APPROVED:     'bg-emerald-900/50 text-emerald-300 border border-emerald-700',
    REJECTED:     'bg-red-900/50 text-red-300 border border-red-700',
    // Flag statuses
    OPEN:         'bg-red-900/50 text-red-300 border border-red-700',
    IN_PROGRESS:  'bg-primary/10 text-primary border border-primary/30',
    RESOLVED:     'bg-emerald-900/50 text-emerald-300 border border-emerald-700',
    // Roles
    ADMIN:         'bg-purple-900/50 text-purple-300 border border-purple-700',
    FLEET_MANAGER: 'bg-cyan-900/50 text-cyan-300 border border-cyan-700',
    FIELD_STAFF:   'bg-orange-900/50 text-orange-300 border border-orange-700',
}

export default function Badge({ status }) {
    const cls = variants[status] ?? 'bg-gray-800 text-gray-400 border border-gray-600'
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold tracking-wide ${cls}`}>
      {status?.replace('_', ' ')}
    </span>
    )
}
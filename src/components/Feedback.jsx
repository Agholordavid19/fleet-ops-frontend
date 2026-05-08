export function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-gray-700 border-t-primary rounded-full animate-spin" />
        </div>
    )
}

export function ErrorAlert({ message }) {
    return (
        <div className="flex items-center gap-3 bg-red-900/30 border border-red-800 text-red-300 text-sm rounded-xl px-4 py-3">
            <span className="text-lg">⚠</span>
            <span>{message || 'Something went wrong. Please try again.'}</span>
        </div>
    )
}

export function StatCard({ label, value, color = 'blue' }) {
    const colors = {
        blue:   'bg-primary/10 border-primary/30 text-primary',
        green:  'bg-emerald-900/30 border-emerald-800 text-emerald-300',
        amber:  'bg-amber-900/30 border-amber-800 text-amber-300',
        red:    'bg-red-900/30 border-red-800 text-red-300',
        purple: 'bg-purple-900/30 border-purple-800 text-purple-300',
    }
    return (
        <div className={`rounded-xl border p-4 ${colors[color]}`}>
            <p className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-1">{label}</p>
            <p className="text-3xl font-bold">{value}</p>
        </div>
    )
}
export function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center py-16">
            <div className="w-5 h-5 border-[1.5px] border-gray-700 border-t-primary rounded-full animate-spin" />
        </div>
    )
}

export function ErrorAlert({ message }) {
    return (
        <div className="flex items-start gap-3 bg-red-500/8 border border-red-500/15 text-red-400 text-[13px] rounded-xl px-4 py-3.5 leading-relaxed">
            <svg className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 5v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="8" cy="11" r="0.75" fill="currentColor"/>
            </svg>
            <span>{message || 'Something went wrong. Please try again.'}</span>
        </div>
    )
}

export function StatCard({ label, value, color = 'blue' }) {
    const colors = {
        blue:   { wrap: 'border-gray-700/60',  value: 'text-primary',       label: 'text-gray-500' },
        green:  { wrap: 'border-gray-700/60',  value: 'text-emerald-400',   label: 'text-gray-500' },
        amber:  { wrap: 'border-gray-700/60',  value: 'text-amber-400',     label: 'text-gray-500' },
        red:    { wrap: 'border-gray-700/60',  value: 'text-red-400',       label: 'text-gray-500' },
        purple: { wrap: 'border-gray-700/60',  value: 'text-purple-400',    label: 'text-gray-500' },
    }
    const c = colors[color] ?? colors.blue
    return (
        <div className={`bg-gray-900 border ${c.wrap} rounded-xl px-5 py-4 shadow-sm shadow-black/4`}>
            <p className={`text-[11px] font-medium uppercase tracking-widest ${c.label} mb-2`}>
                {label}
            </p>
            <p className={`text-[28px] font-bold tracking-tight leading-none ${c.value}`}>
                {value}
            </p>
        </div>
    )
}
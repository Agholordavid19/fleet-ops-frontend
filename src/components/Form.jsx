export function FormField({ label, error, children }) {
    return (
        <div className="mb-4">
            <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5">
                {label}
            </label>
            {children}
            {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        </div>
    )
}

const inputCls =
    'w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors'

export function Input({ ...props }) {
    return <input className={inputCls} {...props} />
}

export function Select({ children, ...props }) {
    return (
        <select className={inputCls + ' cursor-pointer'} {...props}>
            {children}
        </select>
    )
}

export function Textarea({ ...props }) {
    return <textarea className={inputCls} rows={3} {...props} />
}

export function SubmitButton({ loading, children }) {
    return (
        <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 font-semibold text-sm py-2.5 rounded-lg transition-colors"
        >
            {loading ? 'Saving...' : children}
        </button>
    )
}
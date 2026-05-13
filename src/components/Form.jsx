import { motion } from 'framer-motion'

export function FormField({ label, error, children }) {
    return (
        <div className="mb-4">
            <label className="block text-[11px] font-medium uppercase tracking-widest text-gray-500 mb-1.5">
                {label}
            </label>
            {children}
            {error && (
                <p className="mt-1.5 text-[11px] text-red-400 leading-tight">{error}</p>
            )}
        </div>
    )
}

const inputCls =
    'w-full bg-gray-800/70 border border-gray-700/70 rounded-lg px-3 py-2.5 text-[13px] text-gray-200 placeholder-gray-600 focus:outline-none focus:border-primary/50 focus:bg-gray-800 transition-all duration-150'

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
    return <textarea className={inputCls + ' resize-none leading-relaxed'} rows={3} {...props} />
}

const buttonVariants = {
    primary: 'bg-primary hover:bg-primary-hover text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white',
}

export function SubmitButton({ loading, disabled, children, variant = 'primary', className = '' }) {
    const variantCls = buttonVariants[variant] ?? buttonVariants.primary
    const isDisabled = loading || disabled

    return (
        <motion.button
            type="submit"
            disabled={isDisabled}
            whileTap={isDisabled ? {} : { scale: 0.98 }}
            className={`w-full mt-3 ${variantCls} disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-[13px] py-2.5 rounded-lg transition-all duration-150 tracking-tight ${className}`}
        >
            {loading ? 'Saving…' : children}
        </motion.button>
    )
}

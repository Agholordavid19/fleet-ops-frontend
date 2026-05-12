import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export function ConfirmModal({ open, message, onConfirm, onCancel }) {
    return (
        <Modal open={open} onClose={onCancel} title="Are you sure?">
            <p className="text-[13px] text-gray-400 leading-relaxed mb-6">{message}</p>
            <div className="flex justify-end gap-2">
                <button
                    onClick={onCancel}
                    className="text-[13px] text-gray-500 hover:text-gray-300 font-medium px-4 py-2 rounded-lg border border-gray-700 hover:border-gray-600 transition-all duration-150"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    className="text-[13px] bg-primary hover:bg-primary-hover text-gray-900 font-semibold px-4 py-2 rounded-lg transition-all duration-150"
                >
                    Confirm
                </button>
            </div>
        </Modal>
    )
}

export default function Modal({ open, onClose, title, children, size = 'md' }) {
    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'Escape') onClose()
        }

        if (open) document.addEventListener('keydown', handler)

        return () => document.removeEventListener('keydown', handler)
    }, [open, onClose])

    const sizes = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-3xl',
        xl: 'max-w-5xl',
    }

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px]"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97, y: 4 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className={`relative w-full ${sizes[size] ?? sizes.md} max-h-[88vh] overflow-hidden bg-gray-900 border border-gray-700/50 rounded-2xl shadow-2xl shadow-black/20`}
                    >
                        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-gray-900 border-b border-gray-700/40">
                            <h2 className="text-[14px] font-semibold text-gray-100 tracking-tight">
                                {title}
                            </h2>

                            <button
                                type="button"
                                onClick={onClose}
                                aria-label="Close"
                                className="group w-8 h-8 flex items-center justify-center rounded-lg border border-gray-800 bg-gray-900 text-gray-500 hover:text-gray-200 hover:bg-gray-800 hover:border-gray-700 transition-all duration-150"
                            >
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                    <path
                                        d="M1 1l10 10M11 1L1 11"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </button>
                        </div>

                        <div className="max-h-[calc(88vh-64px)] overflow-y-auto px-5 py-5">
                            {children}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
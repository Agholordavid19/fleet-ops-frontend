import { useEffect } from 'react'

export function ConfirmModal({ open, message, onConfirm, onCancel }) {
    return (
        <Modal open={open} onClose={onCancel} title="Confirm">
            <p className="text-sm text-gray-300 mb-5">{message}</p>
            <div className="flex justify-end gap-3">
                <button
                    onClick={onCancel}
                    className="text-sm text-gray-400 hover:text-gray-200 font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    className="text-sm bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                    Confirm
                </button>
            </div>
        </Modal>
    )
}

export default function Modal({ open, onClose, title, children }) {
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose() }
        if (open) document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [open, onClose])

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="relative w-full max-w-lg mx-4 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
                    <h2 className="text-base font-semibold text-gray-100">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-200 transition-colors text-xl leading-none"
                    >
                        ×
                    </button>
                </div>
                <div className="px-6 py-5">{children}</div>
            </div>
        </div>
    )
}
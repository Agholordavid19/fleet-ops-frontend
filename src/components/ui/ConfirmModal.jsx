import Modal from './Modal'

export default function ConfirmModal({ open, onClose, onConfirm, title, description, confirmLabel = 'Confirm', confirmVariant = 'danger', isLoading }) {
  const variantClass = {
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white',
    primary: 'bg-stone-900 hover:bg-stone-800 text-white',
  }[confirmVariant] ?? 'bg-red-600 hover:bg-red-700 text-white'

  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-stone-500 mb-6">{description}</p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 ${variantClass}`}
        >
          {isLoading ? 'Processing…' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}

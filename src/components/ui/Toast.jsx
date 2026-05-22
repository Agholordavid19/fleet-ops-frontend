import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { removeToast } from '../../features/ui/uiSlice'
import { cn } from '../../utils/cn'

const toastConfig = {
  success: { icon: CheckCircle, bg: 'bg-white border-green-200', icon_class: 'text-green-500', bar: 'bg-green-500' },
  error: { icon: XCircle, bg: 'bg-white border-red-200', icon_class: 'text-red-500', bar: 'bg-red-500' },
  warning: { icon: AlertTriangle, bg: 'bg-white border-amber-200', icon_class: 'text-amber-500', bar: 'bg-amber-500' },
  info: { icon: Info, bg: 'bg-white border-stone-300', icon_class: 'text-stone-500', bar: 'bg-stone-700' },
}

function ToastItem({ toast }) {
  const dispatch = useDispatch()
  const [visible, setVisible] = useState(false)
  const config = toastConfig[toast.type] ?? toastConfig.info

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    const exit = () => {
      setVisible(false)
      setTimeout(() => dispatch(removeToast(toast.id)), 200)
    }
    const t = setTimeout(exit, toast.duration)
    return () => clearTimeout(t)
  }, [toast.id, toast.duration, dispatch])

  function dismiss() {
    setVisible(false)
    setTimeout(() => dispatch(removeToast(toast.id)), 200)
  }

  return (
    <div
      className={cn(
        'relative flex items-start gap-3 rounded-xl border px-4 py-3 shadow-[0_4px_12px_rgba(0,0,0,0.08)] min-w-[280px] max-w-sm overflow-hidden',
        'transition-all duration-200 ease-out',
        visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12',
        config.bg,
      )}
    >
      <div className={cn('absolute bottom-0 left-0 h-0.5', config.bar)}
        style={{ width: '100%', animation: `shrink ${toast.duration}ms linear forwards` }}
      />
      <config.icon size={18} className={cn('flex-shrink-0 mt-0.5', config.icon_class)} />
      <p className="text-sm text-stone-700 flex-1 leading-snug">{toast.message}</p>
      <button
        type="button"
        onClick={dismiss}
        className="flex-shrink-0 p-0.5 rounded hover:bg-stone-100 text-stone-400 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  )
}

export default function ToastContainer() {
  const toasts = useSelector((state) => state.ui.toasts)

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} />
        </div>
      ))}
    </div>
  )
}

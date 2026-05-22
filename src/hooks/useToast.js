import { useDispatch } from 'react-redux'
import { addToast } from '../features/ui/uiSlice'

export function useToast() {
  const dispatch = useDispatch()

  return {
    success: (message) => dispatch(addToast({ type: 'success', message })),
    error: (message) => dispatch(addToast({ type: 'error', message })),
    warning: (message) => dispatch(addToast({ type: 'warning', message })),
    info: (message) => dispatch(addToast({ type: 'info', message })),
  }
}
import { Star } from 'lucide-react'
import { cn } from '../../utils/cn'

export function StarDisplay({ rating = 0, size = 14 }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={cn(
            i < Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-stone-200 fill-stone-200',
          )}
        />
      ))}
    </div>
  )
}

export function StarInput({ value, onChange }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i + 1)}
          className="focus:outline-none"
        >
          <Star
            size={24}
            className={cn(
              'transition-colors',
              i < value ? 'text-amber-400 fill-amber-400' : 'text-stone-300 hover:text-amber-300',
            )}
          />
        </button>
      ))}
    </div>
  )
}

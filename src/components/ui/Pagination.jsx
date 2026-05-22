import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../utils/cn'

export default function Pagination({ page, totalPages, totalElements, size, onPageChange }) {
  const from = page * size + 1
  const to = Math.min((page + 1) * size, totalElements)

  const pages = []
  const maxVisible = 5
  let start = Math.max(0, page - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages - 1, start + maxVisible - 1)
  if (end - start < maxVisible - 1) start = Math.max(0, end - maxVisible + 1)
  for (let i = start; i <= end; i++) pages.push(i)

  return (
    <div className="flex items-center justify-between mt-4 px-1">
      <p className="text-sm text-stone-500">
        Showing <span className="font-medium text-stone-900">{from}–{to}</span> of{' '}
        <span className="font-medium text-stone-900">{totalElements}</span> results
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          className="p-2 rounded-lg hover:bg-stone-100 text-stone-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        {pages.map((p) => (
          <button
            type="button"
            key={p}
            onClick={() => onPageChange(p)}
            className={cn(
              'min-w-[32px] h-8 rounded-lg text-sm font-medium transition-colors',
              p === page
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:bg-stone-100',
            )}
          >
            {p + 1}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          className="p-2 rounded-lg hover:bg-stone-100 text-stone-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

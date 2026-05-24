import { cn } from '../../utils/cn'

export default function MetricCard({ title, value, icon: Icon, trend, className, accent, onClick, valueColor }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-xl p-6 border border-stone-200 animate-fade-up',
        'shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)]',
        onClick && 'cursor-pointer hover:bg-stone-50 transition-colors',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-1">{title}</p>
          <p className={cn('text-3xl font-semibold text-stone-900 tabular-nums', accent && 'text-stone-800', valueColor)}>
            {value ?? '—'}
          </p>
          {trend && (
            <p className="mt-1 text-xs text-stone-500">{trend}</p>
          )}
        </div>
        {Icon && (
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
            accent ? 'bg-stone-100' : 'bg-stone-100',
          )}>
            <Icon size={18} className={accent ? 'text-stone-800' : 'text-stone-500'} />
          </div>
        )}
      </div>
    </div>
  )
}

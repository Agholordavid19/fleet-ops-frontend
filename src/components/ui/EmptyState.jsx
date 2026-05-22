import { cn } from '../../utils/cn'

export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in',
        className,
      )}
    >
      {Icon && (
        <div className="w-14 h-14 rounded-xl bg-stone-100 flex items-center justify-center mb-4">
          <Icon size={24} className="text-stone-400" />
        </div>
      )}
      <h3 className="text-base font-semibold text-stone-900 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-stone-500 max-w-sm mb-6">{description}</p>
      )}
      {action}
    </div>
  )
}

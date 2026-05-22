import { cn } from '../../utils/cn'

export function FilterBar({ children, className }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-3 mb-6', className)}>
      {children}
    </div>
  )
}

export function SearchInput({ value, onChange, placeholder = 'Search…' }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-9 px-3 rounded-lg border border-stone-200 text-sm bg-white text-stone-900 placeholder-stone-400
        focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700 transition-colors min-w-[200px]"
    />
  )
}

export function SelectFilter({ value, onChange, options, placeholder = 'All' }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 px-3 pr-8 rounded-lg border border-stone-200 text-sm bg-white text-stone-900
        focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-700 transition-colors appearance-none cursor-pointer"
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  )
}

export function TabFilter({ tabs, active, onSelect }) {
  return (
    <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onSelect(tab.value)}
          className={cn(
            'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
            active === tab.value
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-500 hover:text-stone-700',
          )}
        >
          {tab.label}
          {tab.count != null && (
            <span className={cn(
              'ml-1.5 text-xs rounded-full px-1.5 py-0.5',
              active === tab.value ? 'bg-stone-100 text-stone-600' : 'bg-stone-200 text-stone-500',
            )}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

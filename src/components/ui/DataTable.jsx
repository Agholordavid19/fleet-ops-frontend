import { cn } from '../../utils/cn'

export default function DataTable({ columns, data, onRowClick, emptyState }) {
  if (!data || data.length === 0) {
    return emptyState ?? (
      <div className="bg-white rounded-xl border border-stone-200 p-12 text-center text-stone-400 text-sm">
        No data available
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50">
              {columns.map((col) => (
                <th
                  key={col.key ?? col.label}
                  className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wide whitespace-nowrap"
                  style={{ width: col.width }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={row.id ?? i}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  'border-b border-stone-100 last:border-0 transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-stone-50',
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key ?? col.label}
                    className="px-4 py-4 text-sm text-stone-700 whitespace-nowrap"
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

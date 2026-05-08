export default function Table({ columns, data, emptyMessage = 'No records found.' }) {
    return (
        <div className="overflow-x-auto rounded-xl border border-gray-800">
            <table className="w-full text-sm">
                <thead>
                <tr className="border-b border-gray-800 bg-gray-900/60">
                    {columns.map((col) => (
                        <th
                            key={col.key}
                            className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-gray-500"
                        >
                            {col.label}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {!data || data.length === 0 ? (
                    <tr>
                        <td
                            colSpan={columns.length}
                            className="px-4 py-10 text-center text-gray-600 italic"
                        >
                            {emptyMessage}
                        </td>
                    </tr>
                ) : (
                    data.map((row, i) => (
                        <tr
                            key={row.id ?? i}
                            className="border-b border-gray-800/60 hover:bg-gray-800/30 transition-colors"
                        >
                            {columns.map((col) => (
                                <td key={col.key} className="px-4 py-3 text-gray-300">
                                    {col.render ? col.render(row) : row[col.key] ?? '—'}
                                </td>
                            ))}
                        </tr>
                    ))
                )}
                </tbody>
            </table>
        </div>
    )
}
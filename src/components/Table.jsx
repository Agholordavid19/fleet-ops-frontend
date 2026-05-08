export default function Table({ columns, data, emptyMessage = 'No records found.' }) {
    return (
        <div className="w-full overflow-x-auto rounded-xl border border-gray-800/60">
            <table className="w-full text-[13px]">
                <thead>
                    <tr className="border-b border-gray-800/60">
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-[0.08em] text-gray-600 whitespace-nowrap"
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
                                className="px-4 py-14 text-center text-[13px] text-gray-600"
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        data.map((row, i) => (
                            <tr
                                key={row.id ?? i}
                                className="border-b border-gray-800/40 last:border-0 hover:bg-gray-800/20 transition-colors duration-100"
                            >
                                {columns.map((col) => (
                                    <td key={col.key} className="px-4 py-3.5 text-gray-300 leading-snug">
                                        {col.render ? col.render(row) : (row[col.key] ?? '—')}
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
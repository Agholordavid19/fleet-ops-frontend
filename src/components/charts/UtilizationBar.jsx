import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function UtilizationBar({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-stone-400 text-sm">
        No utilization data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F4" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: '#78716C' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#78716C' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
          domain={[0, 100]}
        />
        <Tooltip
          formatter={(value) => [`${value?.toFixed(1)}%`, 'Utilization']}
          contentStyle={{
            background: '#fff',
            border: '1px solid #E7E5E4',
            borderRadius: '8px',
            fontSize: '12px',
          }}
        />
        <Bar dataKey="utilizationRate" radius={[4, 4, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill="#292524" opacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

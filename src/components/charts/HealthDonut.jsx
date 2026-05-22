import { useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const COLORS = {
  EXCELLENT: '#16A34A',
  GOOD: '#0D9488',
  FAIR: '#D97706',
  POOR: '#EA580C',
  CRITICAL: '#DC2626',
}

const LABELS = {
  EXCELLENT: 'Excellent',
  GOOD: 'Good',
  FAIR: 'Fair',
  POOR: 'Poor',
  CRITICAL: 'Critical',
}

const TOOLTIP_STYLE = {
  background: '#fff',
  border: '1px solid #E7E5E4',
  borderRadius: '8px',
  fontSize: '12px',
}

function legendFormatter(value) {
  return <span style={{ fontSize: 12, color: '#78716C' }}>{value}</span>
}

export default function HealthDonut({ data }) {
  const chartData = useMemo(
    () => Object.entries(data ?? {})
      .filter(([, v]) => v > 0)
      .map(([key, value]) => ({
        name: LABELS[key] ?? key,
        value,
        color: COLORS[key] ?? '#A8A29E',
      })),
    [data],
  )

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-stone-400 text-sm">
        No health data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={2}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => [value, name]}
          contentStyle={TOOLTIP_STYLE}
        />
        <Legend formatter={legendFormatter} />
      </PieChart>
    </ResponsiveContainer>
  )
}

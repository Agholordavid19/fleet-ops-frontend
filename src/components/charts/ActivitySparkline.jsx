import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'

export default function ActivitySparkline({ data }) {
  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="count"
          stroke="#2563EB"
          strokeWidth={1.5}
          dot={false}
        />
        <Tooltip
          contentStyle={{ fontSize: 11, padding: '4px 8px', borderRadius: 6 }}
          labelFormatter={() => ''}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

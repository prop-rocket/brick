import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const TICK_STYLE = {
  fill: '#8C8078',
  fontFamily: '"DM Mono", ui-monospace, monospace',
  fontSize: 11,
}

function WeightTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const w = payload.find((p) => p.dataKey === 'weight')?.value
  const ma = payload.find((p) => p.dataKey === 'ma7')?.value
  return (
    <div className="rounded-lg border border-dust/40 bg-mortar px-3 py-2 font-mono text-[11px] text-chalk shadow-xl">
      <p className="uppercase tracking-[0.18em] text-iron">{label}</p>
      {w != null && (
        <p className="mt-1 text-base text-chalk">{Number(w).toFixed(1)} kg</p>
      )}
      {ma != null && (
        <p className="text-brick-red">7-day avg: {Number(ma).toFixed(1)} kg</p>
      )}
    </div>
  )
}

export default function WeightChart({ data }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: -10 }}>
          <CartesianGrid stroke="#4A4540" strokeOpacity={0.4} vertical={false} />
          <XAxis
            dataKey="label"
            tick={TICK_STYLE}
            axisLine={{ stroke: '#4A4540' }}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={20}
          />
          <YAxis
            tick={TICK_STYLE}
            axisLine={false}
            tickLine={false}
            width={48}
            domain={['auto', 'auto']}
            tickFormatter={(v) => `${Number(v).toFixed(0)}`}
          />
          <Tooltip
            content={<WeightTooltip />}
            cursor={{ stroke: '#4A4540', strokeDasharray: '3 3' }}
          />
          <Legend
            verticalAlign="top"
            height={24}
            wrapperStyle={{
              fontFamily: '"DM Mono", ui-monospace, monospace',
              fontSize: 10,
              color: '#8C8078',
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
            }}
            iconType="plainline"
          />
          <Line
            name="Weight"
            type="monotone"
            dataKey="weight"
            stroke="#F0EBE3"
            strokeWidth={2}
            dot={{ r: 2.5, fill: '#F0EBE3', stroke: '#1C1A18', strokeWidth: 1.5 }}
            activeDot={{ r: 5, fill: '#F0EBE3', stroke: '#1C1A18', strokeWidth: 2 }}
            connectNulls
            isAnimationActive={false}
          />
          <Line
            name="7-day avg"
            type="monotone"
            dataKey="ma7"
            stroke="#C8432B"
            strokeWidth={2}
            strokeDasharray="4 3"
            dot={false}
            connectNulls
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

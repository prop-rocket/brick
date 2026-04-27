import {
  CartesianGrid,
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

function VolumeTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const v = payload[0].value
  return (
    <div className="rounded-lg border border-dust/40 bg-mortar px-3 py-2 font-mono text-[11px] text-chalk shadow-xl">
      <p className="uppercase tracking-[0.18em] text-iron">Week of {label}</p>
      <p className="mt-1 text-base text-brick-red">
        {Number(v).toLocaleString()} kg
      </p>
    </div>
  )
}

export default function VolumeChart({ data }) {
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
            tickFormatter={(v) =>
              v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${v}`
            }
          />
          <Tooltip
            content={<VolumeTooltip />}
            cursor={{ stroke: '#4A4540', strokeDasharray: '3 3' }}
          />
          <Line
            type="monotone"
            dataKey="volume"
            stroke="#C8432B"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#C8432B', stroke: '#1C1A18', strokeWidth: 2 }}
            activeDot={{ r: 5, fill: '#E85D3A', stroke: '#1C1A18', strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

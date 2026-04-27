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

const SERIES = [
  { key: 'chest', label: 'Chest', color: '#F0EBE3' },
  { key: 'waist', label: 'Waist', color: '#C8432B' },
  { key: 'hips', label: 'Hips', color: '#E85D3A' },
]

function MeasurementsTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-dust/40 bg-mortar px-3 py-2 font-mono text-[11px] text-chalk shadow-xl">
      <p className="uppercase tracking-[0.18em] text-iron">{label}</p>
      <div className="mt-1 flex flex-col gap-0.5">
        {SERIES.map((s) => {
          const v = payload.find((p) => p.dataKey === s.key)?.value
          if (v == null) return null
          return (
            <p key={s.key} style={{ color: s.color }}>
              {s.label}: {Number(v).toFixed(1)} cm
            </p>
          )
        })}
      </div>
    </div>
  )
}

export default function MeasurementsChart({ data }) {
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
            content={<MeasurementsTooltip />}
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
          {SERIES.map((s) => (
            <Line
              key={s.key}
              name={s.label}
              type="monotone"
              dataKey={s.key}
              stroke={s.color}
              strokeWidth={2}
              dot={{ r: 2.5, fill: s.color, stroke: '#1C1A18', strokeWidth: 1.5 }}
              activeDot={{ r: 5, fill: s.color, stroke: '#1C1A18', strokeWidth: 2 }}
              connectNulls
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

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
import { useChartColors } from '../../lib/chartColors.js'

function MeasurementsTooltip({ active, payload, label, series }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-dust/40 bg-mortar px-3 py-2 font-mono text-[11px] text-chalk shadow-xl">
      <p className="uppercase tracking-[0.18em] text-iron">{label}</p>
      <div className="mt-1 flex flex-col gap-0.5">
        {series.map((s) => {
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
  const c = useChartColors()
  const tickStyle = {
    fill: c.iron,
    fontFamily: '"DM Mono", ui-monospace, monospace',
    fontSize: 11,
  }

  const SERIES = [
    { key: 'chest', label: 'Chest', color: c.chalk },
    { key: 'waist', label: 'Waist', color: c.brickRed },
    { key: 'hips',  label: 'Hips',  color: c.ember },
  ]

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: -10 }}>
          <CartesianGrid stroke={c.dust} strokeOpacity={0.4} vertical={false} />
          <XAxis
            dataKey="label"
            tick={tickStyle}
            axisLine={{ stroke: c.dust }}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={20}
          />
          <YAxis
            tick={tickStyle}
            axisLine={false}
            tickLine={false}
            width={48}
            domain={['auto', 'auto']}
            tickFormatter={(v) => `${Number(v).toFixed(0)}`}
          />
          <Tooltip
            content={<MeasurementsTooltip series={SERIES} />}
            cursor={{ stroke: c.dust, strokeDasharray: '3 3' }}
          />
          <Legend
            verticalAlign="top"
            height={24}
            wrapperStyle={{
              fontFamily: '"DM Mono", ui-monospace, monospace',
              fontSize: 10,
              color: c.iron,
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
              dot={{ r: 2.5, fill: s.color, stroke: c.mortar, strokeWidth: 1.5 }}
              activeDot={{ r: 5, fill: s.color, stroke: c.mortar, strokeWidth: 2 }}
              connectNulls
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

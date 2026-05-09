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
  const c = useChartColors()
  const tickStyle = {
    fill: c.iron,
    fontFamily: '"DM Mono", ui-monospace, monospace',
    fontSize: 11,
  }

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
            content={<WeightTooltip />}
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
          <Line
            name="Weight"
            type="monotone"
            dataKey="weight"
            stroke={c.chalk}
            strokeWidth={2}
            dot={{ r: 2.5, fill: c.chalk, stroke: c.mortar, strokeWidth: 1.5 }}
            activeDot={{ r: 5, fill: c.chalk, stroke: c.mortar, strokeWidth: 2 }}
            connectNulls
            isAnimationActive={false}
          />
          <Line
            name="7-day avg"
            type="monotone"
            dataKey="ma7"
            stroke={c.brickRed}
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

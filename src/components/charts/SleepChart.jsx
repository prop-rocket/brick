import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useChartColors } from '../../lib/chartColors.js'

function fmtHours(h) {
  if (h == null) return '—'
  const total = Math.round(h * 60)
  return `${Math.floor(total / 60)}h ${total % 60}m`
}

function SleepTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const hours = payload.find((p) => p.dataKey === 'hours')?.value
  const score = payload.find((p) => p.dataKey === 'score')?.value
  return (
    <div className="rounded-lg border border-dust/40 bg-mortar px-3 py-2 font-mono text-[11px] text-chalk shadow-xl">
      <p className="uppercase tracking-[0.18em] text-iron">{label}</p>
      {hours != null && <p className="mt-1 text-base text-chalk">{fmtHours(hours)}</p>}
      {score != null && <p className="text-brick-red">Score: {Math.round(score)}</p>}
    </div>
  )
}

export default function SleepChart({ data }) {
  const c = useChartColors()
  const tickStyle = {
    fill: c.iron,
    fontFamily: '"DM Mono", ui-monospace, monospace',
    fontSize: 11,
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: -12 }}>
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
            yAxisId="hours"
            tick={tickStyle}
            axisLine={false}
            tickLine={false}
            width={40}
            domain={[0, 'auto']}
            tickFormatter={(v) => `${v}h`}
          />
          <YAxis
            yAxisId="score"
            orientation="right"
            tick={tickStyle}
            axisLine={false}
            tickLine={false}
            width={32}
            domain={[0, 100]}
            hide
          />
          <Tooltip
            content={<SleepTooltip />}
            cursor={{ fill: c.dust, fillOpacity: 0.15 }}
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
          />
          <Bar
            yAxisId="hours"
            name="Hours asleep"
            dataKey="hours"
            fill={c.brickRed}
            radius={[3, 3, 0, 0]}
            maxBarSize={22}
            isAnimationActive={false}
          />
          <Line
            yAxisId="score"
            name="Sleep score"
            type="monotone"
            dataKey="score"
            stroke={c.chalk}
            strokeWidth={2}
            dot={{ r: 2.5, fill: c.chalk, stroke: c.mortar, strokeWidth: 1.5 }}
            activeDot={{ r: 5, fill: c.chalk, stroke: c.mortar, strokeWidth: 2 }}
            connectNulls
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

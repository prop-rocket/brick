import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useChartColors } from '../../lib/chartColors.js'

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
            tickFormatter={(v) =>
              v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${v}`
            }
          />
          <Tooltip
            content={<VolumeTooltip />}
            cursor={{ stroke: c.dust, strokeDasharray: '3 3' }}
          />
          <Line
            type="monotone"
            dataKey="volume"
            stroke={c.brickRed}
            strokeWidth={2.5}
            dot={{ r: 3, fill: c.brickRed, stroke: c.mortar, strokeWidth: 2 }}
            activeDot={{ r: 5, fill: c.ember, stroke: c.mortar, strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

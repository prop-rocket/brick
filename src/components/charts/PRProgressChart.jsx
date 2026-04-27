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

function ProgressTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const point = payload[0].payload
  return (
    <div className="rounded-lg border border-dust/40 bg-mortar px-3 py-2 font-mono text-[11px] text-chalk shadow-xl">
      <p className="uppercase tracking-[0.18em] text-iron">{label}</p>
      <p className="mt-1 text-base text-ember">{point.weightKg} kg</p>
      {point.isPR && (
        <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-brick-red">
          🏆 New PR
        </p>
      )}
    </div>
  )
}

// Custom dot to render trophy on PR points
function PRDot(props) {
  const { cx, cy, payload } = props
  if (cx == null || cy == null) return null
  if (payload?.isPR) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={4.5} fill="#E85D3A" stroke="#1C1A18" strokeWidth={2} />
        <text
          x={cx}
          y={cy - 10}
          textAnchor="middle"
          fontSize={11}
          fontFamily="DM Mono, monospace"
        >
          🏆
        </text>
      </g>
    )
  }
  return <circle cx={cx} cy={cy} r={3} fill="#E85D3A" stroke="#1C1A18" strokeWidth={2} />
}

export default function PRProgressChart({ data }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 16, right: 8, bottom: 4, left: -10 }}>
          <CartesianGrid stroke="#4A4540" strokeOpacity={0.4} vertical={false} />
          <XAxis
            dataKey="label"
            tick={TICK_STYLE}
            axisLine={{ stroke: '#4A4540' }}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis
            tick={TICK_STYLE}
            axisLine={false}
            tickLine={false}
            width={42}
            domain={['auto', 'auto']}
          />
          <Tooltip
            content={<ProgressTooltip />}
            cursor={{ stroke: '#4A4540', strokeDasharray: '3 3' }}
          />
          <Line
            type="monotone"
            dataKey="weightKg"
            stroke="#E85D3A"
            strokeWidth={2.5}
            dot={<PRDot />}
            activeDot={{ r: 6, fill: '#C8432B', stroke: '#1C1A18', strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

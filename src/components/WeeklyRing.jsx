export default function WeeklyRing({ value, goal, size = 44, strokeWidth = 4 }) {
  const safeGoal = Math.max(1, goal || 1)
  const progress = Math.min(value / safeGoal, 1)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - progress)
  const center = size / 2
  const complete = value >= safeGoal

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#4A4540"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke={complete ? '#E85D3A' : '#C8432B'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 300ms ease-out' }}
        />
      </svg>
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-[10px] text-chalk">
        {value}/{safeGoal}
      </span>
    </div>
  )
}

import { Flame } from 'lucide-react'

// rows: [{ id, name, color, best, current, total, frequency_type, weekly_goal }]
// Renders a vertical list of horizontal bars: best streak = filled width,
// current streak = ember overlay on top.
export default function StreakLeaderboard({ rows, sortKey, expandedId, onExpand }) {
  if (!rows.length) {
    return (
      <p className="py-6 text-center text-sm text-iron">
        No habits to rank yet.
      </p>
    )
  }

  const max = Math.max(
    1,
    ...rows.map((r) =>
      sortKey === 'total' ? r.total : Math.max(r.best, r.current),
    ),
  )

  return (
    <ul className="flex flex-col gap-2">
      {rows.map((r) => {
        const expanded = expandedId === r.id
        const accent = r.color ?? '#C8432B'
        const bestPct = sortKey === 'total' ? 0 : (r.best / max) * 100
        const currentPct = sortKey === 'total' ? 0 : (r.current / max) * 100
        const totalPct = sortKey === 'total' ? (r.total / max) * 100 : 0

        const primaryValue =
          sortKey === 'best'
            ? `${r.best}d`
            : sortKey === 'current'
            ? `${r.current}d`
            : `${r.total}`

        return (
          <li key={r.id}>
            <button
              type="button"
              onClick={() => onExpand?.(expanded ? null : r.id)}
              className="flex w-full flex-col gap-1.5 rounded-xl bg-mortar/60 px-3 py-3 text-left transition-colors hover:bg-mortar"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: accent }}
                  aria-hidden
                />
                <span className="heading flex-1 truncate text-sm text-chalk">
                  {r.name}
                </span>
                <span className="font-mono text-sm text-chalk">{primaryValue}</span>
              </div>

              {/* Bar */}
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-ash">
                {sortKey === 'total' ? (
                  <div
                    className="absolute inset-y-0 left-0 bg-brick-red"
                    style={{ width: `${totalPct}%` }}
                  />
                ) : (
                  <>
                    <div
                      className="absolute inset-y-0 left-0 bg-brick-red/70"
                      style={{ width: `${bestPct}%` }}
                    />
                    {r.current > 0 && (
                      <div
                        className="absolute inset-y-0 left-0 bg-ember"
                        style={{ width: `${currentPct}%` }}
                      />
                    )}
                  </>
                )}
              </div>

              {expanded && (
                <div className="mt-2 grid grid-cols-3 gap-2 border-t border-dust/30 pt-2">
                  <Stat label="Best" value={`${r.best}d`} />
                  <Stat
                    label="Current"
                    value={`${r.current}d`}
                    icon={r.current > 0 ? Flame : null}
                    tone="ember"
                  />
                  <Stat label="Total" value={r.total} />
                </div>
              )}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

function Stat({ label, value, icon: Icon, tone }) {
  return (
    <div className="flex flex-col rounded-md bg-ash/60 px-2 py-1.5">
      <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-iron">
        {label}
      </span>
      <span
        className={`mt-0.5 inline-flex items-center gap-1 font-mono text-sm ${
          tone === 'ember' ? 'text-ember' : 'text-chalk'
        }`}
      >
        {Icon && <Icon size={12} />}
        {value}
      </span>
    </div>
  )
}

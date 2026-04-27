import { useMemo, useState } from 'react'
import { mondayOf, toDateStr } from '../../lib/streakUtils.js'

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

function cellColor(count) {
  if (!count) return '#2E2B28' // ash
  if (count === 1) return '#7A2A1A' // dark brick
  return '#C8432B' // brick-red
}

export default function FrequencyHeatmap({ cells }) {
  const [selected, setSelected] = useState(null)

  // Bucket cells by week. Each column = a week (Mon..Sun).
  // The cells array is contiguous days oldest → newest.
  const { weeks, monthLabels } = useMemo(() => {
    if (!cells.length) return { weeks: [], monthLabels: [] }

    const firstMonday = mondayOf(cells[0].dateObj)
    const map = new Map(cells.map((c) => [c.date, c]))

    const weeks = []
    const monthLabels = []
    const now = new Date()
    const lastMonday = mondayOf(now)
    const cursor = new Date(firstMonday)
    let lastMonthShown = -1

    while (cursor <= lastMonday) {
      const days = []
      for (let i = 0; i < 7; i++) {
        const d = new Date(cursor)
        d.setDate(cursor.getDate() + i)
        const k = toDateStr(d)
        const cell = map.get(k)
        days.push(cell ?? { date: k, count: 0, workouts: [], dateObj: d, _outOfRange: !cell })
      }
      weeks.push(days)

      // Month label whenever the month of the column's Monday changes
      const monthIdx = cursor.getMonth()
      if (monthIdx !== lastMonthShown) {
        monthLabels.push({
          colIndex: weeks.length - 1,
          label: cursor.toLocaleDateString(undefined, { month: 'short' }).toUpperCase(),
        })
        lastMonthShown = monthIdx
      }

      cursor.setDate(cursor.getDate() + 7)
    }

    return { weeks, monthLabels }
  }, [cells])

  const handleSelect = (cell) => {
    if (cell._outOfRange) return
    setSelected((prev) => (prev?.date === cell.date ? null : cell))
  }

  const formatTooltipDate = (iso) =>
    new Date(iso).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })

  return (
    <div className="flex flex-col gap-3">
      {/* Month labels row */}
      <div
        className="ml-6 grid gap-1"
        style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: weeks.length }).map((_, colIdx) => {
          const ml = monthLabels.find((m) => m.colIndex === colIdx)
          return (
            <span
              key={colIdx}
              className="font-mono text-[9px] uppercase tracking-[0.16em] text-iron"
            >
              {ml?.label ?? ''}
            </span>
          )
        })}
      </div>

      {/* Grid */}
      <div className="flex gap-1.5">
        {/* Day-of-week labels */}
        <div className="grid grid-rows-7 gap-1">
          {DAY_LABELS.map((d, i) => (
            <span
              key={i}
              className="flex h-3 w-4 items-center font-mono text-[9px] text-iron"
            >
              {d}
            </span>
          ))}
        </div>

        {/* Heatmap cells */}
        <div
          className="grid flex-1 gap-1"
          style={{
            gridAutoFlow: 'column',
            gridTemplateRows: 'repeat(7, minmax(0, 1fr))',
            gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))`,
          }}
        >
          {weeks.flat().map((cell) => {
            const isSelected = selected?.date === cell.date
            return (
              <button
                type="button"
                key={cell.date}
                aria-label={`${formatTooltipDate(cell.date)} — ${cell.count} workout${cell.count !== 1 ? 's' : ''}`}
                onClick={() => handleSelect(cell)}
                disabled={cell._outOfRange}
                className={`aspect-square rounded-sm transition-transform ${
                  cell._outOfRange ? 'opacity-30' : 'hover:scale-110'
                } ${isSelected ? 'ring-2 ring-chalk' : ''}`}
                style={{ backgroundColor: cellColor(cell.count) }}
              />
            )
          })}
        </div>
      </div>

      {/* Tooltip / detail card for selected day */}
      {selected ? (
        <div className="mt-2 rounded-lg border border-dust/40 bg-mortar px-3 py-2 font-mono text-[11px] text-chalk">
          <p className="uppercase tracking-[0.18em] text-iron">
            {formatTooltipDate(selected.date)}
          </p>
          {selected.count === 0 ? (
            <p className="mt-1 text-iron">No workout</p>
          ) : (
            <div className="mt-1 flex flex-col gap-0.5">
              {selected.workouts.map((w) => (
                <p key={w.id} className="text-chalk">
                  {w.workout_templates?.name ?? 'Workout'}
                </p>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-end gap-2 font-mono text-[10px] text-iron">
          <span>Less</span>
          <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: '#2E2B28' }} />
          <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: '#7A2A1A' }} />
          <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: '#C8432B' }} />
          <span>More</span>
        </div>
      )}
    </div>
  )
}

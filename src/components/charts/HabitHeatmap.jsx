import { useMemo, useState } from 'react'
import { mondayOf, toDateStr } from '../../lib/streakUtils.js'

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

// When mode = 'all', `count` is the number of habits completed that day.
// When mode = 'single', `count` is 0 or 1 for the selected habit on that day.
// Color scale tuned for a single user's typical habit count.
function cellColor(count, mode) {
  if (!count) return '#2E2B28' // ash
  if (mode === 'single') return '#C8432B' // brick-red — binary
  if (count === 1) return '#5C2317' // very dark brick
  if (count === 2) return '#7A2A1A' // dark brick
  if (count <= 4) return '#C8432B' // brick-red
  return '#E85D3A' // ember (5+)
}

// cells: [{ date, dateObj, count, names: [habit names completed that day] }] oldest → newest
export default function HabitHeatmap({ cells, mode = 'all' }) {
  const [selected, setSelected] = useState(null)

  const { weeks, monthLabels } = useMemo(() => {
    if (!cells.length) return { weeks: [], monthLabels: [] }

    const firstMonday = mondayOf(cells[0].dateObj)
    const map = new Map(cells.map((c) => [c.date, c]))

    const weeks = []
    const monthLabels = []
    const lastMonday = mondayOf(new Date())
    const cursor = new Date(firstMonday)
    let lastMonthShown = -1

    while (cursor <= lastMonday) {
      const days = []
      for (let i = 0; i < 7; i++) {
        const d = new Date(cursor)
        d.setDate(cursor.getDate() + i)
        const k = toDateStr(d)
        const cell = map.get(k)
        days.push(cell ?? { date: k, count: 0, names: [], dateObj: d, _outOfRange: !cell })
      }
      weeks.push(days)

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

  const legendStops =
    mode === 'single'
      ? ['#2E2B28', '#C8432B']
      : ['#2E2B28', '#5C2317', '#7A2A1A', '#C8432B', '#E85D3A']

  return (
    <div className="flex flex-col gap-3">
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

      <div className="flex gap-1.5">
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
                aria-label={`${formatTooltipDate(cell.date)} — ${cell.count} ${
                  mode === 'single' ? (cell.count ? 'completed' : 'missed') : 'completions'
                }`}
                onClick={() => handleSelect(cell)}
                disabled={cell._outOfRange}
                className={`aspect-square rounded-sm transition-transform ${
                  cell._outOfRange ? 'opacity-30' : 'hover:scale-110'
                } ${isSelected ? 'ring-2 ring-chalk' : ''}`}
                style={{ backgroundColor: cellColor(cell.count, mode) }}
              />
            )
          })}
        </div>
      </div>

      {selected ? (
        <div className="mt-2 rounded-lg border border-dust/40 bg-mortar px-3 py-2 font-mono text-[11px] text-chalk">
          <p className="uppercase tracking-[0.18em] text-iron">
            {formatTooltipDate(selected.date)}
          </p>
          {selected.count === 0 ? (
            <p className="mt-1 text-iron">
              {mode === 'single' ? 'Not completed' : 'No habits logged'}
            </p>
          ) : (
            <div className="mt-1 flex flex-col gap-0.5">
              {mode === 'single' ? (
                <p className="text-chalk">Completed</p>
              ) : (
                selected.names.map((name, i) => (
                  <p key={i} className="text-chalk">
                    {name}
                  </p>
                ))
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-end gap-2 font-mono text-[10px] text-iron">
          <span>Less</span>
          {legendStops.map((c) => (
            <span
              key={c}
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: c }}
            />
          ))}
          <span>More</span>
        </div>
      )}
    </div>
  )
}

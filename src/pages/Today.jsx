import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarCheck2, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  useHabits,
  useHabitLogs,
  useToggleHabitLog,
} from '../lib/habitsApi.js'
import {
  currentStreak,
  thisWeekCount,
  todayStr,
  toDateStr,
  addDays,
} from '../lib/streakUtils.js'
import TodayHabitCard from '../components/TodayHabitCard.jsx'
import CelebrationBanner from '../components/CelebrationBanner.jsx'

// "Today" / "Yesterday" / "Mon, Jun 23" for the navigator header.
function dayLabel(dateStr, today) {
  if (dateStr === today) return 'Today'
  if (dateStr === addDays(today, -1)) return 'Yesterday'
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export default function Today() {
  const habitsQuery = useHabits()
  const logsQuery = useHabitLogs()
  const toggle = useToggleHabitLog()

  const habits = habitsQuery.data ?? []
  const logs = logsQuery.data ?? []

  const today = todayStr()
  const [viewedDate, setViewedDate] = useState(today)
  const isToday = viewedDate === today

  const datesByHabit = useMemo(() => {
    const m = new Map()
    for (const log of logs) {
      if (!m.has(log.habit_id)) m.set(log.habit_id, [])
      m.get(log.habit_id).push(log.completed_at)
    }
    return m
  }, [logs])

  const completedForDate = useMemo(() => {
    const set = new Set()
    for (const log of logs) {
      if (log.completed_at === viewedDate) set.add(log.habit_id)
    }
    return set
  }, [logs, viewedDate])

  // Only show habits that already existed on the viewed day.
  const visibleHabits = useMemo(
    () => habits.filter((h) => !h.created_at || toDateStr(h.created_at) <= viewedDate),
    [habits, viewedDate],
  )

  const sorted = useMemo(() => {
    return [...visibleHabits].sort((a, b) => {
      const aDone = completedForDate.has(a.id) ? 1 : 0
      const bDone = completedForDate.has(b.id) ? 1 : 0
      if (aDone !== bDone) return aDone - bDone // incomplete first
      return new Date(a.created_at) - new Date(b.created_at)
    })
  }, [visibleHabits, completedForDate])

  const allDone =
    visibleHabits.length > 0 && visibleHabits.every((h) => completedForDate.has(h.id))

  if (habitsQuery.isLoading) {
    return <ListLoading />
  }

  if (habitsQuery.isError) {
    return (
      <p className="rounded-md border border-brick-red/40 bg-brick-red/10 px-3 py-3 text-sm text-brick-red">
        Failed to load: {habitsQuery.error?.message}
      </p>
    )
  }

  if (habits.length === 0) {
    return <EmptyState />
  }

  const totalDone = sorted.filter((h) => completedForDate.has(h.id)).length

  return (
    <section className="flex flex-col gap-4">
      <header className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setViewedDate((d) => addDays(d, -1))}
          aria-label="Previous day"
          className="min-h-tap min-w-tap flex items-center justify-center rounded-lg text-iron hover:text-chalk"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="flex flex-col items-center text-center">
          <h1 className="heading text-3xl">{dayLabel(viewedDate, today)}</h1>
          <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.2em] text-iron">
            {totalDone} of {sorted.length} complete
          </p>
        </div>

        <button
          type="button"
          onClick={() => setViewedDate((d) => addDays(d, 1))}
          disabled={isToday}
          aria-label="Next day"
          className="min-h-tap min-w-tap flex items-center justify-center rounded-lg text-iron hover:text-chalk disabled:opacity-30"
        >
          <ChevronRight size={24} />
        </button>
      </header>

      {allDone && isToday && <CelebrationBanner />}

      {sorted.length === 0 ? (
        <p className="rounded-xl border border-dashed border-dust/40 bg-ash/40 px-4 py-8 text-center text-sm text-iron">
          No habits existed on this day.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {sorted.map((habit) => {
            const dates = datesByHabit.get(habit.id) ?? []
            return (
              <TodayHabitCard
                key={habit.id}
                habit={habit}
                completed={completedForDate.has(habit.id)}
                streak={currentStreak(dates)}
                weekValue={thisWeekCount(dates)}
                onToggle={(h) => toggle.mutate({ habitId: h.id, date: viewedDate })}
                pending={toggle.isPending && toggle.variables?.habitId === habit.id}
              />
            )
          })}
        </ul>
      )}
    </section>
  )
}

function ListLoading() {
  return (
    <section className="flex flex-col gap-4">
      <div className="h-8 w-32 animate-shimmer rounded bg-ash/60" />
      <div className="flex flex-col gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="min-h-[72px] animate-shimmer rounded-xl bg-ash/60"
          />
        ))}
      </div>
    </section>
  )
}

function EmptyState() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-ash text-brick-red">
        <CalendarCheck2 size={44} />
      </div>
      <h1 className="heading text-3xl">No habits yet</h1>
      <p className="mt-2 max-w-xs text-sm text-sand">
        Build your stack on the Habits tab — your first brick is one tap away.
      </p>
      <Link
        to="/habits"
        className="heading mt-5 min-h-tap inline-flex items-center rounded-lg bg-brick-red px-5 text-sm text-chalk hover:bg-ember"
      >
        Go to Habits
      </Link>
    </section>
  )
}

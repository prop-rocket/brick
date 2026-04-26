import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { CalendarCheck2 } from 'lucide-react'
import {
  useHabits,
  useHabitLogs,
  useToggleHabitLog,
} from '../lib/habitsApi.js'
import {
  currentStreak,
  thisWeekCount,
  todayStr,
} from '../lib/streakUtils.js'
import TodayHabitCard from '../components/TodayHabitCard.jsx'
import CelebrationBanner from '../components/CelebrationBanner.jsx'

export default function Today() {
  const habitsQuery = useHabits()
  const logsQuery = useHabitLogs()
  const toggle = useToggleHabitLog()

  const habits = habitsQuery.data ?? []
  const logs = logsQuery.data ?? []

  const today = todayStr()

  const datesByHabit = useMemo(() => {
    const m = new Map()
    for (const log of logs) {
      if (!m.has(log.habit_id)) m.set(log.habit_id, [])
      m.get(log.habit_id).push(log.completed_at)
    }
    return m
  }, [logs])

  const completedToday = useMemo(() => {
    const set = new Set()
    for (const log of logs) {
      if (log.completed_at === today) set.add(log.habit_id)
    }
    return set
  }, [logs, today])

  const sorted = useMemo(() => {
    return [...habits].sort((a, b) => {
      const aDone = completedToday.has(a.id) ? 1 : 0
      const bDone = completedToday.has(b.id) ? 1 : 0
      if (aDone !== bDone) return aDone - bDone // incomplete first
      return new Date(a.created_at) - new Date(b.created_at)
    })
  }, [habits, completedToday])

  const allDone = habits.length > 0 && habits.every((h) => completedToday.has(h.id))

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

  const totalDone = completedToday.size

  return (
    <section className="flex flex-col gap-4">
      <header>
        <h1 className="heading text-3xl">Today</h1>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-iron">
          {totalDone} of {habits.length} complete
        </p>
      </header>

      {allDone && <CelebrationBanner />}

      <ul className="flex flex-col gap-2">
        {sorted.map((habit) => {
          const dates = datesByHabit.get(habit.id) ?? []
          return (
            <TodayHabitCard
              key={habit.id}
              habit={habit}
              completed={completedToday.has(habit.id)}
              streak={currentStreak(dates)}
              weekValue={thisWeekCount(dates)}
              onToggle={(h) => toggle.mutate(h.id)}
              pending={toggle.isPending && toggle.variables === habit.id}
            />
          )
        })}
      </ul>
    </section>
  )
}

function ListLoading() {
  return (
    <section className="flex flex-col gap-4">
      <div className="h-8 w-32 animate-pulse rounded bg-ash/60" />
      <div className="flex flex-col gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="min-h-[72px] animate-pulse rounded-xl bg-ash/60"
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

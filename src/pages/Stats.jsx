import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BarChart3, ChevronDown, UtensilsCrossed } from 'lucide-react'
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from 'recharts'
import {
  useVolumeByWeek,
  useExerciseProgress,
  useFrequencyCells,
  useAllUserSets,
} from '../lib/statsApi.js'
import { useExercises } from '../lib/gymApi.js'
import { useHabits, useHabitLogs } from '../lib/habitsApi.js'
import { useDailyCaloriesByWeek } from '../lib/foodApi.js'
import { useWeekWater } from '../lib/waterApi.js'
import {
  bestStreak,
  currentStreak,
  lastNDays,
  toDateStr,
  todayStr,
} from '../lib/streakUtils.js'
import SectionTabs from '../components/charts/SectionTabs.jsx'
import ChartCard from '../components/charts/ChartCard.jsx'
import StatPill from '../components/charts/StatPill.jsx'
import VolumeChart from '../components/charts/VolumeChart.jsx'
import PRProgressChart from '../components/charts/PRProgressChart.jsx'
import FrequencyHeatmap from '../components/charts/FrequencyHeatmap.jsx'
import HabitHeatmap from '../components/charts/HabitHeatmap.jsx'
import StreakLeaderboard from '../components/charts/StreakLeaderboard.jsx'
import { getMacroGoals } from '../components/MacrosSummaryCard.jsx'
import { getWaterGoal } from '../components/WaterTracker.jsx'

const SECTION_OPTIONS = [
  { value: 'gym', label: 'Gym' },
  { value: 'habits', label: 'Habits' },
  { value: 'fuel', label: 'Fuel' },
]

function shortDay(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, { weekday: 'short' })[0]
}

export default function Stats() {
  const [section, setSection] = useState('gym')

  return (
    <section className="flex flex-col gap-4">
      <h1 className="heading text-3xl">Stats</h1>
      <SectionTabs value={section} onChange={setSection} options={SECTION_OPTIONS} />
      {section === 'gym' && <GymStats />}
      {section === 'habits' && <HabitsStats />}
      {section === 'fuel' && <FuelStats />}
    </section>
  )
}

const HEATMAP_DAYS = 84 // 12 weeks
const SORT_OPTIONS = [
  { value: 'best', label: 'Best Streak' },
  { value: 'current', label: 'Current' },
  { value: 'total', label: 'Total' },
]

function HabitsStats() {
  const { data: habits = [], isLoading: hLoading } = useHabits()
  const { data: logs = [], isLoading: lLoading } = useHabitLogs()
  const [habitFilter, setHabitFilter] = useState('all')
  const [sortKey, setSortKey] = useState('best')
  const [expandedId, setExpandedId] = useState(null)

  const habitById = useMemo(() => {
    const m = new Map()
    for (const h of habits) m.set(h.id, h)
    return m
  }, [habits])

  // Group logs by habit for streak math.
  const datesByHabit = useMemo(() => {
    const m = new Map()
    for (const log of logs) {
      const arr = m.get(log.habit_id) ?? []
      arr.push(log.completed_at)
      m.set(log.habit_id, arr)
    }
    return m
  }, [logs])

  // Heatmap cells over the last 12 weeks. Filtered by habit if selected.
  const heatmapCells = useMemo(() => {
    const days = lastNDays(HEATMAP_DAYS)
    const inRange = new Set(days.map((d) => toDateStr(d)))
    const counts = new Map()
    const namesByDay = new Map()

    for (const log of logs) {
      if (!inRange.has(log.completed_at)) continue
      if (habitFilter !== 'all' && log.habit_id !== habitFilter) continue
      counts.set(log.completed_at, (counts.get(log.completed_at) ?? 0) + 1)
      const arr = namesByDay.get(log.completed_at) ?? []
      const habit = habitById.get(log.habit_id)
      if (habit) arr.push(habit.name)
      namesByDay.set(log.completed_at, arr)
    }

    return days.map((d) => {
      const date = toDateStr(d)
      return {
        date,
        dateObj: d,
        count: counts.get(date) ?? 0,
        names: namesByDay.get(date) ?? [],
      }
    })
  }, [logs, habitFilter, habitById])

  // Per-habit leaderboard rows.
  const rows = useMemo(() => {
    return habits
      .map((h) => {
        const dates = datesByHabit.get(h.id) ?? []
        return {
          id: h.id,
          name: h.name,
          color: h.color,
          best: bestStreak(dates),
          current: currentStreak(dates),
          total: dates.length,
          frequency_type: h.frequency_type,
          weekly_goal: h.weekly_goal,
        }
      })
      .sort((a, b) => {
        if (sortKey === 'best') return b.best - a.best || b.current - a.current
        if (sortKey === 'current') return b.current - a.current || b.best - a.best
        return b.total - a.total
      })
  }, [habits, datesByHabit, sortKey])

  // Stat pills. "Best day" = day with most habits completed in range.
  const summary = useMemo(() => {
    const totals = heatmapCells.reduce((sum, c) => sum + c.count, 0)
    const bestDay = heatmapCells.reduce(
      (best, c) => (c.count > (best?.count ?? 0) ? c : best),
      null,
    )
    const overallBest = rows.reduce((acc, r) => Math.max(acc, r.best), 0)
    const overallCurrent = rows.reduce((acc, r) => Math.max(acc, r.current), 0)
    return { totals, bestDay, overallBest, overallCurrent }
  }, [heatmapCells, rows])

  if (hLoading || lLoading) return <Loading />

  if (habits.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-dust/40 bg-ash/40 px-6 py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ash text-brick-red">
          <BarChart3 size={26} />
        </div>
        <div>
          <h2 className="heading text-lg">No habits yet</h2>
          <p className="mt-1 text-sm text-sand">
            Create habits on the Habits tab to see your stats here.
          </p>
        </div>
      </div>
    )
  }

  const heatmapMode = habitFilter === 'all' ? 'all' : 'single'

  return (
    <div className="flex flex-col gap-4">
      <ChartCard
        title="Completion — last 12 weeks"
        action={
          <HabitFilterSelect
            value={habitFilter}
            onChange={setHabitFilter}
            habits={habits}
          />
        }
      >
        <HabitHeatmap cells={heatmapCells} mode={heatmapMode} />
        <div className="mt-3 grid grid-cols-3 gap-2">
          <StatPill
            label="Completions"
            value={summary.totals > 0 ? summary.totals : '—'}
            accent
          />
          <StatPill
            label="Best day"
            value={
              summary.bestDay && summary.bestDay.count > 0
                ? `${summary.bestDay.count} on ${formatShortDate(summary.bestDay.date)}`
                : '—'
            }
          />
          <StatPill
            label="Best streak"
            value={summary.overallBest > 0 ? `${summary.overallBest}d` : '—'}
          />
        </div>
      </ChartCard>

      <ChartCard
        title="Streak Leaderboard"
        action={
          <SortSelect value={sortKey} onChange={setSortKey} options={SORT_OPTIONS} />
        }
      >
        <StreakLeaderboard
          rows={rows}
          sortKey={sortKey}
          expandedId={expandedId}
          onExpand={setExpandedId}
        />
      </ChartCard>
    </div>
  )
}

function formatShortDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

function HabitFilterSelect({ value, onChange, habits }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="heading min-h-[40px] appearance-none rounded-lg border border-dust/40 bg-mortar pl-3 pr-8 text-xs text-chalk outline-none focus:border-ember"
      >
        <option value="all">All Habits</option>
        {habits.map((h) => (
          <option key={h.id} value={h.id}>
            {h.name}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-iron"
      />
    </div>
  )
}

function SortSelect({ value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="heading min-h-[40px] appearance-none rounded-lg border border-dust/40 bg-mortar pl-3 pr-8 text-xs text-chalk outline-none focus:border-ember"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-iron"
      />
    </div>
  )
}

function GymStats() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialExerciseId = searchParams.get('exerciseId') ?? null

  const volume = useVolumeByWeek(12)
  const setsQuery = useAllUserSets()
  const { data: exercises = [] } = useExercises()

  // Set of exerciseIds the user has actually logged
  const loggedExerciseIds = useMemo(() => {
    const s = new Set()
    for (const set of setsQuery.data ?? []) s.add(set.exercise_id)
    return s
  }, [setsQuery.data])

  const exercisesWithHistory = useMemo(
    () => exercises.filter((e) => loggedExerciseIds.has(e.id)),
    [exercises, loggedExerciseIds],
  )

  const [selectedExerciseId, setSelectedExerciseId] = useState(initialExerciseId)
  useEffect(() => {
    if (!selectedExerciseId && exercisesWithHistory.length > 0) {
      setSelectedExerciseId(exercisesWithHistory[0].id)
    }
  }, [selectedExerciseId, exercisesWithHistory])

  // Sync URL param when user picks a different exercise
  useEffect(() => {
    if (selectedExerciseId && selectedExerciseId !== searchParams.get('exerciseId')) {
      setSearchParams({ exerciseId: selectedExerciseId }, { replace: true })
    }
  }, [selectedExerciseId, searchParams, setSearchParams])

  const progress = useExerciseProgress(selectedExerciseId)
  const frequency = useFrequencyCells(91)

  const hasAnyData = (setsQuery.data ?? []).length > 0

  if (setsQuery.isLoading) return <Loading />

  if (!hasAnyData) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-dust/40 bg-ash/40 px-6 py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ash text-brick-red">
          <BarChart3 size={26} />
        </div>
        <div>
          <h2 className="heading text-lg">No data yet</h2>
          <p className="mt-1 text-sm text-sand">
            Start logging workouts on the Gym tab to see your stats here.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Volume over time */}
      <ChartCard title="Volume — last 12 weeks">
        <VolumeChart data={volume.series} />
        <div className="mt-3 grid grid-cols-3 gap-2">
          <StatPill
            label="Best week"
            value={volume.bestWeek?.volume > 0 ? `${volume.bestWeek.volume.toLocaleString()} kg` : '—'}
            accent
          />
          <StatPill
            label="Avg / week"
            value={volume.avgWeekly > 0 ? `${volume.avgWeekly.toLocaleString()} kg` : '—'}
          />
          <StatPill
            label="All-time"
            value={volume.totalVolume > 0 ? `${volume.totalVolume.toLocaleString()} kg` : '—'}
          />
        </div>
      </ChartCard>

      {/* PR Progress */}
      <ChartCard
        title="PR Progress"
        action={
          exercisesWithHistory.length > 0 ? (
            <ExerciseSelect
              value={selectedExerciseId}
              onChange={setSelectedExerciseId}
              exercises={exercisesWithHistory}
            />
          ) : null
        }
      >
        {exercisesWithHistory.length === 0 ? (
          <p className="py-6 text-center text-sm text-iron">
            Log a set to see your progress.
          </p>
        ) : progress.series.length === 0 ? (
          <p className="py-6 text-center text-sm text-iron">No data for this exercise yet.</p>
        ) : (
          <>
            <PRProgressChart data={progress.series} />
            <div className="mt-3 grid grid-cols-3 gap-2">
              <StatPill
                label="Current PR"
                value={progress.currentPR != null ? `${progress.currentPR} kg` : '—'}
                accent
              />
              <StatPill
                label="First logged"
                value={progress.firstWeight != null ? `${progress.firstWeight} kg` : '—'}
              />
              <StatPill
                label="Improvement"
                value={
                  progress.improvement > 0
                    ? `+${progress.improvement} kg (${progress.improvementPct}%)`
                    : progress.improvement < 0
                    ? `${progress.improvement} kg`
                    : '—'
                }
              />
            </div>
          </>
        )}
      </ChartCard>

      {/* Frequency */}
      <ChartCard title="Workout Frequency — last 13 weeks">
        <FrequencyHeatmap cells={frequency.cells} />
      </ChartCard>
    </div>
  )
}

function ExerciseSelect({ value, onChange, exercises }) {
  return (
    <div className="relative">
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="heading min-h-[40px] appearance-none rounded-lg border border-dust/40 bg-mortar pl-3 pr-8 text-xs text-chalk outline-none focus:border-ember"
      >
        {exercises.map((ex) => (
          <option key={ex.id} value={ex.id}>
            {ex.name}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-iron"
      />
    </div>
  )
}

function FuelStats() {
  const { data: calorySeries = [], isLoading: cLoading } = useDailyCaloriesByWeek(7)
  const { data: waterSeries = [], isLoading: wLoading } = useWeekWater()

  const goals = getMacroGoals()
  const waterGoal = getWaterGoal()
  const today = todayStr()

  const daysWithFood = calorySeries.filter((d) => d.calories > 0)
  const n = daysWithFood.length
  const avgCalories = n > 0 ? Math.round(daysWithFood.reduce((s, d) => s + d.calories, 0) / n) : 0
  const avgProtein  = n > 0 ? Math.round(daysWithFood.reduce((s, d) => s + d.protein, 0) / n) : 0
  const avgCarbs    = n > 0 ? Math.round(daysWithFood.reduce((s, d) => s + d.carbs, 0) / n) : 0
  const avgFat      = n > 0 ? Math.round(daysWithFood.reduce((s, d) => s + d.fat, 0) / n) : 0

  const daysWithWater = waterSeries.filter((d) => d.glasses > 0)
  const avgWater =
    daysWithWater.length > 0
      ? +(daysWithWater.reduce((s, d) => s + d.glasses, 0) / daysWithWater.length).toFixed(1)
      : 0

  if (cLoading || wLoading) return <Loading />

  if (n === 0 && daysWithWater.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-dust/40 bg-ash/40 px-6 py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ash text-brick-red">
          <UtensilsCrossed size={26} />
        </div>
        <div>
          <h2 className="heading text-lg">No fuel data yet</h2>
          <p className="mt-1 text-sm text-sand">
            Log meals and water on the Fuel tab to see your stats here.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <ChartCard title="Calories — last 7 days">
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={calorySeries} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                interval={0}
                tick={{ fill: '#8C8078', fontSize: 10, fontFamily: 'DM Mono' }}
                tickFormatter={shortDay}
              />
              <Bar dataKey="calories" radius={[4, 4, 0, 0]}>
                {calorySeries.map((d) => (
                  <Cell key={d.date} fill={d.date === today ? '#E85D3A' : '#C8432B'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <StatPill
            label="7-day avg"
            value={avgCalories > 0 ? `${avgCalories.toLocaleString()} kcal` : '—'}
            accent
          />
          <StatPill
            label="Daily goal"
            value={goals.calories > 0 ? `${goals.calories.toLocaleString()} kcal` : '—'}
          />
        </div>
      </ChartCard>

      <ChartCard title="Avg macros / day — last 7 days">
        <div className="grid grid-cols-3 gap-2">
          <StatPill label="Protein" value={avgProtein > 0 ? `${avgProtein}g` : '—'} accent />
          <StatPill label="Carbs"   value={avgCarbs > 0 ? `${avgCarbs}g` : '—'} />
          <StatPill label="Fat"     value={avgFat > 0 ? `${avgFat}g` : '—'} />
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          <StatPill label="Goal P" value={goals.protein > 0 ? `${goals.protein}g` : '—'} />
          <StatPill label="Goal C" value={goals.carbs > 0 ? `${goals.carbs}g` : '—'} />
          <StatPill label="Goal F" value={goals.fat > 0 ? `${goals.fat}g` : '—'} />
        </div>
      </ChartCard>

      <ChartCard title="Water — last 7 days">
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={waterSeries} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                interval={0}
                tick={{ fill: '#8C8078', fontSize: 10, fontFamily: 'DM Mono' }}
                tickFormatter={shortDay}
              />
              <Bar dataKey="glasses" radius={[4, 4, 0, 0]}>
                {waterSeries.map((d) => (
                  <Cell key={d.date} fill={d.date === today ? '#E85D3A' : '#C8432B'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <StatPill
            label="7-day avg"
            value={avgWater > 0 ? `${avgWater} glasses` : '—'}
            accent
          />
          <StatPill label="Daily goal" value={`${waterGoal} glasses`} />
        </div>
      </ChartCard>
    </div>
  )
}

function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-72 animate-shimmer rounded-2xl bg-ash/60" />
      <div className="h-72 animate-shimmer rounded-2xl bg-ash/60" />
      <div className="h-56 animate-shimmer rounded-2xl bg-ash/60" />
    </div>
  )
}

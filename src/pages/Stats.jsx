import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BarChart3, ChevronDown } from 'lucide-react'
import {
  useVolumeByWeek,
  useExerciseProgress,
  useFrequencyCells,
  useAllUserSets,
} from '../lib/statsApi.js'
import { useExercises } from '../lib/gymApi.js'
import SectionTabs from '../components/charts/SectionTabs.jsx'
import ChartCard from '../components/charts/ChartCard.jsx'
import StatPill from '../components/charts/StatPill.jsx'
import VolumeChart from '../components/charts/VolumeChart.jsx'
import PRProgressChart from '../components/charts/PRProgressChart.jsx'
import FrequencyHeatmap from '../components/charts/FrequencyHeatmap.jsx'

const SECTION_OPTIONS = [
  { value: 'gym', label: 'Gym' },
  { value: 'habits', label: 'Habits' },
]

export default function Stats() {
  const [section, setSection] = useState('gym')

  return (
    <section className="flex flex-col gap-4">
      <h1 className="heading text-3xl">Stats</h1>
      <SectionTabs value={section} onChange={setSection} options={SECTION_OPTIONS} />
      {section === 'gym' ? <GymStats /> : <HabitsPlaceholder />}
    </section>
  )
}

function HabitsPlaceholder() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-dust/40 bg-ash/40 px-6 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ash text-brick-red">
        <BarChart3 size={26} />
      </div>
      <div>
        <h2 className="heading text-lg">Habit Stats</h2>
        <p className="mt-1 text-sm text-sand">Coming soon — heatmaps, streaks, and category breakdowns.</p>
      </div>
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

function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-72 animate-pulse rounded-2xl bg-ash/60" />
      <div className="h-72 animate-pulse rounded-2xl bg-ash/60" />
      <div className="h-56 animate-pulse rounded-2xl bg-ash/60" />
    </div>
  )
}

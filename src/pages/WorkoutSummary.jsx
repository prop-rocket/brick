import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Dumbbell, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useWorkoutSummary } from '../lib/gymApi.js'
import { usePreviousTemplateRun } from '../lib/statsApi.js'

function formatDuration(ms) {
  if (!ms) return '—'
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}h ${m}m ${s}s`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function VolumeDelta({ current, previous }) {
  if (previous == null || previous === 0) {
    return null
  }
  const diff = current - previous
  const pct = previous > 0 ? Math.round((diff / previous) * 100) : 0

  if (Math.abs(diff) < 0.5) {
    return (
      <span
        title="No change vs last time"
        className="inline-flex items-center gap-1 rounded-full bg-mortar/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-iron"
      >
        <Minus size={10} strokeWidth={3} />
        Same
      </span>
    )
  }

  const up = diff > 0
  return (
    <span
      title={`vs last time: ${up ? '+' : ''}${Math.round(diff)} kg (${up ? '+' : ''}${pct}%)`}
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] ${
        up ? 'bg-brick-red/15 text-brick-red' : 'bg-iron/15 text-iron'
      }`}
    >
      {up ? (
        <TrendingUp size={10} strokeWidth={2.5} />
      ) : (
        <TrendingDown size={10} strokeWidth={2.5} />
      )}
      {up ? '+' : ''}
      {Math.round(diff)} kg
    </span>
  )
}

export default function WorkoutSummary() {
  const { workoutId } = useParams()
  const navigate = useNavigate()
  const { data, isLoading, isError } = useWorkoutSummary(workoutId)
  const previousRun = usePreviousTemplateRun(
    workoutId,
    data?.workout?.template_id,
    data?.workout?.started_at,
  )

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mortar">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-dust border-t-brick-red" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-mortar px-6 text-center">
        <p className="text-sand">Could not load workout summary.</p>
        <button
          type="button"
          onClick={() => navigate('/gym')}
          className="heading min-h-tap rounded-lg bg-brick-red px-5 text-sm text-chalk"
        >
          Back to Gym
        </button>
      </div>
    )
  }

  const { workout, exercises, totalSets, totalVolume, durationMs } = data
  const templateName = workout.workout_templates?.name ?? 'Workout'
  const previousData = previousRun.data
  const hasComparison = !!previousData

  return (
    <div className="min-h-screen bg-mortar text-chalk">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-dust/30 bg-mortar/95 backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => navigate('/gym')}
            aria-label="Back to Gym"
            className="min-h-tap min-w-tap flex items-center justify-center text-iron hover:text-chalk"
          >
            <ArrowLeft size={22} />
          </button>
          <h1 className="heading text-2xl">{templateName}</h1>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-xl flex-col gap-5 px-4 py-5 pb-16">
        {/* Date */}
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-iron">
          {formatDate(workout.started_at)}
        </p>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          <StatCard label="Duration" value={formatDuration(durationMs)} />
          <StatCard label="Sets" value={totalSets} />
          <StatCard
            label="Volume"
            value={
              totalVolume > 0
                ? `${Math.round(totalVolume).toLocaleString()} kg`
                : '—'
            }
          />
        </div>

        {/* Total volume vs last time */}
        {hasComparison && (
          <div className="-mt-1 flex items-center justify-center gap-2 rounded-xl bg-ash/60 px-3 py-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-iron">
              vs last time
            </span>
            <VolumeDelta current={totalVolume} previous={previousData.totalVolume} />
          </div>
        )}

        {/* Exercise breakdown */}
        {exercises.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-dust/40 py-10 text-center">
            <Dumbbell size={32} className="text-iron" />
            <p className="text-sm text-sand">No sets were logged.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {exercises.map((ex) => {
              const exVolume = ex.sets.reduce(
                (sum, s) => sum + (s.reps ?? 0) * (s.weight_kg ?? 0),
                0,
              )
              const previousExVolume = previousData?.volumeByExercise?.[ex.id] ?? 0
              return (
              <div key={ex.id} className="overflow-hidden rounded-2xl bg-ash">
                <div className="flex items-center justify-between gap-3 border-b border-dust/30 px-4 py-3">
                  <div className="min-w-0">
                    <p className="heading truncate text-lg text-chalk">{ex.name}</p>
                    <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-iron">
                      {ex.muscle_group}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="font-mono text-xs text-sand">
                      {ex.sets.length} set{ex.sets.length !== 1 ? 's' : ''}
                    </span>
                    {hasComparison && previousExVolume > 0 && (
                      <VolumeDelta current={exVolume} previous={previousExVolume} />
                    )}
                  </div>
                </div>

                {ex.sets.length === 0 ? (
                  <p className="px-4 py-3 font-mono text-xs text-iron">
                    No sets logged
                  </p>
                ) : (
                  <div className="divide-y divide-dust/20">
                    {ex.sets.map((s) => (
                      <div key={s.id} className="flex items-center gap-4 px-4 py-2">
                        <span className="w-8 font-mono text-xs text-iron">
                          {s.set_number}
                        </span>
                        <span className="flex-1 font-mono text-sm text-chalk">
                          {s.reps} reps
                        </span>
                        <span className="font-mono text-sm text-chalk">
                          {s.weight_kg} kg
                        </span>
                        {s.weight_kg > 0 && (
                          <span className="font-mono text-xs text-sand">
                            {Math.round(s.reps * s.weight_kg).toLocaleString()} kg vol
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              )
            })}
          </div>
        )}

        <button
          type="button"
          onClick={() => navigate('/gym')}
          className="heading min-h-tap w-full rounded-xl bg-brick-red text-base text-chalk hover:bg-ember"
        >
          Done
        </button>
      </div>
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="flex flex-col items-center rounded-xl bg-ash px-3 py-4 text-center">
      <span className="font-mono text-xl text-chalk">{value}</span>
      <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-iron">
        {label}
      </span>
    </div>
  )
}

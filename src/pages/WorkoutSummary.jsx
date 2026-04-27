import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Dumbbell } from 'lucide-react'
import { useWorkoutSummary } from '../lib/gymApi.js'

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

export default function WorkoutSummary() {
  const { workoutId } = useParams()
  const navigate = useNavigate()
  const { data, isLoading, isError } = useWorkoutSummary(workoutId)

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

        {/* Exercise breakdown */}
        {exercises.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-dust/40 py-10 text-center">
            <Dumbbell size={32} className="text-iron" />
            <p className="text-sm text-sand">No sets were logged.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {exercises.map((ex) => (
              <div key={ex.id} className="overflow-hidden rounded-2xl bg-ash">
                <div className="flex items-center justify-between border-b border-dust/30 px-4 py-3">
                  <div>
                    <p className="heading text-lg text-chalk">{ex.name}</p>
                    <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-iron">
                      {ex.muscle_group}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-sand">
                    {ex.sets.length} set{ex.sets.length !== 1 ? 's' : ''}
                  </span>
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
            ))}
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

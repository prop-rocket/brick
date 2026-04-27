import { ChevronRight } from 'lucide-react'

function formatDuration(ms) {
  if (!ms) return '—'
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export default function WorkoutHistoryCard({ workout, onClick }) {
  const durationMs =
    workout.ended_at && workout.started_at
      ? new Date(workout.ended_at) - new Date(workout.started_at)
      : 0

  return (
    <button
      type="button"
      onClick={() => onClick?.(workout)}
      className="flex w-full items-center gap-3 rounded-xl bg-ash px-4 py-3 text-left hover:bg-dust/30"
    >
      <div className="flex-1 min-w-0">
        <p className="heading truncate text-base text-chalk">
          {workout.workout_templates?.name ?? 'Workout'}
        </p>
        <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.14em] text-iron">
          {formatDate(workout.started_at)}
        </p>
        <div className="mt-1 flex gap-4 font-mono text-[11px] text-sand">
          <span>{workout.exerciseCount} exercises</span>
          <span>{workout.totalSets} sets</span>
          {workout.totalVolume > 0 && (
            <span>{Math.round(workout.totalVolume).toLocaleString()} kg vol</span>
          )}
          <span>{formatDuration(durationMs)}</span>
        </div>
      </div>
      <ChevronRight size={18} className="shrink-0 text-iron" />
    </button>
  )
}

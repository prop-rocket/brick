import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Trophy, ChevronRight } from 'lucide-react'
import { usePersonalRecords, useAllUserSets } from '../lib/statsApi.js'
import { useExercises } from '../lib/gymApi.js'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function PersonalRecords() {
  const navigate = useNavigate()
  const { data: exercises = [] } = useExercises()
  const setsQuery = useAllUserSets()
  const { records } = usePersonalRecords(exercises)

  const isLoading = setsQuery.isLoading

  return (
    <div className="min-h-screen bg-mortar text-chalk">
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
          <h1 className="heading text-2xl">Personal Records</h1>
        </div>
      </header>

      <div className="mx-auto w-full max-w-xl px-4 py-5 pb-16">
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-ash/60" />
            ))}
          </div>
        ) : records.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="flex flex-col gap-2">
            {records.map((r) => (
              <li key={r.exerciseId}>
                <button
                  type="button"
                  onClick={() => navigate(`/stats?exerciseId=${r.exerciseId}`)}
                  className="flex w-full items-center gap-3 rounded-xl bg-ash px-4 py-3 text-left hover:bg-dust/30"
                >
                  <Trophy
                    size={20}
                    className="shrink-0 text-brick-red"
                    fill="currentColor"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="heading truncate text-base text-chalk">
                      {r.exercise.name}
                    </p>
                    <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-iron">
                      {r.exercise.muscle_group} · {formatDate(r.achievedAt)}
                    </p>
                  </div>
                  <span className="font-mono text-lg text-ember">{r.weightKg} kg</span>
                  <ChevronRight size={18} className="shrink-0 text-iron" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-dust/40 bg-ash/40 px-6 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ash text-brick-red">
        <Trophy size={26} fill="currentColor" />
      </div>
      <div>
        <h2 className="heading text-lg">No records yet</h2>
        <p className="mt-1 text-sm text-sand">
          Log your first set with a weight to start setting PRs.
        </p>
      </div>
    </div>
  )
}

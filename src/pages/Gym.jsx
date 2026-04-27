import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Dumbbell, Trophy } from 'lucide-react'
import {
  useWorkoutTemplates,
  useStartWorkout,
  useDeleteTemplate,
  useWorkoutHistory,
} from '../lib/gymApi.js'
import TemplateCard from '../components/TemplateCard.jsx'
import WorkoutHistoryCard from '../components/WorkoutHistoryCard.jsx'
import TemplateBuilderSheet from '../components/TemplateBuilderSheet.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'

export default function Gym() {
  const navigate = useNavigate()
  const { data: templates = [], isLoading: tLoading } = useWorkoutTemplates()
  const { data: history = [], isLoading: hLoading } = useWorkoutHistory()
  const startWorkout = useStartWorkout()
  const deleteTemplate = useDeleteTemplate()

  const [builderOpen, setBuilderOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [startingId, setStartingId] = useState(null)

  const presets = templates.filter((t) => t.is_preset)
  const mine = templates.filter((t) => !t.is_preset)

  const handleStart = async (template) => {
    if (startingId) return
    setStartingId(template.id)
    try {
      const workout = await startWorkout.mutateAsync(template.id)
      navigate(`/gym/log/${workout.id}`)
    } catch (e) {
      console.error('Failed to start workout', e)
      setStartingId(null)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!pendingDelete) return
    const id = pendingDelete.id
    setPendingDelete(null)
    await deleteTemplate.mutateAsync(id)
  }

  return (
    <section className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <h1 className="heading text-3xl">Gym</h1>
        <button
          type="button"
          onClick={() => navigate('/gym/prs')}
          className="heading min-h-tap inline-flex items-center gap-1.5 rounded-full bg-ash px-3 text-sm text-iron hover:bg-dust/40 hover:text-chalk"
        >
          <Trophy size={16} fill="currentColor" className="text-brick-red" />
          <span>PRs</span>
        </button>
      </header>

      {/* Presets */}
      <div className="flex flex-col gap-2">
        <SectionHeader label="Presets" />
        {tLoading ? (
          <LoadingSkeletons />
        ) : (
          <div className="flex flex-col gap-3">
            {presets.map((t) => (
              <TemplateCard
                key={t.id}
                template={t}
                onStart={handleStart}
                starting={startingId === t.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* My Templates */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <SectionHeader label="My Templates" />
          <button
            type="button"
            onClick={() => setBuilderOpen(true)}
            className="heading min-h-[36px] inline-flex items-center gap-1 rounded-full bg-ash px-3 text-xs text-iron hover:text-chalk"
          >
            <Plus size={14} strokeWidth={2.5} />
            Create
          </button>
        </div>
        {!tLoading && mine.length === 0 ? (
          <button
            type="button"
            onClick={() => setBuilderOpen(true)}
            className="flex min-h-[64px] items-center justify-center rounded-xl border border-dashed border-dust/40 text-sm text-iron hover:border-iron hover:text-sand"
          >
            <span className="heading">+ Create your first template</span>
          </button>
        ) : (
          <div className="flex flex-col gap-3">
            {mine.map((t) => (
              <TemplateCard
                key={t.id}
                template={t}
                onStart={handleStart}
                onDelete={setPendingDelete}
                starting={startingId === t.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* History */}
      {(history.length > 0 || hLoading) && (
        <div className="flex flex-col gap-2">
          <SectionHeader label="Recent Workouts" />
          {hLoading ? (
            <LoadingSkeletons count={3} />
          ) : (
            <div className="flex flex-col gap-2">
              {history.map((w) => (
                <WorkoutHistoryCard
                  key={w.id}
                  workout={w}
                  onClick={(workout) => navigate(`/gym/summary/${workout.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {history.length === 0 && !hLoading && (
        <EmptyHistory />
      )}

      <TemplateBuilderSheet
        open={builderOpen}
        onClose={() => setBuilderOpen(false)}
      />

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete template?"
        message={pendingDelete ? `"${pendingDelete.name}" will be removed.` : null}
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setPendingDelete(null)}
      />
    </section>
  )
}

function SectionHeader({ label }) {
  return (
    <div className="flex items-center gap-3">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-iron">{label}</p>
      <div className="flex-1 border-t border-dust/30" />
    </div>
  )
}

function LoadingSkeletons({ count = 4 }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-28 animate-pulse rounded-2xl bg-ash/60" />
      ))}
    </div>
  )
}

function EmptyHistory() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-dust/40 bg-ash/40 px-6 py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ash text-brick-red">
        <Dumbbell size={26} />
      </div>
      <div>
        <h2 className="heading text-lg">No workouts yet</h2>
        <p className="mt-1 text-sm text-sand">Start a template above to log your first session.</p>
      </div>
    </div>
  )
}

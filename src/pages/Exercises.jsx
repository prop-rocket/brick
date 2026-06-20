import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Search, X, Pencil, Trash2, Dumbbell } from 'lucide-react'
import { useExercises, useDeleteExercise } from '../lib/gymApi.js'
import { useToast } from '../context/ToastContext.jsx'
import { GROUPS, GROUP_FILTERS } from '../lib/muscleGroups.js'
import ExerciseFormSheet from '../components/ExerciseFormSheet.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'

export default function Exercises() {
  const navigate = useNavigate()
  const { data: exercises = [], isLoading } = useExercises()
  const deleteExercise = useDeleteExercise()
  const { showError } = useToast()

  const [search, setSearch] = useState('')
  const [groupFilter, setGroupFilter] = useState('All')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)

  const grouped = useMemo(() => {
    const q = search.toLowerCase().trim()
    const out = {}
    for (const ex of exercises) {
      if (ex.archived) continue
      if (q && !ex.name.toLowerCase().includes(q)) continue
      const g = ex.muscle_group ?? 'Custom'
      if (groupFilter !== 'All' && g !== groupFilter) continue
      if (!out[g]) out[g] = []
      out[g].push(ex)
    }
    return out
  }, [exercises, search, groupFilter])

  const hasResults = Object.keys(grouped).length > 0

  const openNew = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (ex) => {
    setEditing(ex)
    setFormOpen(true)
  }

  const handleDelete = async () => {
    if (!pendingDelete) return
    const id = pendingDelete.id
    setPendingDelete(null)
    try {
      await deleteExercise.mutateAsync(id)
    } catch (e) {
      console.error('Failed to delete exercise', e)
      showError('Could not delete exercise. Try again.')
    }
  }

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
          <h1 className="heading text-2xl flex-1">Exercises</h1>
          <button
            type="button"
            onClick={openNew}
            className="heading min-h-[36px] inline-flex items-center gap-1 rounded-full bg-brick-red px-3 text-sm text-chalk hover:bg-ember"
          >
            <Plus size={16} strokeWidth={2.5} />
            New
          </button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-xl flex flex-col gap-3 px-4 py-5 pb-16">
        {/* Search */}
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-iron"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exercises…"
            className="min-h-tap w-full rounded-lg border border-dust/40 bg-ash py-2 pl-9 pr-9 text-chalk placeholder-iron outline-none focus:border-brick-red"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-iron"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Muscle-group dropdown */}
        <select
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
          className="min-h-tap rounded-lg border border-dust/40 bg-ash px-3 text-chalk outline-none focus:border-brick-red"
        >
          {GROUP_FILTERS.map((g) => (
            <option key={g} value={g}>
              {g === 'All' ? 'All muscle groups' : g}
            </option>
          ))}
        </select>

        {/* List */}
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-12 animate-shimmer rounded-xl bg-ash/60" />
            ))}
          </div>
        ) : !hasResults ? (
          <EmptyState onCreate={openNew} />
        ) : (
          <div className="flex flex-col gap-4">
            {GROUPS.map((group) => {
              const items = grouped[group]
              if (!items?.length) return null
              return (
                <div key={group} className="flex flex-col gap-1.5">
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-iron">
                    {group}
                  </p>
                  <ul className="flex flex-col gap-1.5">
                    {items.map((ex) => (
                      <li
                        key={ex.id}
                        className="flex min-h-[48px] items-center gap-3 rounded-xl bg-ash px-4 py-2"
                      >
                        <span className="flex-1 text-sm text-chalk">{ex.name}</span>
                        {ex.is_custom ? (
                          <>
                            <button
                              type="button"
                              onClick={() => openEdit(ex)}
                              aria-label={`Edit ${ex.name}`}
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-iron hover:text-chalk"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setPendingDelete(ex)}
                              aria-label={`Delete ${ex.name}`}
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-iron hover:text-brick-red"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        ) : (
                          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-iron/70">
                            Preset
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <ExerciseFormSheet
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initial={editing}
      />

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete exercise?"
        message={
          pendingDelete
            ? `"${pendingDelete.name}" will be removed from your library. Past workouts that used it are kept.`
            : null
        }
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}

function EmptyState({ onCreate }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-dust/40 bg-ash/40 px-6 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ash text-brick-red">
        <Dumbbell size={26} />
      </div>
      <div>
        <h2 className="heading text-lg">No exercises found</h2>
        <p className="mt-1 text-sm text-sand">Try a different search, or create your own.</p>
      </div>
      <button
        type="button"
        onClick={onCreate}
        className="heading min-h-tap inline-flex items-center gap-1.5 rounded-lg bg-brick-red px-4 text-sm text-chalk hover:bg-ember"
      >
        <Plus size={16} strokeWidth={2.5} />
        New Exercise
      </button>
    </div>
  )
}

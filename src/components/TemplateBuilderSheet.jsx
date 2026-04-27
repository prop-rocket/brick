import { useState, useMemo } from 'react'
import { Search, X, ChevronUp, ChevronDown, Plus } from 'lucide-react'
import BottomSheet from './BottomSheet.jsx'
import { useExercises, useCreateCustomExercise, useCreateTemplate } from '../lib/gymApi.js'

const GROUPS = ['Push', 'Pull', 'Legs', 'Core', 'Cardio', 'Custom']

export default function TemplateBuilderSheet({ open, onClose }) {
  const [name, setName] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState([]) // exercise objects in order
  const [error, setError] = useState(null)

  const { data: exercises = [] } = useExercises()
  const createCustom = useCreateCustomExercise()
  const createTemplate = useCreateTemplate()

  const selectedIds = useMemo(() => new Set(selected.map((e) => e.id)), [selected])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return exercises
    return exercises.filter((e) => e.name.toLowerCase().includes(q))
  }, [exercises, search])

  const groupedFiltered = useMemo(() => {
    const out = {}
    for (const ex of filtered) {
      const g = ex.muscle_group ?? 'Custom'
      if (!out[g]) out[g] = []
      out[g].push(ex)
    }
    return out
  }, [filtered])

  const noResults = filtered.length === 0 && search.trim().length > 0

  const addExercise = (ex) => {
    if (!selectedIds.has(ex.id)) setSelected((s) => [...s, ex])
    setSearch('')
  }

  const removeExercise = (id) => setSelected((s) => s.filter((e) => e.id !== id))

  const moveUp = (i) => {
    if (i === 0) return
    setSelected((s) => {
      const next = [...s]
      ;[next[i - 1], next[i]] = [next[i], next[i - 1]]
      return next
    })
  }

  const moveDown = (i) => {
    setSelected((s) => {
      if (i >= s.length - 1) return s
      const next = [...s]
      ;[next[i], next[i + 1]] = [next[i + 1], next[i]]
      return next
    })
  }

  const handleAddCustom = async () => {
    const trimmed = search.trim()
    if (!trimmed) return
    try {
      const ex = await createCustom.mutateAsync({ name: trimmed })
      addExercise(ex)
    } catch (e) {
      setError(e?.message ?? 'Could not create exercise')
    }
  }

  const handleSave = async () => {
    setError(null)
    if (!name.trim()) { setError('Template name is required'); return }
    if (selected.length === 0) { setError('Add at least one exercise'); return }
    try {
      await createTemplate.mutateAsync({ name, exercises: selected })
      setName('')
      setSearch('')
      setSelected([])
      onClose?.()
    } catch (e) {
      setError(e?.message ?? 'Could not save template')
    }
  }

  const submitting = createTemplate.isPending || createCustom.isPending

  return (
    <BottomSheet open={open} onClose={onClose} title="New Template">
      <div className="flex flex-col gap-4">
        {/* Template name */}
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-iron">
            Template name
          </span>
          <input
            type="text"
            maxLength={64}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Push Day"
            className="min-h-tap rounded-lg border border-dust/40 bg-mortar px-3 text-chalk placeholder-iron outline-none focus:border-brick-red"
          />
        </label>

        {/* Selected exercises list */}
        {selected.length > 0 && (
          <div>
            <p className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-iron">
              Exercises ({selected.length})
            </p>
            <ul className="flex flex-col gap-1">
              {selected.map((ex, i) => (
                <li
                  key={ex.id}
                  className="flex items-center gap-2 rounded-lg border border-dust/30 bg-mortar px-3 py-2"
                >
                  <span className="flex-1 font-mono text-sm text-chalk">{ex.name}</span>
                  <button
                    type="button"
                    onClick={() => moveUp(i)}
                    disabled={i === 0}
                    className="min-h-[32px] min-w-[32px] flex items-center justify-center text-iron disabled:opacity-30"
                    aria-label="Move up"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDown(i)}
                    disabled={i === selected.length - 1}
                    className="min-h-[32px] min-w-[32px] flex items-center justify-center text-iron disabled:opacity-30"
                    aria-label="Move down"
                  >
                    <ChevronDown size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeExercise(ex.id)}
                    className="min-h-[32px] min-w-[32px] flex items-center justify-center text-iron hover:text-brick-red"
                    aria-label={`Remove ${ex.name}`}
                  >
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Exercise search */}
        <div>
          <p className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-iron">
            Add exercises
          </p>
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
              className="min-h-tap w-full rounded-lg border border-dust/40 bg-mortar py-2 pl-9 pr-3 text-chalk placeholder-iron outline-none focus:border-brick-red"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-iron"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Results */}
          <div className="mt-2 max-h-56 overflow-y-auto rounded-lg border border-dust/30">
            {noResults ? (
              <button
                type="button"
                onClick={handleAddCustom}
                disabled={createCustom.isPending}
                className="heading flex min-h-[48px] w-full items-center gap-2 px-4 text-sm text-ember hover:bg-dust/20"
              >
                <Plus size={16} strokeWidth={2.5} />
                Add "{search.trim()}" as custom exercise
              </button>
            ) : (
              GROUPS.map((group) => {
                const items = groupedFiltered[group]
                if (!items?.length) return null
                return (
                  <div key={group}>
                    <p className="sticky top-0 bg-ash px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-iron">
                      {group}
                    </p>
                    {items.map((ex) => {
                      const already = selectedIds.has(ex.id)
                      return (
                        <button
                          key={ex.id}
                          type="button"
                          onClick={() => addExercise(ex)}
                          disabled={already}
                          className={`flex min-h-[44px] w-full items-center justify-between px-4 text-left text-sm hover:bg-dust/20 ${
                            already ? 'opacity-40' : ''
                          }`}
                        >
                          <span className="text-chalk">{ex.name}</span>
                          {already && (
                            <span className="font-mono text-[10px] uppercase text-iron">
                              Added
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )
              })
            )}
          </div>
        </div>

        {error && (
          <p className="rounded-md border border-brick-red/40 bg-brick-red/10 px-3 py-2 text-sm text-brick-red">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="heading min-h-tap flex-1 rounded-lg border border-dust/50 bg-transparent px-4 text-base text-chalk hover:bg-dust/30"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={submitting}
            className="heading min-h-tap flex-[1.5] rounded-lg bg-brick-red px-4 text-base text-chalk hover:bg-ember disabled:opacity-60"
          >
            {submitting ? 'Saving…' : 'Save Template'}
          </button>
        </div>
      </div>
    </BottomSheet>
  )
}

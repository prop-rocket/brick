import { useMemo, useState } from 'react'
import { Search, X, Plus } from 'lucide-react'
import BottomSheet from './BottomSheet.jsx'
import ExerciseFormSheet from './ExerciseFormSheet.jsx'
import { useExercises } from '../lib/gymApi.js'
import { GROUPS, GROUP_FILTERS } from '../lib/muscleGroups.js'

// Searchable, group-filterable exercise picker. Calls onPick(exercise) when the
// user taps an exercise. Hides archived exercises and any ids in excludeIds.
// Includes an inline "Create custom exercise" flow that auto-picks the result.
export default function ExercisePickerSheet({ open, onClose, onPick, excludeIds }) {
  const { data: exercises = [] } = useExercises()
  const [search, setSearch] = useState('')
  const [groupFilter, setGroupFilter] = useState('All')
  const [formOpen, setFormOpen] = useState(false)

  const exclude = excludeIds instanceof Set ? excludeIds : new Set(excludeIds ?? [])

  const grouped = useMemo(() => {
    const q = search.toLowerCase().trim()
    const out = {}
    for (const ex of exercises) {
      if (ex.archived) continue
      if (exclude.has(ex.id)) continue
      if (q && !ex.name.toLowerCase().includes(q)) continue
      const g = ex.muscle_group ?? 'Custom'
      if (groupFilter !== 'All' && g !== groupFilter) continue
      if (!out[g]) out[g] = []
      out[g].push(ex)
    }
    return out
  }, [exercises, search, groupFilter, exclude])

  const hasResults = Object.keys(grouped).length > 0

  const handlePick = (ex) => {
    onPick?.(ex)
  }

  return (
    <>
      <BottomSheet open={open} onClose={onClose} title="Add Exercise">
        <div className="flex flex-col gap-3">
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
              className="min-h-tap w-full rounded-lg border border-dust/40 bg-mortar py-2 pl-9 pr-9 text-chalk placeholder-iron outline-none focus:border-brick-red"
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
            className="min-h-tap rounded-lg border border-dust/40 bg-mortar px-3 text-chalk outline-none focus:border-brick-red"
          >
            {GROUP_FILTERS.map((g) => (
              <option key={g} value={g}>
                {g === 'All' ? 'All muscle groups' : g}
              </option>
            ))}
          </select>

          {/* Grouped list */}
          <div className="max-h-[50vh] overflow-y-auto rounded-xl border border-dust/30 bg-mortar">
            {GROUPS.map((group) => {
              const items = grouped[group]
              if (!items?.length) return null
              return (
                <div key={group}>
                  <p className="sticky top-0 z-10 border-b border-dust/20 bg-ash px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-iron">
                    {group}
                  </p>
                  {items.map((ex) => (
                    <button
                      key={ex.id}
                      type="button"
                      onClick={() => handlePick(ex)}
                      className="flex min-h-[44px] w-full items-center justify-between px-4 text-left text-sm text-chalk transition-colors hover:bg-dust/20"
                    >
                      <span>{ex.name}</span>
                      <Plus size={16} strokeWidth={2.5} className="shrink-0 text-iron" />
                    </button>
                  ))}
                </div>
              )
            })}

            {!hasResults && (
              <div className="px-4 py-6 text-center">
                <p className="font-mono text-sm text-iron">No exercises found</p>
                <p className="mt-1 font-mono text-[11px] text-sand">
                  Create it as a custom exercise below
                </p>
              </div>
            )}
          </div>

          {/* Create custom */}
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="heading min-h-tap flex items-center justify-center gap-2 rounded-lg bg-ash px-4 text-sm text-chalk hover:bg-dust/40"
          >
            <Plus size={16} strokeWidth={2.5} />
            Create custom exercise
          </button>
        </div>
      </BottomSheet>

      <ExerciseFormSheet
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={(ex) => {
          setFormOpen(false)
          if (ex) handlePick(ex)
        }}
      />
    </>
  )
}

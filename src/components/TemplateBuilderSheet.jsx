import { useState, useMemo, useRef } from 'react'
import { Search, X, ChevronUp, ChevronDown, Plus, Check } from 'lucide-react'
import BottomSheet from './BottomSheet.jsx'
import { useExercises, useCreateCustomExercise, useCreateTemplate } from '../lib/gymApi.js'
import { GROUPS, GROUP_FILTERS, MUSCLE_GROUPS } from '../lib/muscleGroups.js'

export default function TemplateBuilderSheet({ open, onClose }) {
  const [name, setName] = useState('')
  const [search, setSearch] = useState('')
  const [groupFilter, setGroupFilter] = useState('All')
  const [selected, setSelected] = useState([])
  const [customName, setCustomName] = useState('')
  const [customGroup, setCustomGroup] = useState(MUSCLE_GROUPS[0])
  const [error, setError] = useState(null)
  const customInputRef = useRef(null)

  const { data: exercises = [] } = useExercises()
  const createCustom = useCreateCustomExercise()
  const createTemplate = useCreateTemplate()

  const selectedIds = useMemo(() => new Set(selected.map((e) => e.id)), [selected])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return exercises.filter((e) => {
      if (e.archived) return false
      if (q && !e.name.toLowerCase().includes(q)) return false
      if (groupFilter !== 'All' && (e.muscle_group ?? 'Custom') !== groupFilter) return false
      return true
    })
  }, [exercises, search, groupFilter])

  const grouped = useMemo(() => {
    const out = {}
    for (const ex of filtered) {
      const g = ex.muscle_group ?? 'Custom'
      if (!out[g]) out[g] = []
      out[g].push(ex)
    }
    return out
  }, [filtered])

  const toggleExercise = (ex) => {
    if (selectedIds.has(ex.id)) {
      setSelected((s) => s.filter((e) => e.id !== ex.id))
    } else {
      setSelected((s) => [...s, ex])
    }
  }

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
    const trimmed = customName.trim()
    if (!trimmed) return
    try {
      const ex = await createCustom.mutateAsync({ name: trimmed, muscle_group: customGroup })
      setSelected((s) => [...s, ex])
      setCustomName('')
      customInputRef.current?.focus()
    } catch (e) {
      setError(e?.message ?? 'Could not create exercise')
    }
  }

  const handleSave = async () => {
    setError(null)
    if (!name.trim()) { setError('Template name is required'); return }
    if (selected.length === 0) { setError('Add at least one exercise'); return }
    try {
      await createTemplate.mutateAsync({ name: name.trim(), exercises: selected })
      setName('')
      setSearch('')
      setGroupFilter('All')
      setSelected([])
      setCustomName('')
      onClose?.()
    } catch (e) {
      setError(e?.message ?? 'Could not save template')
    }
  }

  const handleClose = () => {
    setName('')
    setSearch('')
    setGroupFilter('All')
    setSelected([])
    setCustomName('')
    setError(null)
    onClose?.()
  }

  const submitting = createTemplate.isPending || createCustom.isPending

  const footerButtons = (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={handleClose}
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
  )

  return (
    <BottomSheet open={open} onClose={handleClose} title="New Template" footer={footerButtons}>
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

        {/* Exercise browser */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-iron">
              Exercises
            </span>
            {selected.length > 0 && (
              <span className="font-mono text-[11px] text-brick-red">
                {selected.length} selected
              </span>
            )}
          </div>

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

          {/* Muscle-group dropdown filter */}
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="min-h-tap rounded-lg border border-dust/40 bg-mortar px-3 text-sm text-chalk outline-none focus:border-brick-red"
          >
            {GROUP_FILTERS.map((g) => (
              <option key={g} value={g}>
                {g === 'All' ? 'All muscle groups' : g}
              </option>
            ))}
          </select>

          {/* Full exercise list grouped by muscle */}
          <div className="max-h-64 overflow-y-auto rounded-xl border border-dust/30 bg-mortar">
            {GROUPS.map((group) => {
              const items = grouped[group]
              if (!items?.length) return null
              return (
                <div key={group}>
                  <p className="sticky top-0 z-10 bg-ash px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-iron border-b border-dust/20">
                    {group}
                  </p>
                  {items.map((ex) => {
                    const isSelected = selectedIds.has(ex.id)
                    return (
                      <button
                        key={ex.id}
                        type="button"
                        onClick={() => toggleExercise(ex)}
                        className={`flex min-h-[44px] w-full items-center justify-between px-4 text-left text-sm transition-colors hover:bg-dust/20 ${
                          isSelected ? 'bg-brick-red/10' : ''
                        }`}
                      >
                        <span className="text-chalk">{ex.name}</span>
                        <div
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
                            isSelected
                              ? 'border-brick-red bg-brick-red text-chalk'
                              : 'border-dust/50 text-transparent'
                          }`}
                        >
                          <Check size={13} strokeWidth={2.5} />
                        </div>
                      </button>
                    )
                  })}
                </div>
              )
            })}

            {filtered.length === 0 && (
              <div className="px-4 py-6 text-center">
                <p className="font-mono text-sm text-iron">No exercises match "{search}"</p>
                <p className="mt-1 font-mono text-[11px] text-sand">Create it as a custom exercise below</p>
              </div>
            )}
          </div>

          {/* Custom exercise quick-add */}
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                ref={customInputRef}
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
                placeholder="New custom exercise…"
                className="min-h-[44px] flex-1 rounded-lg border border-dust/40 bg-mortar px-3 text-sm text-chalk placeholder-iron outline-none focus:border-brick-red"
              />
              <button
                type="button"
                onClick={handleAddCustom}
                disabled={!customName.trim() || createCustom.isPending}
                aria-label="Add custom exercise"
                className="heading flex min-h-[44px] items-center gap-1.5 rounded-lg bg-ash px-3 text-sm text-chalk hover:bg-dust/40 disabled:opacity-40"
              >
                <Plus size={16} strokeWidth={2.5} />
                Add
              </button>
            </div>
            <select
              value={customGroup}
              onChange={(e) => setCustomGroup(e.target.value)}
              aria-label="Custom exercise muscle group"
              className="min-h-[40px] rounded-lg border border-dust/40 bg-mortar px-3 text-sm text-chalk outline-none focus:border-brick-red"
            >
              {MUSCLE_GROUPS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected exercises ordered list */}
        {selected.length > 0 && (
          <div>
            <p className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-iron">
              Order ({selected.length})
            </p>
            <ul className="flex flex-col gap-1">
              {selected.map((ex, i) => (
                <li
                  key={ex.id}
                  className="flex items-center gap-2 rounded-lg border border-dust/30 bg-mortar px-3 py-2"
                >
                  <span className="font-mono text-[11px] text-iron w-5 text-right shrink-0">
                    {i + 1}
                  </span>
                  <span className="flex-1 font-mono text-sm text-chalk">{ex.name}</span>
                  <button
                    type="button"
                    onClick={() => moveUp(i)}
                    disabled={i === 0}
                    className="flex h-8 w-8 items-center justify-center text-iron disabled:opacity-30"
                    aria-label="Move up"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDown(i)}
                    disabled={i === selected.length - 1}
                    className="flex h-8 w-8 items-center justify-center text-iron disabled:opacity-30"
                    aria-label="Move down"
                  >
                    <ChevronDown size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleExercise(ex)}
                    className="flex h-8 w-8 items-center justify-center text-iron hover:text-brick-red"
                    aria-label={`Remove ${ex.name}`}
                  >
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && (
          <p className="rounded-md border border-brick-red/40 bg-brick-red/10 px-3 py-2 text-sm text-brick-red">
            {error}
          </p>
        )}

      </div>
    </BottomSheet>
  )
}

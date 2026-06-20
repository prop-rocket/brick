import { useEffect, useState } from 'react'
import BottomSheet from './BottomSheet.jsx'
import { useCreateCustomExercise, useUpdateExercise } from '../lib/gymApi.js'
import { useToast } from '../context/ToastContext.jsx'
import { MUSCLE_GROUPS } from '../lib/muscleGroups.js'

// Create / edit a custom exercise (name + muscle group).
// Props:
//   open, onClose
//   initial   — existing exercise to edit, or null/undefined to create
//   onSaved   — optional callback(exercise) after a successful save
export default function ExerciseFormSheet({ open, onClose, initial = null, onSaved }) {
  const [name, setName] = useState('')
  const [group, setGroup] = useState(MUSCLE_GROUPS[0])
  const [error, setError] = useState(null)
  const create = useCreateCustomExercise()
  const update = useUpdateExercise()
  const { showError } = useToast()

  const isEdit = !!initial

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? '')
      setGroup(MUSCLE_GROUPS.includes(initial?.muscle_group) ? initial.muscle_group : MUSCLE_GROUPS[0])
      setError(null)
    }
  }, [open, initial])

  const handleSave = async () => {
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Exercise name is required')
      return
    }
    setError(null)
    try {
      let saved
      if (isEdit) {
        saved = await update.mutateAsync({ id: initial.id, name: trimmed, muscle_group: group })
      } else {
        saved = await create.mutateAsync({ name: trimmed, muscle_group: group })
      }
      onSaved?.(saved)
      onClose?.()
    } catch (e) {
      console.error('Failed to save exercise', e)
      showError(isEdit ? 'Could not update exercise. Try again.' : 'Could not create exercise. Try again.')
    }
  }

  const submitting = create.isPending || update.isPending

  const footer = (
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
        disabled={submitting || !name.trim()}
        className="heading min-h-tap flex-[1.5] rounded-lg bg-brick-red px-4 text-base text-chalk hover:bg-ember disabled:opacity-60"
      >
        {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Exercise'}
      </button>
    </div>
  )

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Exercise' : 'New Exercise'}
      footer={footer}
    >
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-iron">
            Exercise name
          </span>
          <input
            type="text"
            maxLength={64}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder="e.g. Cable Crossover"
            autoFocus
            className="min-h-tap rounded-lg border border-dust/40 bg-mortar px-3 text-chalk placeholder-iron outline-none focus:border-brick-red"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-iron">
            Muscle group
          </span>
          <select
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            className="min-h-tap rounded-lg border border-dust/40 bg-mortar px-3 text-chalk outline-none focus:border-brick-red"
          >
            {MUSCLE_GROUPS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>

        {error && (
          <p className="rounded-md border border-brick-red/40 bg-brick-red/10 px-3 py-2 text-sm text-brick-red">
            {error}
          </p>
        )}
      </div>
    </BottomSheet>
  )
}

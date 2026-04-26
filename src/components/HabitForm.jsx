import { useEffect, useState } from 'react'
import ColorSwatchPicker, { HABIT_COLORS } from './ColorSwatchPicker.jsx'
import { HABIT_CATEGORIES } from './CategoryPills.jsx'

const DEFAULTS = {
  name: '',
  category: '',
  color: HABIT_COLORS[0].value,
  frequency_type: 'daily',
  weekly_goal: 5,
}

export default function HabitForm({ initial, onSubmit, onCancel, submitting, submitLabel }) {
  const [form, setForm] = useState(() => ({ ...DEFAULTS, ...(initial ?? {}) }))
  const [error, setError] = useState(null)

  useEffect(() => {
    setForm({ ...DEFAULTS, ...(initial ?? {}) })
  }, [initial])

  const update = (patch) => setForm((f) => ({ ...f, ...patch }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!form.name.trim()) {
      setError('Name is required')
      return
    }
    if (form.frequency_type === 'weekly') {
      const g = Number(form.weekly_goal)
      if (!Number.isFinite(g) || g < 1 || g > 7) {
        setError('Weekly goal must be between 1 and 7')
        return
      }
      form.weekly_goal = g
    }
    try {
      await onSubmit(form)
    } catch (err) {
      setError(err?.message ?? 'Something went wrong')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Field label="Name">
        <input
          type="text"
          autoFocus
          required
          maxLength={64}
          value={form.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="Morning run"
          className="min-h-tap w-full rounded-lg border border-dust/40 bg-mortar px-3 text-chalk placeholder-iron outline-none focus:border-brick-red"
        />
      </Field>

      <Field label="Category">
        <input
          type="text"
          list="habit-category-suggestions"
          maxLength={32}
          value={form.category}
          onChange={(e) => update({ category: e.target.value })}
          placeholder="Health"
          className="min-h-tap w-full rounded-lg border border-dust/40 bg-mortar px-3 text-chalk placeholder-iron outline-none focus:border-brick-red"
        />
        <datalist id="habit-category-suggestions">
          {HABIT_CATEGORIES.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </Field>

      <Field label="Color">
        <ColorSwatchPicker
          value={form.color}
          onChange={(color) => update({ color })}
        />
      </Field>

      <Field label="Frequency">
        <div className="flex gap-2">
          <FrequencyToggle
            active={form.frequency_type === 'daily'}
            onClick={() => update({ frequency_type: 'daily' })}
            label="Daily"
          />
          <FrequencyToggle
            active={form.frequency_type === 'weekly'}
            onClick={() => update({ frequency_type: 'weekly' })}
            label="Weekly"
          />
        </div>
        {form.frequency_type === 'weekly' && (
          <div className="mt-3 flex items-center gap-3">
            <label className="font-mono text-[11px] uppercase tracking-[0.18em] text-iron">
              Goal
            </label>
            <input
              type="number"
              min={1}
              max={7}
              value={form.weekly_goal}
              onChange={(e) => update({ weekly_goal: Number(e.target.value) })}
              className="min-h-tap w-20 rounded-lg border border-dust/40 bg-mortar px-3 text-center font-mono text-chalk outline-none focus:border-brick-red"
            />
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-iron">
              x / week
            </span>
          </div>
        )}
      </Field>

      {error && (
        <p className="rounded-md border border-brick-red/40 bg-brick-red/10 px-3 py-2 text-sm text-brick-red">
          {error}
        </p>
      )}

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="heading min-h-tap flex-1 rounded-lg border border-dust/50 bg-transparent px-4 text-base text-chalk hover:bg-dust/30"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="heading min-h-tap flex-[1.5] rounded-lg bg-brick-red px-4 text-base text-chalk hover:bg-ember disabled:opacity-60"
        >
          {submitting ? 'Saving…' : submitLabel ?? 'Save'}
        </button>
      </div>
    </form>
  )
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-iron">
        {label}
      </span>
      {children}
    </label>
  )
}

function FrequencyToggle({ active, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`heading min-h-tap flex-1 rounded-lg border px-4 text-base transition-colors ${
        active
          ? 'border-brick-red bg-brick-red text-chalk'
          : 'border-dust/40 bg-mortar text-iron hover:text-chalk'
      }`}
    >
      {label}
    </button>
  )
}

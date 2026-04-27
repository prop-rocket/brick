import { Play, Trash2 } from 'lucide-react'

const MUSCLE_COLORS = {
  Push: '#C8432B',
  Pull: '#E85D3A',
  Legs: '#8C8078',
  Core: '#D4C9B8',
  Cardio: '#4A4540',
  Custom: '#F0EBE3',
}

export default function TemplateCard({ template, onStart, onDelete, starting }) {
  const exercises = template.exercises ?? []
  const preview = exercises.slice(0, 4)
  const overflow = exercises.length - 4

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-ash p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="heading text-xl text-chalk">{template.name}</h3>
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-iron">
            {exercises.length} exercise{exercises.length !== 1 ? 's' : ''}
          </span>
        </div>
        {!template.is_preset && onDelete && (
          <button
            type="button"
            onClick={() => onDelete(template)}
            aria-label={`Delete ${template.name}`}
            className="min-h-tap min-w-tap flex items-center justify-center text-iron hover:text-brick-red"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {/* Exercise chips */}
      {preview.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {preview.map((te) => {
            const name = te.exercises?.name ?? te.name ?? '—'
            const group = te.exercises?.muscle_group ?? te.muscle_group
            return (
              <span
                key={te.exercise_id ?? te.id}
                className="rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-mortar"
                style={{ backgroundColor: MUSCLE_COLORS[group] ?? '#8C8078' }}
              >
                {name}
              </span>
            )
          })}
          {overflow > 0 && (
            <span className="rounded-full border border-dust/40 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-iron">
              +{overflow} more
            </span>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => onStart(template)}
        disabled={starting}
        className="heading flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-brick-red text-base text-chalk hover:bg-ember disabled:opacity-60"
      >
        <Play size={16} fill="currentColor" />
        {starting ? 'Starting…' : 'Start Workout'}
      </button>
    </div>
  )
}

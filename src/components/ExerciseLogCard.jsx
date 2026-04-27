import { Check, Plus, Trophy } from 'lucide-react'
import StepperInput from './StepperInput.jsx'

// Single logged-set row (read-only)
function SetRow({ set, isPR }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 text-sm">
      <span className="w-8 font-mono text-iron">{set.set_number}</span>
      <span className="flex-1 font-mono text-chalk">{set.reps} reps</span>
      <div className="flex items-center gap-1.5">
        <span className="font-mono text-chalk">{set.weight_kg} kg</span>
        {isPR && (
          <span
            aria-label="New personal record"
            title="New personal record"
            className="animate-pr-pop flex h-5 w-5 items-center justify-center rounded-full bg-brick-red/20 text-brick-red"
          >
            <Trophy size={11} strokeWidth={2.5} fill="currentColor" />
          </span>
        )}
      </div>
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brick-red">
        <Check size={14} strokeWidth={3} className="text-chalk" />
      </div>
    </div>
  )
}

// Staging row with steppers + confirm button
function StagingRow({ setNumber, reps, weightKg, onChangeReps, onChangeWeight, onConfirm, isPending }) {
  return (
    <div className="border-t border-dust/30 px-4 py-3">
      <div className="mb-3 flex items-center">
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-iron">
          Set {setNumber}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="w-20 font-mono text-[11px] uppercase tracking-[0.14em] text-iron">
            Reps
          </span>
          <StepperInput
            value={reps}
            onChange={onChangeReps}
            step={1}
            min={1}
            max={999}
            className="flex-1"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="w-20 font-mono text-[11px] uppercase tracking-[0.14em] text-iron">
            Weight
          </span>
          <StepperInput
            value={weightKg}
            onChange={onChangeWeight}
            step={2.5}
            min={0}
            unit="kg"
            className="flex-1"
          />
        </div>
      </div>
      <button
        type="button"
        onClick={onConfirm}
        disabled={isPending}
        className="heading mt-3 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-brick-red text-base text-chalk hover:bg-ember disabled:opacity-60"
      >
        <Check size={20} strokeWidth={3} />
        Log Set
      </button>
    </div>
  )
}

export default function ExerciseLogCard({
  exercise,
  loggedSets,
  staging,
  onStagingChange,
  onActivateStaging,
  onConfirmSet,
  logPending,
  prSetIds,
}) {
  const hasStaging = staging !== null

  return (
    <div className="overflow-hidden rounded-2xl bg-ash">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-dust/30 px-4 py-3">
        <div>
          <h3 className="heading text-xl text-chalk">{exercise.name}</h3>
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-iron">
            {exercise.muscle_group}
          </span>
        </div>
        {loggedSets.length > 0 && (
          <span className="font-mono text-xs text-sand">
            {loggedSets.length} set{loggedSets.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Logged sets */}
      {loggedSets.length > 0 && (
        <div className="divide-y divide-dust/20">
          {loggedSets.map((s) => (
            <SetRow key={s.id} set={s} isPR={prSetIds?.has(s.id)} />
          ))}
        </div>
      )}

      {/* Staging row */}
      {hasStaging ? (
        <StagingRow
          setNumber={loggedSets.length + 1}
          reps={staging.reps}
          weightKg={staging.weightKg}
          onChangeReps={(v) => onStagingChange({ ...staging, reps: v })}
          onChangeWeight={(v) => onStagingChange({ ...staging, weightKg: v })}
          onConfirm={onConfirmSet}
          isPending={logPending}
        />
      ) : (
        <button
          type="button"
          onClick={onActivateStaging}
          className="heading flex min-h-[48px] w-full items-center justify-center gap-2 border-t border-dust/30 text-sm text-iron hover:text-chalk"
        >
          <Plus size={16} strokeWidth={2.5} />
          Add Set
        </button>
      )}
    </div>
  )
}

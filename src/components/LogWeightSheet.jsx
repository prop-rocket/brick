import { useEffect, useState } from 'react'
import BottomSheet from './BottomSheet.jsx'
import StepperInput from './StepperInput.jsx'
import { useUpsertBodyLog } from '../lib/bodyApi.js'
import { todayStr } from '../lib/streakUtils.js'

export default function LogWeightSheet({ open, onClose, initialWeight = 75 }) {
  const [date, setDate] = useState(todayStr())
  const [weight, setWeight] = useState(initialWeight)
  const upsert = useUpsertBodyLog()

  useEffect(() => {
    if (open) {
      setDate(todayStr())
      setWeight(initialWeight)
    }
  }, [open, initialWeight])

  const handleSave = async () => {
    if (!weight || weight <= 0) return
    try {
      await upsert.mutateAsync({ logged_at: date, weight_kg: weight })
      onClose?.()
    } catch (e) {
      console.error('Failed to log weight', e)
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Log Weight">
      <div className="flex flex-col gap-5">
        <Field label="Date">
          <input
            type="date"
            value={date}
            max={todayStr()}
            onChange={(e) => setDate(e.target.value)}
            className="font-mono min-h-tap w-full rounded-xl border border-dust/40 bg-mortar px-3 text-base text-chalk outline-none focus:border-ember"
          />
        </Field>

        <Field label="Weight">
          <StepperInput
            value={weight}
            onChange={setWeight}
            step={0.1}
            min={20}
            max={300}
            unit="kg"
            className="w-full"
          />
        </Field>

        <button
          type="button"
          onClick={handleSave}
          disabled={upsert.isPending || !weight}
          className="heading min-h-tap w-full rounded-xl bg-brick-red text-base text-chalk hover:bg-ember disabled:opacity-50"
        >
          {upsert.isPending ? 'Saving…' : 'Save'}
        </button>
      </div>
    </BottomSheet>
  )
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-iron">
        {label}
      </span>
      {children}
    </label>
  )
}

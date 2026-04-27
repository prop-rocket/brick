import { useEffect, useState } from 'react'
import BottomSheet from './BottomSheet.jsx'
import StepperInput from './StepperInput.jsx'
import { useUpsertBodyLog } from '../lib/bodyApi.js'
import { todayStr } from '../lib/streakUtils.js'

const DEFAULTS = { chest_cm: 95, waist_cm: 80, hips_cm: 95 }

export default function LogMeasurementsSheet({ open, onClose, initial }) {
  const [date, setDate] = useState(todayStr())
  const [chest, setChest] = useState(DEFAULTS.chest_cm)
  const [waist, setWaist] = useState(DEFAULTS.waist_cm)
  const [hips, setHips] = useState(DEFAULTS.hips_cm)
  const upsert = useUpsertBodyLog()

  useEffect(() => {
    if (open) {
      setDate(todayStr())
      setChest(initial?.chest_cm ?? DEFAULTS.chest_cm)
      setWaist(initial?.waist_cm ?? DEFAULTS.waist_cm)
      setHips(initial?.hips_cm ?? DEFAULTS.hips_cm)
    }
  }, [open, initial])

  const handleSave = async () => {
    try {
      await upsert.mutateAsync({
        logged_at: date,
        chest_cm: chest,
        waist_cm: waist,
        hips_cm: hips,
      })
      onClose?.()
    } catch (e) {
      console.error('Failed to log measurements', e)
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Log Measurements">
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

        <Field label="Chest">
          <StepperInput
            value={chest}
            onChange={setChest}
            step={0.5}
            min={40}
            max={200}
            unit="cm"
            className="w-full"
          />
        </Field>

        <Field label="Waist">
          <StepperInput
            value={waist}
            onChange={setWaist}
            step={0.5}
            min={40}
            max={200}
            unit="cm"
            className="w-full"
          />
        </Field>

        <Field label="Hips">
          <StepperInput
            value={hips}
            onChange={setHips}
            step={0.5}
            min={40}
            max={200}
            unit="cm"
            className="w-full"
          />
        </Field>

        <button
          type="button"
          onClick={handleSave}
          disabled={upsert.isPending}
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

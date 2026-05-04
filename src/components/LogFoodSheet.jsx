import { useEffect, useState } from 'react'
import BottomSheet from './BottomSheet.jsx'
import StepperInput from './StepperInput.jsx'
import { useCreateFood } from '../lib/foodApi.js'

const MEAL_TYPES = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch',     label: 'Lunch' },
  { value: 'dinner',    label: 'Dinner' },
  { value: 'snack',     label: 'Snack' },
]

function defaultMealType() {
  const h = new Date().getHours()
  if (h < 11) return 'breakfast'
  if (h < 15) return 'lunch'
  if (h < 21) return 'dinner'
  return 'snack'
}

export default function LogFoodSheet({ open, onClose }) {
  const [name, setName] = useState('')
  const [mealType, setMealType] = useState(defaultMealType)
  const [calories, setCalories] = useState(0)
  const [protein, setProtein] = useState(0)
  const [carbs, setCarbs] = useState(0)
  const [fat, setFat] = useState(0)
  const create = useCreateFood()

  useEffect(() => {
    if (open) {
      setName('')
      setMealType(defaultMealType())
      setCalories(0)
      setProtein(0)
      setCarbs(0)
      setFat(0)
    }
  }, [open])

  const handleSave = async () => {
    if (!name.trim()) return
    try {
      await create.mutateAsync({
        meal_type: mealType,
        name,
        calories: calories || null,
        protein_g: protein || null,
        carbs_g: carbs || null,
        fat_g: fat || null,
      })
      onClose?.()
    } catch (e) {
      console.error('Failed to log food', e)
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Log Meal">
      <div className="flex flex-col gap-5">
        <Field label="What did you eat?">
          <input
            type="text"
            value={name}
            placeholder="e.g. Chicken & rice"
            onChange={(e) => setName(e.target.value)}
            className="font-sans min-h-tap w-full rounded-xl border border-dust/40 bg-mortar px-3 text-base text-chalk placeholder-iron outline-none focus:border-ember"
            autoFocus
          />
        </Field>

        <Field label="Meal">
          <div className="grid grid-cols-2 gap-2">
            {MEAL_TYPES.map((m) => {
              const active = mealType === m.value
              return (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMealType(m.value)}
                  className={`heading min-h-[44px] rounded-xl text-sm transition-colors ${
                    active
                      ? 'bg-brick-red text-chalk'
                      : 'bg-mortar text-iron hover:text-sand border border-dust/40'
                  }`}
                >
                  {m.label}
                </button>
              )
            })}
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Calories">
            <StepperInput value={calories} onChange={setCalories} step={10} min={0} unit="kcal" />
          </Field>
          <Field label="Protein">
            <StepperInput value={protein} onChange={setProtein} step={1} min={0} unit="g" />
          </Field>
          <Field label="Carbs">
            <StepperInput value={carbs} onChange={setCarbs} step={1} min={0} unit="g" />
          </Field>
          <Field label="Fat">
            <StepperInput value={fat} onChange={setFat} step={1} min={0} unit="g" />
          </Field>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={create.isPending || !name.trim()}
          className="heading min-h-tap w-full rounded-xl bg-brick-red text-base text-chalk hover:bg-ember disabled:opacity-50"
        >
          {create.isPending ? 'Saving…' : 'Save'}
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

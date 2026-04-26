import { Check } from 'lucide-react'

export const HABIT_COLORS = [
  { value: '#C8432B', name: 'Brick Red' },
  { value: '#E85D3A', name: 'Ember' },
  { value: '#D4C9B8', name: 'Sand' },
  { value: '#8C8078', name: 'Iron' },
  { value: '#F0EBE3', name: 'Chalk' },
  { value: '#4A4540', name: 'Dust' },
]

export default function ColorSwatchPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-3">
      {HABIT_COLORS.map((c) => {
        const selected = value === c.value
        const isDark = c.value === '#4A4540'
        return (
          <button
            key={c.value}
            type="button"
            aria-label={c.name}
            aria-pressed={selected}
            onClick={() => onChange(c.value)}
            className={`relative h-12 w-12 rounded-full border-2 transition-transform ${
              selected
                ? 'border-chalk scale-105'
                : 'border-dust/50 hover:scale-105'
            }`}
            style={{ backgroundColor: c.value }}
          >
            {selected && (
              <Check
                size={18}
                strokeWidth={3}
                className={`absolute inset-0 m-auto ${isDark ? 'text-chalk' : 'text-mortar'}`}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}

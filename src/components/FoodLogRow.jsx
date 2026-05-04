import { Trash2 } from 'lucide-react'

const MEAL_STYLES = {
  breakfast: { bg: '#E85D3A', text: '#F0EBE3', label: 'Breakfast' },
  lunch:     { bg: '#C8432B', text: '#F0EBE3', label: 'Lunch' },
  dinner:    { bg: '#4A4540', text: '#F0EBE3', label: 'Dinner' },
  snack:     { bg: '#D4C9B8', text: '#1C1A18', label: 'Snack' },
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function FoodLogRow({ log, onDelete }) {
  const meal = MEAL_STYLES[log.meal_type] ?? MEAL_STYLES.snack
  const macros = []
  if (log.protein_g) macros.push(`P ${Math.round(log.protein_g)}`)
  if (log.carbs_g)   macros.push(`C ${Math.round(log.carbs_g)}`)
  if (log.fat_g)     macros.push(`F ${Math.round(log.fat_g)}`)

  return (
    <li className="flex items-center gap-3 rounded-xl bg-ash px-3 py-2.5">
      <span
        className="rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] shrink-0"
        style={{ backgroundColor: meal.bg, color: meal.text }}
      >
        {meal.label}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-chalk">{log.name}</p>
        <p className="font-mono text-[11px] text-iron">
          {formatTime(log.logged_at)}
          {log.calories != null && ` · ${Math.round(log.calories)} kcal`}
          {macros.length > 0 && ` · ${macros.join(' / ')}`}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onDelete?.(log)}
        aria-label={`Delete ${log.name}`}
        className="min-h-tap min-w-tap flex shrink-0 items-center justify-center text-iron hover:text-brick-red"
      >
        <Trash2 size={16} />
      </button>
    </li>
  )
}

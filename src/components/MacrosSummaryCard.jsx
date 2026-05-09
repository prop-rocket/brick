import { useChartColors } from '../lib/chartColors.js'
import { usePreference } from '../lib/preferences.js'

const DEFAULT_GOALS = { calories: 2200, protein: 150, carbs: 250, fat: 70 }
const GOALS_KEY = 'brick_macro_goals'

export function getMacroGoals() {
  try {
    const raw = localStorage.getItem(GOALS_KEY)
    if (!raw) return DEFAULT_GOALS
    const parsed = JSON.parse(raw)
    return { ...DEFAULT_GOALS, ...parsed }
  } catch {
    return DEFAULT_GOALS
  }
}

function MacroBar({ label, current, goal, color }) {
  const pct = goal > 0 ? Math.min(100, Math.round((current / goal) * 100)) : 0
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-iron">
          {label}
        </span>
        <span className="font-mono text-[11px] text-sand">
          <span className="text-chalk">{Math.round(current)}</span>
          <span className="text-iron"> / {goal}g</span>
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-mortar">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

export default function MacrosSummaryCard({ totals }) {
  const goals = usePreference(GOALS_KEY, DEFAULT_GOALS)
  const c = useChartColors()
  const calPct = goals.calories > 0
    ? Math.min(100, Math.round((totals.calories / goals.calories) * 100))
    : 0

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-ash p-4">
      <div className="flex items-end justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-iron">
            Today
          </p>
          <p className="heading text-3xl text-chalk leading-tight">
            {Math.round(totals.calories).toLocaleString()}
            <span className="ml-1 font-mono text-sm text-iron">kcal</span>
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-[11px] text-iron">
            of {goals.calories.toLocaleString()}
          </p>
          <p className="font-mono text-sm text-brick-red">{calPct}%</p>
        </div>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-mortar">
        <div
          className="h-full rounded-full bg-brick-red transition-all duration-500"
          style={{ width: `${calPct}%` }}
        />
      </div>

      <div className="grid grid-cols-3 gap-3 pt-1">
        <MacroBar label="Protein" current={totals.protein} goal={goals.protein} color={c.ember} />
        <MacroBar label="Carbs"   current={totals.carbs}   goal={goals.carbs}   color={c.sand} />
        <MacroBar label="Fat"     current={totals.fat}     goal={goals.fat}     color={c.iron} />
      </div>
    </div>
  )
}

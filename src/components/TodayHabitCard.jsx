import { Check, Flame } from 'lucide-react'
import WeeklyRing from './WeeklyRing.jsx'

export default function TodayHabitCard({
  habit,
  completed,
  streak = 0,
  weekValue,
  onToggle,
  pending,
}) {
  const accent = habit.color ?? '#C8432B'
  const isWeekly = habit.frequency_type === 'weekly'

  return (
    <li
      className={`relative flex min-h-[72px] items-center gap-3 overflow-hidden rounded-xl bg-ash px-4 py-3 transition-opacity ${
        completed ? 'opacity-60' : 'opacity-100'
      }`}
    >
      {/* Active indicator stripe */}
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1"
        style={{ backgroundColor: completed ? accent : 'transparent' }}
      />

      <div
        className="h-3 w-3 shrink-0 rounded-full"
        style={{ backgroundColor: accent }}
        aria-hidden
      />

      <div className="flex-1 min-w-0">
        <p className="heading truncate text-lg text-chalk">{habit.name}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
          {habit.category && (
            <span className="font-mono uppercase tracking-[0.16em] text-iron">
              {habit.category}
            </span>
          )}
          {streak > 0 && (
            <span className="flex items-center gap-1 font-mono text-sand">
              <Flame size={12} className="text-ember" />
              {streak} {streak === 1 ? 'day' : 'days'}
            </span>
          )}
          {isWeekly && (
            <span className="font-mono uppercase tracking-[0.16em] text-iron">
              {habit.weekly_goal ?? 1}x/wk
            </span>
          )}
        </div>
      </div>

      {isWeekly && (
        <WeeklyRing value={weekValue ?? 0} goal={habit.weekly_goal ?? 1} />
      )}

      <button
        type="button"
        onClick={() => onToggle?.(habit)}
        disabled={pending}
        aria-pressed={completed}
        aria-label={completed ? `Mark ${habit.name} incomplete` : `Mark ${habit.name} complete`}
        className={`min-h-tap min-w-tap flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          completed
            ? 'border-brick-red bg-brick-red text-chalk'
            : 'border-dust text-transparent hover:border-iron'
        } disabled:opacity-60`}
      >
        <Check size={22} strokeWidth={3} />
      </button>
    </li>
  )
}

export const HABIT_CATEGORIES = ['Health', 'Mind', 'Work', 'Body', 'Social']
export const ALL_CATEGORY = 'All'

export default function CategoryPills({ value, onChange, categories }) {
  const items = [ALL_CATEGORY, ...(categories ?? HABIT_CATEGORIES)]
  return (
    <div
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1"
      style={{ scrollbarWidth: 'none' }}
    >
      {items.map((c) => {
        const active = c === value
        return (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className={`heading min-h-[40px] shrink-0 rounded-full px-4 text-sm transition-colors ${
              active
                ? 'bg-brick-red text-chalk'
                : 'bg-ash text-iron hover:text-sand'
            }`}
          >
            {c}
          </button>
        )
      })}
    </div>
  )
}

export default function SectionTabs({ value, onChange, options }) {
  return (
    <div className="flex gap-2 rounded-full bg-ash p-1">
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`heading min-h-[40px] flex-1 rounded-full px-4 text-sm transition-colors ${
              active
                ? 'bg-brick-red text-chalk'
                : 'bg-transparent text-iron hover:text-sand'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

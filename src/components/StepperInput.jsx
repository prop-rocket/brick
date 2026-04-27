import { Minus, Plus } from 'lucide-react'

export default function StepperInput({
  value,
  onChange,
  step = 1,
  min = 0,
  max,
  unit,
  className = '',
}) {
  const decrement = () => {
    const next = Math.round((value - step) * 100) / 100
    if (max !== undefined && next > max) return
    onChange(Math.max(min, next))
  }

  const increment = () => {
    const next = Math.round((value + step) * 100) / 100
    if (max !== undefined && next > max) return
    onChange(next)
  }

  return (
    <div className={`flex items-center ${className}`}>
      <button
        type="button"
        onPointerDown={(e) => e.preventDefault()}
        onClick={decrement}
        disabled={value <= min}
        aria-label="Decrease"
        className="flex h-14 w-14 items-center justify-center rounded-l-xl border border-dust/40 bg-ash text-chalk transition-colors active:bg-dust/40 disabled:opacity-40"
      >
        <Minus size={20} strokeWidth={2.5} />
      </button>

      <div className="flex min-w-[72px] flex-1 items-center justify-center self-stretch border-y border-dust/40 bg-mortar px-2">
        <span className="font-mono text-xl text-chalk">
          {value}
          {unit && (
            <span className="ml-0.5 text-xs text-iron">{unit}</span>
          )}
        </span>
      </div>

      <button
        type="button"
        onPointerDown={(e) => e.preventDefault()}
        onClick={increment}
        disabled={max !== undefined && value >= max}
        aria-label="Increase"
        className="flex h-14 w-14 items-center justify-center rounded-r-xl border border-dust/40 bg-ash text-chalk transition-colors active:bg-dust/40 disabled:opacity-40"
      >
        <Plus size={20} strokeWidth={2.5} />
      </button>
    </div>
  )
}

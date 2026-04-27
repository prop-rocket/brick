import { X } from 'lucide-react'

function formatCountdown(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function RestTimer({ seconds, onSkip }) {
  const active = seconds > 0
  const progress = active ? seconds / 90 : 0

  return (
    <div
      aria-live="polite"
      aria-label={active ? `Rest timer: ${formatCountdown(seconds)} remaining` : undefined}
      className={`fixed inset-x-0 bottom-0 z-40 transform transition-transform duration-300 ease-out ${
        active ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="bg-ember pb-safe shadow-2xl">
        <div className="mx-auto flex max-w-xl items-center gap-4 px-5 py-4">
          <div className="flex flex-1 flex-col">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-chalk/70">
              Rest
            </span>
            <span className="font-mono text-4xl font-medium leading-none text-chalk">
              {formatCountdown(seconds)}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-chalk/30">
            <div
              className="h-full bg-chalk transition-all duration-1000 ease-linear"
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          <button
            type="button"
            onClick={onSkip}
            className="heading min-h-tap min-w-[56px] rounded-lg border border-chalk/30 bg-chalk/10 px-3 text-sm text-chalk hover:bg-chalk/20"
          >
            Skip
          </button>

          <button
            type="button"
            onClick={onSkip}
            aria-label="Dismiss rest timer"
            className="hidden"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}

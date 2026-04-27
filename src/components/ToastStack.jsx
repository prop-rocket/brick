import { useToast } from '../context/ToastContext.jsx'

export default function ToastStack() {
  const { toasts, dismiss } = useToast()

  if (!toasts.length) return null

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-[calc(72px+env(safe-area-inset-bottom,0px))] inset-x-0 z-[60] flex flex-col items-center gap-2 px-4"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex w-full max-w-xl items-center gap-3 rounded-xl border-l-4 border-ember bg-ash px-4 py-3 shadow-xl animate-slide-up"
        >
          <p className="flex-1 font-sans text-sm text-chalk">{t.message}</p>
          {t.retry && (
            <button
              type="button"
              onClick={() => { t.retry(); dismiss(t.id) }}
              className="heading text-xs text-ember hover:text-brick-red"
            >
              Retry
            </button>
          )}
          <button
            type="button"
            onClick={() => dismiss(t.id)}
            aria-label="Dismiss"
            className="font-mono text-xs text-iron hover:text-chalk"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}

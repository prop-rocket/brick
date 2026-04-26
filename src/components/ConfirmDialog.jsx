import { useEffect } from 'react'

export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  destructive = true,
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onCancel?.()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close"
        onClick={onCancel}
        className="absolute inset-0 bg-black/70"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        className="relative z-10 m-4 w-full max-w-sm rounded-2xl border border-dust/40 bg-ash p-5 text-chalk shadow-2xl"
      >
        <h3 className="heading text-xl">{title}</h3>
        {message && <p className="mt-2 text-sm text-sand">{message}</p>}
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="heading min-h-tap flex-1 rounded-lg border border-dust/50 bg-transparent px-4 text-base text-chalk hover:bg-dust/30"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`heading min-h-tap flex-1 rounded-lg px-4 text-base text-chalk ${
              destructive
                ? 'bg-brick-red hover:bg-ember'
                : 'bg-dust hover:bg-iron'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

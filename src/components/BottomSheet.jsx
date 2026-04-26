import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

export default function BottomSheet({ open, onClose, title, children }) {
  const [mounted, setMounted] = useState(open)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (open) {
      setMounted(true)
      requestAnimationFrame(() => setVisible(true))
    } else if (mounted) {
      setVisible(false)
      const t = setTimeout(() => setMounted(false), 280)
      return () => clearTimeout(t)
    }
  }, [open, mounted])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`absolute inset-x-0 bottom-0 max-h-[90vh] overflow-y-auto rounded-t-2xl border-t border-dust/40 bg-ash text-chalk shadow-2xl transition-transform duration-300 ease-out pb-safe ${
          visible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="mx-auto flex w-full max-w-xl flex-col">
          <div className="flex items-center justify-between border-b border-dust/30 px-5 py-4">
            <h2 className="heading text-xl">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="min-h-tap min-w-tap flex items-center justify-center rounded-full text-iron hover:text-chalk"
            >
              <X size={22} />
            </button>
          </div>
          <div className="px-5 py-5">{children}</div>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'

const FLASH_DURATION_MS = 1500

export default function PRFlashOverlay({ pr, onDismiss }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!pr) return
    setVisible(true)
    const t = setTimeout(() => {
      setVisible(false)
      // small wait for fade-out before unmount
      setTimeout(() => onDismiss?.(), 200)
    }, FLASH_DURATION_MS)
    return () => clearTimeout(t)
  }, [pr, onDismiss])

  if (!pr) return null

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`fixed inset-0 z-[80] flex flex-col items-center justify-center bg-brick-red transition-opacity duration-200 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={() => {
        setVisible(false)
        setTimeout(() => onDismiss?.(), 200)
      }}
    >
      <p className="heading text-7xl text-chalk drop-shadow-lg">NEW PR 🧱</p>
      <p className="mt-4 font-mono text-3xl text-chalk">{pr.weightKg} kg</p>
      {pr.exerciseName && (
        <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-chalk/70">
          {pr.exerciseName}
        </p>
      )}
    </div>
  )
}

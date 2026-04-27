import { useEffect, useState } from 'react'

const FLASH_DURATION_MS = 1600

export default function PRFlashOverlay({ pr, onDismiss }) {
  const [phase, setPhase] = useState('hidden') // hidden | in | out

  useEffect(() => {
    if (!pr) return
    setPhase('in')
    const t = setTimeout(() => {
      setPhase('out')
      setTimeout(() => {
        setPhase('hidden')
        onDismiss?.()
      }, 280)
    }, FLASH_DURATION_MS)
    return () => clearTimeout(t)
  }, [pr, onDismiss])

  if (phase === 'hidden' || !pr) return null

  return (
    <div
      role="alert"
      aria-live="assertive"
      onClick={() => {
        setPhase('out')
        setTimeout(() => { setPhase('hidden'); onDismiss?.() }, 280)
      }}
      className={`fixed inset-x-0 bottom-0 z-[80] flex flex-col items-center justify-center bg-brick-red pb-safe
        transition-transform duration-300 ease-out ${
          phase === 'in' ? 'translate-y-0 h-64' : 'translate-y-full'
        }`}
      style={{ boxShadow: '0 -4px 30px rgba(0,0,0,0.4)' }}
    >
      <p className="heading text-6xl text-chalk">NEW PR 🧱</p>
      <p className="mt-3 font-mono text-3xl text-chalk">{pr.weightKg} kg</p>
      {pr.exerciseName && (
        <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-chalk/70">
          {pr.exerciseName}
        </p>
      )}
      <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-chalk/50">
        Tap to dismiss
      </p>
    </div>
  )
}

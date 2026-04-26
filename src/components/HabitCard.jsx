import { useRef, useState } from 'react'
import { Trash2, Flame } from 'lucide-react'

const REVEAL_PX = 80
const SWIPE_THRESHOLD = 6

export default function HabitCard({
  habit,
  streak = 0,
  onEdit,
  onDelete,
  weekProgress,
}) {
  const [tx, setTx] = useState(0)
  const startRef = useRef(null)
  const swipingRef = useRef(false)

  const onPointerDown = (e) => {
    startRef.current = { x: e.clientX, baseTx: tx }
    swipingRef.current = false
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }

  const onPointerMove = (e) => {
    if (!startRef.current) return
    const dx = e.clientX - startRef.current.x
    if (!swipingRef.current && Math.abs(dx) > SWIPE_THRESHOLD) {
      swipingRef.current = true
    }
    if (!swipingRef.current) return
    const next = Math.max(-REVEAL_PX, Math.min(0, startRef.current.baseTx + dx))
    setTx(next)
  }

  const onPointerUp = () => {
    if (!startRef.current) return
    const reveal = tx < -REVEAL_PX / 2
    setTx(reveal ? -REVEAL_PX : 0)
    startRef.current = null
    setTimeout(() => {
      swipingRef.current = false
    }, 80)
  }

  const handleClick = () => {
    if (swipingRef.current) return
    if (tx !== 0) {
      setTx(0)
      return
    }
    onEdit?.(habit)
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    onDelete?.(habit)
  }

  const accent = habit.color ?? '#C8432B'

  return (
    <li className="relative overflow-hidden rounded-xl">
      {/* Reveal layer (behind) */}
      <div className="absolute inset-y-0 right-0 flex w-20 items-center justify-center bg-brick-red">
        <button
          type="button"
          onClick={handleDelete}
          aria-label={`Delete ${habit.name}`}
          className="min-h-tap min-w-tap flex flex-col items-center justify-center text-chalk"
        >
          <Trash2 size={20} />
          <span className="heading mt-0.5 text-[10px]">Delete</span>
        </button>
      </div>

      {/* Foreground card */}
      <div
        role="button"
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onEdit?.(habit)
          }
        }}
        style={{
          transform: `translateX(${tx}px)`,
          transition: startRef.current ? 'none' : 'transform 220ms ease-out',
          touchAction: 'pan-y',
        }}
        className="flex min-h-[72px] cursor-pointer items-center gap-3 bg-ash px-4 py-3 select-none"
        data-accent={accent}
      >
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
            <span className="font-mono uppercase tracking-[0.16em] text-iron">
              {habit.frequency_type === 'weekly'
                ? `${habit.weekly_goal ?? 1}x/wk`
                : 'Daily'}
            </span>
            {streak > 0 && (
              <span className="flex items-center gap-1 font-mono text-sand">
                <Flame size={12} className="text-ember" />
                {streak}d
              </span>
            )}
            {weekProgress && (
              <span className="font-mono text-sand">
                {weekProgress.value}/{weekProgress.goal} this wk
              </span>
            )}
          </div>
        </div>
      </div>
    </li>
  )
}

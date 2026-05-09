import { useRef, useState } from 'react'
import { Trash2 } from 'lucide-react'

const MEAL_STYLES = {
  breakfast: { bg: '#E85D3A', text: '#F0EBE3', label: 'Breakfast' },
  lunch:     { bg: '#C8432B', text: '#F0EBE3', label: 'Lunch' },
  dinner:    { bg: '#4A4540', text: '#F0EBE3', label: 'Dinner' },
  snack:     { bg: '#D4C9B8', text: '#1C1A18', label: 'Snack' },
}

const REVEAL_PX = 80
const SWIPE_THRESHOLD = 6

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function FoodLogRow({ log, onDelete }) {
  const meal = MEAL_STYLES[log.meal_type] ?? MEAL_STYLES.snack
  const macros = []
  if (log.protein_g) macros.push(`P ${Math.round(log.protein_g)}`)
  if (log.carbs_g)   macros.push(`C ${Math.round(log.carbs_g)}`)
  if (log.fat_g)     macros.push(`F ${Math.round(log.fat_g)}`)

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
    setTimeout(() => { swipingRef.current = false }, 80)
  }

  const handleClick = () => {
    if (swipingRef.current) return
    if (tx !== 0) setTx(0)
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    onDelete?.(log)
  }

  return (
    <li className="relative overflow-hidden rounded-xl">
      {/* Reveal layer */}
      <div className="absolute inset-y-0 right-0 flex w-20 items-center justify-center bg-brick-red">
        <button
          type="button"
          onClick={handleDelete}
          aria-label={`Delete ${log.name}`}
          className="min-h-tap min-w-tap flex flex-col items-center justify-center text-chalk"
        >
          <Trash2 size={20} />
          <span className="heading mt-0.5 text-[10px]">Delete</span>
        </button>
      </div>

      {/* Sliding content */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={handleClick}
        style={{
          transform: `translateX(${tx}px)`,
          transition: startRef.current ? 'none' : 'transform 220ms ease-out',
          touchAction: 'pan-y',
        }}
        className="flex items-center gap-3 bg-ash px-3 py-2.5 select-none"
      >
        <span
          className="rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] shrink-0"
          style={{ backgroundColor: meal.bg, color: meal.text }}
        >
          {meal.label}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-chalk">{log.name}</p>
          <p className="font-mono text-[11px] text-iron">
            {formatTime(log.logged_at)}
            {log.calories != null && ` · ${Math.round(log.calories)} kcal`}
            {macros.length > 0 && ` · ${macros.join(' / ')}`}
          </p>
        </div>
      </div>
    </li>
  )
}

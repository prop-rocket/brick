import { useRef, useState } from 'react'
import { Trash2 } from 'lucide-react'

const REVEAL_PX = 80
const SWIPE_THRESHOLD = 6

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

// view: 'weight' shows weight only; 'measurements' shows chest/waist/hips.
export default function BodyLogRow({ log, view, onDelete }) {
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
    if (tx !== 0) setTx(0)
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    onDelete?.(log)
  }

  return (
    <li className="relative overflow-hidden rounded-xl">
      <div className="absolute inset-y-0 right-0 flex w-20 items-center justify-center bg-brick-red">
        <button
          type="button"
          onClick={handleDelete}
          aria-label="Delete entry"
          className="min-h-tap min-w-tap flex flex-col items-center justify-center text-chalk"
        >
          <Trash2 size={20} />
          <span className="heading mt-0.5 text-[10px]">Delete</span>
        </button>
      </div>

      <div
        role="button"
        tabIndex={0}
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
        className="flex min-h-[60px] cursor-pointer items-center justify-between gap-3 bg-ash px-4 py-3 select-none"
      >
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-iron">
          {formatDate(log.logged_at)}
        </span>

        {view === 'weight' ? (
          <span className="font-mono text-base text-chalk">
            {log.weight_kg != null ? `${Number(log.weight_kg).toFixed(1)} kg` : '—'}
          </span>
        ) : (
          <div className="flex gap-3 font-mono text-sm text-chalk">
            <Cell label="C" value={log.chest_cm} />
            <Cell label="W" value={log.waist_cm} />
            <Cell label="H" value={log.hips_cm} />
          </div>
        )}
      </div>
    </li>
  )
}

function Cell({ label, value }) {
  return (
    <span className="flex items-baseline gap-1">
      <span className="text-[10px] uppercase tracking-[0.16em] text-iron">{label}</span>
      <span>{value != null ? Number(value).toFixed(1) : '—'}</span>
    </span>
  )
}

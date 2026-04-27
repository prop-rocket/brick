export default function StatPill({ label, value, accent = false }) {
  return (
    <div
      className={`flex flex-col rounded-lg px-3 py-2 ${
        accent ? 'bg-brick-red/15 border border-brick-red/30' : 'bg-mortar/60'
      }`}
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-iron">
        {label}
      </span>
      <span
        className={`mt-0.5 font-mono text-base ${
          accent ? 'text-brick-red' : 'text-chalk'
        }`}
      >
        {value}
      </span>
    </div>
  )
}

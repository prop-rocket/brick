const TIERS = [
  { kg: 1,      label: 'a bag of sugar',         emoji: '🍬' },
  { kg: 10,     label: 'a bag of flour',          emoji: '🛍️' },
  { kg: 50,     label: 'a golden retriever',      emoji: '🐕' },
  { kg: 100,    label: 'a giant panda',           emoji: '🐼' },
  { kg: 250,    label: 'an upright piano',        emoji: '🎹' },
  { kg: 500,    label: 'a Vespa scooter',         emoji: '🛵' },
  { kg: 800,    label: 'a polar bear',            emoji: '🐻‍❄️' },
  { kg: 1200,   label: 'a small car',             emoji: '🚗' },
  { kg: 2000,   label: 'a rhinoceros',            emoji: '🦏' },
  { kg: 3500,   label: 'a small yacht',           emoji: '⛵' },
  { kg: 5000,   label: 'an African elephant',     emoji: '🐘' },
  { kg: 10000,  label: 'a city bus',              emoji: '🚌' },
  { kg: 20000,  label: 'a humpback whale',        emoji: '🐋' },
  { kg: 50000,  label: 'a Boeing 737',            emoji: '✈️' },
  { kg: 100000, label: 'a blue whale',            emoji: '🐳' },
  { kg: 500000, label: 'the Statue of Liberty',   emoji: '🗽' },
]

function getBestTier(kg) {
  let best = TIERS[0]
  for (const tier of TIERS) {
    if (kg >= tier.kg) best = tier
    else break
  }
  return best
}

export default function LiftComparison({ totalVolume }) {
  if (!totalVolume || totalVolume <= 0) return null
  const tier = getBestTier(Math.round(totalVolume))
  const times = totalVolume >= tier.kg * 1.8 ? Math.round(totalVolume / tier.kg) : null

  return (
    <div className="overflow-hidden rounded-2xl bg-brick-red/10 border border-brick-red/20">
      <div className="px-4 py-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brick-red mb-2">
          Today you lifted…
        </p>
        <div className="flex items-center gap-3">
          <span className="text-4xl leading-none">{tier.emoji}</span>
          <div>
            <p className="heading text-2xl text-chalk leading-tight">
              {times ? `${times}× ${tier.label}` : tier.label}
            </p>
            <p className="font-mono text-sm text-iron mt-0.5">
              {Math.round(totalVolume).toLocaleString()} kg total volume
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

import { Minus, Plus, Droplet } from 'lucide-react'
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell } from 'recharts'
import { useTodayWater, useSetWaterGlasses, useWeekWater } from '../lib/waterApi.js'
import { todayStr } from '../lib/streakUtils.js'
import ChartCard from './charts/ChartCard.jsx'
import { useChartColors } from '../lib/chartColors.js'
import { usePreference } from '../lib/preferences.js'

const ML_PER_GLASS = 250
const GOAL_LS_KEY = 'brick_water_goal_glasses'
const DEFAULT_GOAL = 8

export function getWaterGoal() {
  try {
    const v = Number(localStorage.getItem(GOAL_LS_KEY))
    return v > 0 ? v : DEFAULT_GOAL
  } catch {
    return DEFAULT_GOAL
  }
}

function shortDay(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, { weekday: 'short' })[0]
}

// Circular progress ring built from an SVG.
function ProgressRing({ pct }) {
  const size = 200
  const stroke = 14
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const dash = (Math.min(100, pct) / 100) * c
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgb(var(--color-mortar))"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#C8432B"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${c}`}
        style={{ transition: 'stroke-dasharray 400ms ease' }}
      />
    </svg>
  )
}

export default function WaterTracker() {
  const goal = usePreference(GOAL_LS_KEY, DEFAULT_GOAL)
  const { data: today, isLoading } = useTodayWater()
  const { data: week = [] } = useWeekWater()
  const setGlasses = useSetWaterGlasses()
  const colors = useChartColors()

  const glasses = today?.glasses ?? 0
  const ml = glasses * ML_PER_GLASS
  const pct = goal > 0 ? (glasses / goal) * 100 : 0
  const goalReached = glasses >= goal

  const inc = () => setGlasses.mutate(glasses + 1)
  const dec = () => setGlasses.mutate(Math.max(0, glasses - 1))

  const today_str = todayStr()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-ash px-4 py-6">
        <div className="relative flex items-center justify-center">
          <ProgressRing pct={pct} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Droplet
              size={28}
              className={goalReached ? 'text-brick-red' : 'text-iron'}
              fill={goalReached ? 'currentColor' : 'none'}
            />
            <p className="heading mt-2 text-5xl text-chalk leading-none">{glasses}</p>
            <p className="font-mono mt-1 text-[11px] uppercase tracking-[0.18em] text-iron">
              of {goal} glasses
            </p>
            <p className="font-mono text-[11px] text-sand">
              {(ml / 1000).toFixed(2).replace(/\.?0+$/, '')} L
            </p>
          </div>
        </div>

        <div className="flex w-full max-w-[280px] items-center gap-3">
          <button
            type="button"
            onClick={dec}
            disabled={isLoading || glasses <= 0}
            aria-label="One less glass"
            className="flex h-14 flex-1 items-center justify-center rounded-xl border border-dust/40 bg-mortar text-chalk transition-colors active:bg-dust/40 disabled:opacity-40"
          >
            <Minus size={22} strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={inc}
            disabled={isLoading}
            aria-label="One more glass"
            className="flex h-14 flex-[2] items-center justify-center gap-2 rounded-xl bg-brick-red text-chalk transition-colors hover:bg-ember active:scale-95 disabled:opacity-50"
          >
            <Plus size={22} strokeWidth={2.5} />
            <span className="heading text-base">Glass</span>
          </button>
        </div>

        {goalReached && (
          <p className="heading text-brick-red text-sm tracking-wide">
            Goal hit · keep going
          </p>
        )}
      </div>

      <ChartCard title="Last 7 days">
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={week} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                interval={0}
                tick={{ fill: colors.iron, fontSize: 10, fontFamily: 'DM Mono' }}
                tickFormatter={shortDay}
              />
              <Bar dataKey="glasses" radius={[4, 4, 0, 0]}>
                {week.map((d) => (
                  <Cell
                    key={d.date}
                    fill={d.date === today_str ? colors.ember : colors.brickRed}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  )
}

import { NavLink } from 'react-router-dom'
import { CalendarCheck2, Repeat, Dumbbell, Activity, BarChart3 } from 'lucide-react'

const tabs = [
  { to: '/', label: 'Today', icon: CalendarCheck2, end: true },
  { to: '/habits', label: 'Habits', icon: Repeat },
  { to: '/gym', label: 'Gym', icon: Dumbbell },
  { to: '/body', label: 'Body', icon: Activity },
  { to: '/stats', label: 'Stats', icon: BarChart3 },
]

export default function BottomNav() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-dust/40 bg-ash/95 backdrop-blur pb-safe"
    >
      <ul className="mx-auto flex max-w-xl items-stretch justify-between px-2">
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                [
                  'relative flex min-h-tap flex-col items-center justify-center gap-0.5 py-2 px-1 text-[11px]',
                  'heading transition-colors active:scale-95',
                  isActive ? 'text-brick-red' : 'text-iron hover:text-sand',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={22} strokeWidth={2.25} />
                  <span>{label}</span>
                  {isActive && (
                    <span
                      className="absolute bottom-1 h-1 w-1 rounded-full bg-brick-red"
                      aria-hidden
                    />
                  )}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

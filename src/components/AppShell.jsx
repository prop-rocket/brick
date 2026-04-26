import { Outlet } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import BottomNav from './BottomNav.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import BrickLogo from './BrickLogo.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function AppShell() {
  const { signOut } = useAuth()

  return (
    <div className="flex min-h-full flex-col bg-mortar text-chalk dark:bg-mortar dark:text-chalk">
      <header className="sticky top-0 z-20 border-b border-dust/30 bg-mortar/90 backdrop-blur dark:bg-mortar/90">
        <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <BrickLogo className="h-9 w-9" />
            <div className="leading-tight">
              <p className="heading text-2xl text-chalk">BRICK</p>
              <p className="font-sans text-[11px] italic text-iron">
                Lay one every day.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => signOut()}
              aria-label="Sign out"
              className="min-h-tap min-w-tap flex items-center justify-center rounded-full text-iron hover:text-brick-red transition-colors"
            >
              <LogOut size={22} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-xl flex-1 px-4 pb-28 pt-4">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  )
}

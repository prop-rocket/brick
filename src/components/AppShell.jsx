import { Outlet, useNavigate } from 'react-router-dom'
import { Settings } from 'lucide-react'
import BottomNav from './BottomNav.jsx'
import BrickLogo from './BrickLogo.jsx'
import OfflineBanner from './OfflineBanner.jsx'
import InstallBanner from './InstallBanner.jsx'
import ToastStack from './ToastStack.jsx'
import ThemeToggle from './ThemeToggle.jsx'

export default function AppShell() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-full flex-col bg-mortar text-chalk">
      <OfflineBanner />
      <header className="sticky top-0 z-20 border-b border-dust/30 bg-mortar/90 backdrop-blur">
        <InstallBanner />
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
              onClick={() => navigate('/settings')}
              aria-label="Settings"
              className="min-h-tap min-w-tap flex items-center justify-center rounded-full text-iron hover:text-chalk transition-colors active:scale-95"
            >
              <Settings size={22} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-xl flex-1 px-4 pb-28 pt-4 page-enter">
        <Outlet />
      </main>

      <ToastStack />
      <BottomNav />
    </div>
  )
}

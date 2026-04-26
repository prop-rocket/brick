import BrickLogo from './BrickLogo.jsx'
import ThemeToggle from './ThemeToggle.jsx'

export default function AuthFrame({ children }) {
  return (
    <div className="relative flex min-h-full flex-col bg-mortar text-chalk dark:bg-mortar dark:text-chalk">
      <div className="absolute right-3 top-3 z-10">
        <ThemeToggle />
      </div>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-10">
        <div className="mb-8 flex items-center gap-4">
          <BrickLogo className="h-14 w-14" />
          <div className="leading-tight">
            <p className="heading text-4xl">BRICK</p>
            <p className="font-sans text-sm italic text-iron">
              Lay one every day.
            </p>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}

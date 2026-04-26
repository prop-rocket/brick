import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeContext.jsx'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="min-h-tap min-w-tap flex items-center justify-center rounded-full text-iron hover:text-chalk dark:hover:text-chalk transition-colors"
    >
      {isDark ? <Sun size={22} /> : <Moon size={22} />}
    </button>
  )
}

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
      className="group relative min-h-tap min-w-tap flex items-center justify-center rounded-full overflow-hidden transition-transform active:scale-90"
    >
      <span className="absolute inset-1 rounded-full bg-brick-red/0 transition-colors duration-300 group-hover:bg-brick-red/10" />
      <Sun
        size={22}
        className={`absolute transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isDark
            ? 'opacity-0 -rotate-90 scale-50'
            : 'opacity-100 rotate-0 scale-100 text-ember drop-shadow-[0_0_6px_rgba(232,93,58,0.45)]'
        }`}
      />
      <Moon
        size={22}
        className={`transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isDark
            ? 'opacity-100 rotate-0 scale-100 text-sand'
            : 'opacity-0 rotate-90 scale-50'
        }`}
      />
    </button>
  )
}

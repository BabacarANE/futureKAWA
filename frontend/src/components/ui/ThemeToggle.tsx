import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      title={isDark ? 'Mode clair' : 'Mode sombre'}
      className="p-2 rounded-lg border border-coffee-900/10 dark:border-white/10
                 bg-white dark:bg-coffee-900/40 hover:bg-coffee-50 dark:hover:bg-coffee-900/70
                 transition-colors text-coffee-900 dark:text-coffee-50"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}

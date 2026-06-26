import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
  setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

function getInitialTheme(): Theme {
  try {
    const stored = window.localStorage.getItem('fk-theme')
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    // localStorage unavailable (private mode, SSR, etc.) — fall back silently
  }
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    try {
      window.localStorage.setItem('fk-theme', theme)
    } catch {
      // ignore persistence errors
    }
  }, [theme])

  const toggleTheme = useCallback(() => {
    setThemeState(t => (t === 'dark' ? 'light' : 'dark'))
  }, [])

  const setTheme = useCallback((t: Theme) => setThemeState(t), [])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)

  if (!ctx) {
    console.warn('ThemeProvider missing')

    return {
      theme: 'light',
      toggleTheme: () => {},
      setTheme: () => {},
    }
  }

  return ctx
}
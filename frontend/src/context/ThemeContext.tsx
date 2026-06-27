import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  toggle: () => void
}

const ThemeContext = createContext<ThemeState | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem('theme') as Theme) || 'light',
  )

  // Reflect the theme onto <html data-theme="..."> so CSS variables switch.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggle = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider')
  return ctx
}

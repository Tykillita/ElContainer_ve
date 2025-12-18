import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

type Theme = 'dark' | 'light'

type AppState = {
  theme: Theme
}

type AppContextValue = {
  state: AppState
  setTheme: (theme: Theme) => void
}

const AppContext = createContext<AppContextValue | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')
  const value = useMemo(() => ({ state: { theme }, setTheme }), [theme])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const ctx = useContext(AppContext)
  if (!ctx) {
    throw new Error('useAppContext must be used inside AppProvider')
  }
  return ctx
}

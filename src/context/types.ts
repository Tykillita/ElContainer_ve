export type Theme = 'dark' | 'light'

export type AppState = {
  theme: Theme
}

export type AppContextValue = {
  state: AppState
  setTheme: (theme: Theme) => void
}

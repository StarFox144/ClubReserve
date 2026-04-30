import { createContext, useContext, useMemo, useState } from 'react'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { createAppTheme } from '../theme'

const ThemeContext = createContext()

export const useThemeMode = () => useContext(ThemeContext)

export const AppThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => localStorage.getItem('themeMode') || 'dark')

  const toggleTheme = () => {
    setMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem('themeMode', next)
      return next
    })
  }

  const theme = useMemo(() => createAppTheme(mode), [mode])

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  )
}

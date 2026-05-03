import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import 'dayjs/locale/uk'
import './index.css'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import { AppThemeProvider } from './contexts/ThemeContext'
import { ToastProvider } from './contexts/ToastContext'
import ErrorBoundary from './components/ErrorBoundary'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 1000 * 60 } },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AppThemeProvider>
          <ToastProvider>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="uk">
              <AuthProvider>
                <ErrorBoundary>
                  <App />
                </ErrorBoundary>
              </AuthProvider>
            </LocalizationProvider>
          </ToastProvider>
        </AppThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
)

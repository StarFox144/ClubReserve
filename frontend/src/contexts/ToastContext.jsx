import { createContext, useCallback, useContext, useState } from 'react'
import { Alert, Slide, Snackbar } from '@mui/material'

const ToastContext = createContext(null)

export const useToast = () => useContext(ToastContext)

const SEVERITY_STYLES = {
  success: { bgcolor: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.4)', color: '#10b981' },
  error:   { bgcolor: 'rgba(239,68,68,0.12)',  border: '1px solid rgba(239,68,68,0.4)',  color: '#ef4444' },
  info:    { bgcolor: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.4)', color: '#818cf8' },
  warning: { bgcolor: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.4)', color: '#f59e0b' },
}

function SlideUp(props) {
  return <Slide {...props} direction="up" />
}

export const ToastProvider = ({ children }) => {
  const [queue, setQueue] = useState([])

  const showToast = useCallback((message, severity = 'success') => {
    setQueue((prev) => [...prev, { id: Date.now(), message, severity, open: true }])
  }, [])

  const handleClose = (id) => {
    setQueue((prev) => prev.map((t) => (t.id === id ? { ...t, open: false } : t)))
    setTimeout(() => setQueue((prev) => prev.filter((t) => t.id !== id)), 400)
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {queue.map((toast, idx) => (
        <Snackbar
          key={toast.id}
          open={toast.open}
          autoHideDuration={3500}
          onClose={() => handleClose(toast.id)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          TransitionComponent={SlideUp}
          sx={{ bottom: { xs: 16 + idx * 70, sm: 24 + idx * 70 } }}
        >
          <Alert
            onClose={() => handleClose(toast.id)}
            severity={toast.severity}
            variant="outlined"
            sx={{
              backdropFilter: 'blur(12px)',
              fontWeight: 600,
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              ...SEVERITY_STYLES[toast.severity],
            }}
          >
            {toast.message}
          </Alert>
        </Snackbar>
      ))}
    </ToastContext.Provider>
  )
}

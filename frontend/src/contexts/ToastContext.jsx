import { createContext, useCallback, useContext, useState } from 'react'
import { Box, IconButton, Slide, Snackbar, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { cr, font, tint } from '../design/tokens'

const ToastContext = createContext(null)

export const useToast = () => useContext(ToastContext)

// HUD system-message look per severity
const SEVERITY = {
  success: { code: 'SYS://OK',   color: cr.success, text: cr.successText },
  error:   { code: 'SYS://ERR',  color: cr.danger,  text: cr.dangerText },
  info:    { code: 'SYS://INFO', color: cr.cyan,    text: cr.cyanText },
  warning: { code: 'SYS://WARN', color: cr.warning, text: cr.warningText },
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
      {queue.map((toast, idx) => {
        const s = SEVERITY[toast.severity] || SEVERITY.info
        return (
          <Snackbar
            key={toast.id}
            open={toast.open}
            autoHideDuration={3500}
            onClose={() => handleClose(toast.id)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            TransitionComponent={SlideUp}
            sx={{ bottom: { xs: 16 + idx * 78, sm: 24 + idx * 78 } }}
          >
            <Box
              role={toast.severity === 'error' ? 'alert' : 'status'}
              sx={{
                position: 'relative',
                display: 'flex', alignItems: 'flex-start', gap: 1.5,
                minWidth: { xs: 'calc(100vw - 32px)', sm: 320 }, maxWidth: 420,
                pl: 2, pr: 1, py: 1.25,
                borderRadius: '12px',
                background: cr.glassStrong,
                backdropFilter: 'blur(18px)',
                border: `1px solid ${tint(s.color, 45)}`,
                boxShadow: `0 0 24px ${tint(s.color, 25)}`,
                overflow: 'hidden',
                '&::before': { content: '""', position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, bgcolor: s.color, boxShadow: `0 0 12px ${s.color}` },
                '&::after': {
                  content: '""', position: 'absolute', left: 0, bottom: 0, height: 2, width: '100%',
                  background: tint(s.color, 60), transformOrigin: 'left',
                  animation: 'cr-toast-timer 3.5s linear forwards',
                },
                '@keyframes cr-toast-timer': { from: { transform: 'scaleX(1)' }, to: { transform: 'scaleX(0)' } },
              }}
            >
              <Box sx={{ flexGrow: 1, minWidth: 0, py: 0.25 }}>
                <Typography sx={{ fontFamily: font.mono, fontSize: '0.66rem', fontWeight: 700, letterSpacing: '0.16em', color: s.text }}>
                  {s.code} <Box component="span" sx={{ color: cr.faint }}>· {new Date(toast.id).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</Box>
                </Typography>
                <Typography sx={{ mt: 0.25, fontWeight: 600, fontSize: '0.9rem', color: cr.text }}>{toast.message}</Typography>
              </Box>
              <IconButton size="small" aria-label="Закрити" onClick={() => handleClose(toast.id)} sx={{ color: cr.muted }}>
                <CloseIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          </Snackbar>
        )
      })}
    </ToastContext.Provider>
  )
}

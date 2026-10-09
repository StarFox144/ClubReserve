import React from 'react'
import { Box, Button, Typography } from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import { cr, font, tint } from '../design/tokens'
import { GlassCard } from './ui'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', px: 2, bgcolor: cr.bg }}>
        <GlassCard hud accent={cr.danger} sx={{ p: { xs: 3, sm: 5 }, maxWidth: 520, width: '100%', textAlign: 'center' }}>
          <Typography sx={{ fontFamily: font.mono, fontSize: '0.72rem', letterSpacing: '0.2em', color: cr.dangerText, mb: 2 }}>
            SYS://FATAL_EXCEPTION
          </Typography>
          <Typography
            component="h1"
            className="cr-glitch"
            data-text="Щось пішло не так"
            sx={{ fontFamily: font.display, fontWeight: 800, fontSize: { xs: '1.5rem', sm: '1.9rem' }, mb: 1.5, color: cr.text }}
          >
            Щось пішло не так
          </Typography>
          <Typography sx={{ color: cr.muted, mb: 3 }}>
            Виникла неочікувана помилка. Спробуй оновити сторінку.
          </Typography>
          {this.state.error && (
            <Box sx={{ mb: 3, p: 1.5, borderRadius: '10px', textAlign: 'left', fontFamily: font.mono, fontSize: '0.75rem', color: cr.dangerText, bgcolor: tint(cr.danger, 8), border: `1px solid ${tint(cr.danger, 25)}`, wordBreak: 'break-word' }}>
              &gt; {this.state.error.message}
            </Box>
          )}
          <Button variant="contained" startIcon={<RefreshIcon />} onClick={() => window.location.reload()}>
            Оновити сторінку
          </Button>
        </GlassCard>
      </Box>
    )
  }
}

export default ErrorBoundary

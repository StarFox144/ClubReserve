import React from 'react'
import { Box, Button, Typography } from '@mui/material'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import RefreshIcon from '@mui/icons-material/Refresh'

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
      <Box sx={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '60vh', textAlign: 'center', px: 3,
      }}>
        <Box className="pulse-glow" sx={{
          width: 80, height: 80, borderRadius: '50%', mb: 3,
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <ErrorOutlineIcon sx={{ fontSize: 40, color: '#ef4444' }} />
        </Box>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
          Щось пішло не так
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 400 }}>
          Виникла неочікувана помилка. Спробуй оновити сторінку.
        </Typography>
        {this.state.error && (
          <Typography variant="caption" color="text.disabled" sx={{ mb: 3, fontFamily: 'monospace', maxWidth: 500, display: 'block' }}>
            {this.state.error.message}
          </Typography>
        )}
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={() => window.location.reload()}
          sx={{ borderRadius: 2 }}
        >
          Оновити сторінку
        </Button>
      </Box>
    )
  }
}

export default ErrorBoundary

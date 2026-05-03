import { useState } from 'react'
import { Alert, Box, Button, CircularProgress, Link, TextField, Typography } from '@mui/material'
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { usePageTitle } from '../hooks/usePageTitle'
import ComputerIcon from '@mui/icons-material/Computer'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

const DECO_ITEMS = [
  { top: '12%', left: '8%',  size: 48, delay: '0s',   opacity: 0.12 },
  { top: '55%', left: '15%', size: 32, delay: '1.5s', opacity: 0.08 },
  { top: '30%', right: '10%',size: 40, delay: '0.8s', opacity: 0.1  },
  { top: '72%', right: '8%', size: 56, delay: '2s',   opacity: 0.06 },
  { top: '85%', left: '40%', size: 28, delay: '1s',   opacity: 0.09 },
]

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  usePageTitle('Вхід')
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'
  const successMsg = location.state?.message

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.response?.data?.detail || 'Невірний email або пароль')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', py: 4 }}>
      <Box sx={{
        display: 'flex', width: '100%', maxWidth: 900, borderRadius: 4, overflow: 'hidden',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        border: '1px solid rgba(147,51,234,0.25)',
      }}>

        {/* ── Left panel ── */}
        <Box sx={(theme) => ({
          display: { xs: 'none', md: 'flex' }, flex: 1,
          flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
          position: 'relative', overflow: 'hidden', p: 6,
          background: 'linear-gradient(160deg,#1a0533 0%,#0d1240 50%,#0a0a1a 100%)',
        })}>
          {/* Glow */}
          <Box sx={{ position: 'absolute', top: '20%', left: '20%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(147,51,234,0.2) 0%,transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />

          {/* Floating PCs */}
          {DECO_ITEMS.map((d, i) => (
            <Box key={i} className="float" sx={{ position: 'absolute', top: d.top, left: d.left, right: d.right, opacity: d.opacity, animationDelay: d.delay, color: '#a855f7' }}>
              <ComputerIcon sx={{ fontSize: d.size }} />
            </Box>
          ))}

          <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 4 }}>
              <ComputerIcon sx={{ fontSize: 36, color: '#a855f7', filter: 'drop-shadow(0 0 10px #9333ea)' }} />
              <Typography variant="h5" fontWeight={800} sx={{
                background: 'linear-gradient(135deg,#e2e8f0,#a855f7)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                ClubReserve
              </Typography>
            </Box>

            <Typography variant="h4" fontWeight={800} sx={{
              background: 'linear-gradient(135deg,#e2e8f0 0%,#a855f7 60%,#818cf8 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              mb: 2, lineHeight: 1.2,
            }}>
              З поверненням!
            </Typography>
            <Typography color="text.secondary" sx={{ lineHeight: 1.8, maxWidth: 260, mx: 'auto' }}>
              Бронюй комп'ютери у клубах онлайн — швидко та без черг.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 5, textAlign: 'left' }}>
              {['Реальний статус комп\'ютерів', 'Промо-коди та знижки', 'QR-підтвердження бронювань'].map((t) => (
                <Box key={t} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#a855f7' }} />
                  </Box>
                  <Typography variant="body2" color="text.secondary">{t}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* ── Right panel (form) ── */}
        <Box sx={(theme) => ({
          flex: { xs: 1, md: '0 0 420px' }, p: { xs: 4, md: 6 },
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          background: theme.palette.mode === 'dark' ? 'rgba(12,12,20,0.95)' : '#ffffff',
        })}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4, display: { md: 'none', xs: 'flex' } }}>
            <ComputerIcon sx={{ color: '#a855f7', fontSize: 28 }} />
            <Typography variant="h6" fontWeight={800} sx={{ background: 'linear-gradient(135deg,#a855f7,#818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              ClubReserve
            </Typography>
          </Box>

          <Box sx={{ width: 48, height: 48, borderRadius: 2, background: 'linear-gradient(135deg,#7c3aed,#9333ea)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3, boxShadow: '0 0 20px rgba(147,51,234,0.4)' }}>
            <LockOutlinedIcon sx={{ color: 'white', fontSize: 22 }} />
          </Box>

          <Typography variant="h5" fontWeight={800} sx={{ mb: 0.5 }}>Вхід</Typography>
          <Typography color="text.secondary" variant="body2" sx={{ mb: 4 }}>Введіть свої дані для входу</Typography>

          {successMsg && <Alert severity="success" sx={{ mb: 3, bgcolor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}>{successMsg}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 3, bgcolor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required sx={{ mb: 2.5 }} autoComplete="email" />
            <TextField fullWidth label="Пароль" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required sx={{ mb: 3 }} autoComplete="current-password" />
            <Button type="submit" fullWidth variant="contained" size="large" disabled={loading} endIcon={!loading && <ArrowForwardIcon />}
              sx={{ mb: 3, py: 1.5, borderRadius: 2, fontSize: '1rem' }}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Увійти'}
            </Button>
            <Typography textAlign="center" variant="body2" color="text.secondary">
              Немає акаунту?{' '}
              <Link component={RouterLink} to="/register" fontWeight={700} sx={{ color: '#a855f7', '&:hover': { color: '#c084fc' } }}>
                Зареєструватися →
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default LoginPage

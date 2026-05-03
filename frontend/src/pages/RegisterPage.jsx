import { useState } from 'react'
import { Alert, Box, Button, CircularProgress, Link, TextField, Typography } from '@mui/material'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { usePageTitle } from '../hooks/usePageTitle'
import ComputerIcon from '@mui/icons-material/Computer'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import CheckIcon from '@mui/icons-material/Check'

const PERKS = [
  'Миттєве бронювання без черг',
  'QR-код підтвердження',
  'Промо-коди та знижки',
  'Продовження сесії онлайн',
  'Відгуки та рейтинги клубів',
]

const RegisterPage = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  usePageTitle('Реєстрація')
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) { setError('Паролі не співпадають'); return }
    if (form.password.length < 6) { setError('Пароль має бути не менше 6 символів'); return }
    setLoading(true)
    try {
      await register(form.username, form.email, form.password)
      navigate('/login', { state: { message: 'Реєстрація успішна! Тепер увійдіть.' } })
    } catch (err) {
      setError(err.response?.data?.detail || 'Помилка реєстрації')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', py: 4 }}>
      <Box sx={{
        display: 'flex', width: '100%', maxWidth: 900, borderRadius: 4, overflow: 'hidden',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        border: '1px solid rgba(99,102,241,0.25)',
      }}>

        {/* ── Left panel ── */}
        <Box sx={{
          display: { xs: 'none', md: 'flex' }, flex: 1,
          flexDirection: 'column', justifyContent: 'center',
          position: 'relative', overflow: 'hidden', p: 6,
          background: 'linear-gradient(160deg,#0a1240 0%,#1a0533 50%,#0a0a1a 100%)',
        }}>
          <Box sx={{ position: 'absolute', bottom: '20%', right: '15%', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle,rgba(99,102,241,0.2) 0%,transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />

          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 5 }}>
              <ComputerIcon sx={{ fontSize: 32, color: '#818cf8', filter: 'drop-shadow(0 0 10px #6366f1)' }} />
              <Typography variant="h5" fontWeight={800} sx={{ background: 'linear-gradient(135deg,#e2e8f0,#818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                ClubReserve
              </Typography>
            </Box>

            <Typography variant="h4" fontWeight={800} sx={{
              background: 'linear-gradient(135deg,#e2e8f0 0%,#818cf8 60%,#a855f7 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              mb: 2, lineHeight: 1.2,
            }}>
              Приєднуйся безкоштовно
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 5, lineHeight: 1.8 }}>
              Реєстрація займає менше хвилини.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {PERKS.map((p) => (
                <Box key={p} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{
                    width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg,#6366f1,#818cf8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 10px rgba(99,102,241,0.4)',
                  }}>
                    <CheckIcon sx={{ fontSize: 13, color: '#fff' }} />
                  </Box>
                  <Typography variant="body2" color="text.secondary">{p}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* ── Right panel (form) ── */}
        <Box sx={(theme) => ({
          flex: { xs: 1, md: '0 0 440px' }, p: { xs: 4, md: 6 },
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          background: theme.palette.mode === 'dark' ? 'rgba(12,12,20,0.95)' : '#ffffff',
        })}>
          <Box sx={{ display: { md: 'none', xs: 'flex' }, alignItems: 'center', gap: 1.5, mb: 4 }}>
            <ComputerIcon sx={{ color: '#818cf8', fontSize: 28 }} />
            <Typography variant="h6" fontWeight={800} sx={{ background: 'linear-gradient(135deg,#818cf8,#a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              ClubReserve
            </Typography>
          </Box>

          <Box sx={{ width: 48, height: 48, borderRadius: 2, background: 'linear-gradient(135deg,#4f46e5,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3, boxShadow: '0 0 20px rgba(99,102,241,0.4)' }}>
            <PersonAddIcon sx={{ color: 'white', fontSize: 22 }} />
          </Box>

          <Typography variant="h5" fontWeight={800} sx={{ mb: 0.5 }}>Реєстрація</Typography>
          <Typography color="text.secondary" variant="body2" sx={{ mb: 4 }}>Створіть акаунт у ClubReserve</Typography>

          {error && <Alert severity="error" sx={{ mb: 3, bgcolor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField fullWidth label="Ім'я користувача" name="username" value={form.username} onChange={handleChange} required autoComplete="username" />
            <TextField fullWidth label="Email" name="email" type="email" value={form.email} onChange={handleChange} required autoComplete="email" />
            <TextField fullWidth label="Пароль" name="password" type="password" value={form.password} onChange={handleChange} required autoComplete="new-password"
              helperText="Мінімум 6 символів" />
            <TextField fullWidth label="Підтвердіть пароль" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} required autoComplete="new-password" />
            <Button type="submit" fullWidth variant="contained" size="large" disabled={loading}
              endIcon={!loading && <ArrowForwardIcon />}
              sx={{ py: 1.5, borderRadius: 2, fontSize: '1rem', mt: 1,
                background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
                '&:hover': { background: 'linear-gradient(135deg,#4338ca,#6d28d9)', boxShadow: '0 0 25px rgba(99,102,241,0.5)' },
              }}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Зареєструватися'}
            </Button>
            <Typography textAlign="center" variant="body2" color="text.secondary">
              Вже є акаунт?{' '}
              <Link component={RouterLink} to="/login" fontWeight={700} sx={{ color: '#818cf8', '&:hover': { color: '#a5b4fc' } }}>
                Увійти →
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default RegisterPage

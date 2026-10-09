import { useState } from 'react'
import { Alert, Box, Button, Link, TextField, Typography } from '@mui/material'
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { usePageTitle } from '../hooks/usePageTitle'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import AuthShell from '../components/auth/AuthShell'
import { cr } from '../design/tokens'

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
    <AuthShell code="AUTH://LOGIN" title="Вхід у систему" subtitle="Введіть свої дані для доступу до бронювань." icon={<LockOutlinedIcon />}
      headline="З поверненням, гравцю"
      perks={["Реальний статус комп'ютерів", 'Промо-коди та знижки', 'QR-підтвердження бронювань', 'Продовження сесії онлайн']}>
      {successMsg && <Alert severity="success" sx={{ mb: 3 }}>{successMsg}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 3 }} role="alert">{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit} noValidate={false} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <TextField fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" error={Boolean(error)} />
        <TextField fullWidth label="Пароль" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" error={Boolean(error)} />
        <Button type="submit" fullWidth variant="contained" size="large" loading={loading} loadingPosition="end" endIcon={<ArrowForwardIcon />} sx={{ mt: 0.5 }}>
          {loading ? 'Перевірка доступу' : 'Увійти'}
        </Button>
        <Typography textAlign="center" variant="body2" sx={{ color: cr.muted }}>
          Немає акаунту?{' '}
          <Link component={RouterLink} to="/register" fontWeight={700}>Зареєструватися →</Link>
        </Typography>
      </Box>
    </AuthShell>
  )
}

export default LoginPage

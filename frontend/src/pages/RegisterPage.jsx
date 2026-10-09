import { useState } from 'react'
import { Alert, Box, Button, Link, TextField, Typography } from '@mui/material'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { usePageTitle } from '../hooks/usePageTitle'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import AuthShell from '../components/auth/AuthShell'
import { cr } from '../design/tokens'

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

  const mismatch = form.confirmPassword.length > 0 && form.password !== form.confirmPassword

  return (
    <AuthShell code="AUTH://REGISTER" title="Новий гравець" subtitle="Створіть акаунт у ClubReserve — це займе менше хвилини." icon={<PersonAddIcon />} accent={cr.cyan}
      headline="Приєднуйся до гри"
      perks={['Миттєве бронювання без черг', 'QR-код підтвердження', 'Бали лояльності та досягнення', 'Відгуки та рейтинги клубів']}>
      {error && <Alert severity="error" sx={{ mb: 3 }} role="alert">{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
        <TextField fullWidth label="Ім'я користувача" name="username" value={form.username} onChange={handleChange} required autoComplete="username" />
        <TextField fullWidth label="Email" name="email" type="email" value={form.email} onChange={handleChange} required autoComplete="email" />
        <TextField fullWidth label="Пароль" name="password" type="password" value={form.password} onChange={handleChange} required autoComplete="new-password"
          helperText="Мінімум 6 символів" />
        <TextField fullWidth label="Підтвердіть пароль" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} required autoComplete="new-password"
          error={mismatch} helperText={mismatch ? 'Паролі не співпадають' : ' '} />
        <Button type="submit" fullWidth variant="contained" size="large" loading={loading} loadingPosition="end" endIcon={<ArrowForwardIcon />}>
          {loading ? 'Створення профілю' : 'Зареєструватися'}
        </Button>
        <Typography textAlign="center" variant="body2" sx={{ color: cr.muted }}>
          Вже є акаунт?{' '}
          <Link component={RouterLink} to="/login" fontWeight={700}>Увійти →</Link>
        </Typography>
      </Box>
    </AuthShell>
  )
}

export default RegisterPage

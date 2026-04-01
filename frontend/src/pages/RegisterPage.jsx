import { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  CircularProgress,
} from '@mui/material'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import PersonAddIcon from '@mui/icons-material/PersonAdd'

const RegisterPage = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) {
      setError('Паролі не співпадають')
      return
    }
    if (form.password.length < 6) {
      setError('Пароль має бути не менше 6 символів')
      return
    }
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
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <Paper sx={{ p: 5, width: '100%', maxWidth: 440 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              bgcolor: 'secondary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <PersonAddIcon sx={{ color: 'white' }} />
          </Box>
          <Typography variant="h5" fontWeight={700}>
            Реєстрація
          </Typography>
          <Typography color="text.secondary" variant="body2" mt={0.5}>
            Створіть акаунт у ClubReserve
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Ім'я користувача"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
            autoComplete="username"
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
            autoComplete="email"
          />
          <TextField
            fullWidth
            label="Пароль"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
            autoComplete="new-password"
          />
          <TextField
            fullWidth
            label="Підтвердіть пароль"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            sx={{ mb: 3 }}
            autoComplete="new-password"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mb: 2 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Зареєструватися'}
          </Button>
          <Typography textAlign="center" variant="body2">
            Вже є акаунт?{' '}
            <Link component={RouterLink} to="/login" fontWeight={600}>
              Увійти
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  )
}

export default RegisterPage

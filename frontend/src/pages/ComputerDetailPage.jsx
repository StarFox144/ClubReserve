import { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Alert,
  Breadcrumbs,
  Link,
  Paper,
  TextField,
  Divider,
  Chip,
} from '@mui/material'
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import ComputerIcon from '@mui/icons-material/Computer'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import EventAvailableIcon from '@mui/icons-material/EventAvailable'
import { MOCK_COMPUTERS, MOCK_CLUBS } from '../mocks/data'

const ComputerDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [availabilityResult, setAvailabilityResult] = useState(null)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [bookingError, setBookingError] = useState('')

  // Find computer in mock data
  const computer = Object.values(MOCK_COMPUTERS)
    .flat()
    .find((c) => c.id === Number(id))

  const club = computer ? MOCK_CLUBS.find((cl) => cl.id === computer.club_id) : null

  if (!computer) {
    return <Alert severity="error">Комп'ютер не знайдено</Alert>
  }

  const canBook = computer.is_active && computer.status === 'free'

  const STATUS_COLORS = {
    free:        { color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.3)',  label: 'Вільний' },
    busy:        { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.3)',   label: 'Зайнятий' },
    maintenance: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', label: 'Тех. огляд' },
  }
  const statusCfg = STATUS_COLORS[computer.status] || STATUS_COLORS.free

  const handleCheckAvailability = (e) => {
    e.preventDefault()
    setAvailabilityResult(null)
    setBookingError('')
    setBookingSuccess(false)

    if (!startTime || !endTime) return
    if (new Date(endTime) <= new Date(startTime)) {
      setBookingError('Час завершення має бути пізніше за час початку')
      return
    }
    // Mock check — вільний якщо комп'ютер free
    setTimeout(() => {
      setAvailabilityResult({ available: canBook })
    }, 400)
  }

  const handleBook = () => {
    setBookingError('')
    // Mock booking
    setTimeout(() => {
      setBookingSuccess(true)
    }, 500)
  }

  return (
    <Box>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 3 }}>
        <Link
          component={RouterLink}
          to="/clubs"
          underline="hover"
          sx={{ color: 'text.secondary', '&:hover': { color: '#a855f7' } }}
        >
          Клуби
        </Link>
        {club && (
          <Link
            component={RouterLink}
            to={`/clubs/${club.id}`}
            underline="hover"
            sx={{ color: 'text.secondary', '&:hover': { color: '#a855f7' } }}
          >
            {club.name}
          </Link>
        )}
        <Typography
          sx={{
            background: 'linear-gradient(135deg, #a855f7, #818cf8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: 600,
          }}
        >
          {computer.name}
        </Typography>
      </Breadcrumbs>

      {/* Computer info */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 3,
          mb: 4,
          p: 3,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #12121a 0%, #1a0a2e 100%)',
          border: `1px solid ${statusCfg.border}`,
          boxShadow: `0 4px 24px ${statusCfg.bg}`,
        }}
      >
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            background: statusCfg.bg,
            border: `1px solid ${statusCfg.border}`,
            flexShrink: 0,
          }}
        >
          <ComputerIcon sx={{ fontSize: 48, color: statusCfg.color }} />
        </Box>

        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{
                background: 'linear-gradient(135deg, #e2e8f0, #a855f7)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {computer.name}
            </Typography>
            <Chip
              label={statusCfg.label}
              size="small"
              sx={{
                bgcolor: statusCfg.bg,
                color: statusCfg.color,
                border: `1px solid ${statusCfg.border}`,
                fontWeight: 600,
              }}
            />
          </Box>

          <Typography color="text.secondary" sx={{ mb: 1 }}>
            {computer.description}
          </Typography>

          {club && (
            <Typography variant="body2" color="text.disabled">
              Клуб: {club.name} · {club.address}
            </Typography>
          )}
        </Box>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Booking form */}
      <Paper
        sx={{
          p: 4,
          maxWidth: 500,
          background: 'linear-gradient(135deg, #12121a 0%, #1a1a2e 100%)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <EventAvailableIcon sx={{ color: '#a855f7' }} />
          <Typography variant="h6" fontWeight={700}>
            Перевірка та бронювання
          </Typography>
        </Box>

        {!canBook && (
          <Alert
            severity="warning"
            sx={{ mb: 3, bgcolor: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b' }}
          >
            Цей комп'ютер зараз недоступний для бронювання
          </Alert>
        )}

        {!isAuthenticated && (
          <Alert
            severity="info"
            sx={{ mb: 3, bgcolor: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8' }}
          >
            Для бронювання потрібно{' '}
            <Link component={RouterLink} to="/login" sx={{ color: '#a855f7' }}>
              увійти в акаунт
            </Link>
          </Alert>
        )}

        <Box component="form" onSubmit={handleCheckAvailability}>
          <TextField
            fullWidth
            label="Час початку"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            disabled={!canBook}
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Час завершення"
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
            disabled={!canBook}
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
          />
          <Button
            type="submit"
            variant="outlined"
            fullWidth
            disabled={!canBook}
            sx={{ mb: 2 }}
          >
            Перевірити доступність
          </Button>
        </Box>

        {availabilityResult && (
          <Alert
            severity={availabilityResult.available ? 'success' : 'warning'}
            icon={availabilityResult.available ? <CheckCircleIcon /> : undefined}
            sx={{
              mb: 2,
              ...(availabilityResult.available
                ? { bgcolor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }
                : { bgcolor: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b' }),
            }}
          >
            {availabilityResult.available
              ? "Комп'ютер доступний! Можна бронювати."
              : "Комп'ютер вже зайнятий на цей час"}
          </Alert>
        )}

        {bookingError && (
          <Alert severity="error" sx={{ mb: 2, bgcolor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
            {bookingError}
          </Alert>
        )}

        {bookingSuccess && (
          <Alert severity="success" sx={{ mb: 2, bgcolor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}>
            Бронювання успішно створено!{' '}
            <Link component={RouterLink} to="/bookings" sx={{ color: '#10b981', fontWeight: 600 }}>
              Переглянути мої бронювання
            </Link>
          </Alert>
        )}

        {isAuthenticated && availabilityResult?.available && !bookingSuccess && (
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handleBook}
            sx={{ mt: 1 }}
          >
            Забронювати
          </Button>
        )}
      </Paper>
    </Box>
  )
}

export default ComputerDetailPage

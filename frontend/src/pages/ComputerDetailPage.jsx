import { useState, useEffect } from 'react'
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
  CircularProgress,
} from '@mui/material'
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import ComputerIcon from '@mui/icons-material/Computer'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import EventAvailableIcon from '@mui/icons-material/EventAvailable'
import { getComputer, checkAvailability } from '../api/computers'
import { getClub } from '../api/clubs'
import { createBooking } from '../api/bookings'

const STATUS_COLORS = {
  free:        { color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.3)',  label: 'Вільний' },
  busy:        { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.3)',   label: 'Зайнятий' },
  maintenance: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', label: 'Тех. огляд' },
}

const ComputerDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const [computer, setComputer] = useState(null)
  const [club, setClub] = useState(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [pageError, setPageError] = useState('')

  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [availabilityResult, setAvailabilityResult] = useState(null)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [checking, setChecking] = useState(false)
  const [booking, setBooking] = useState(false)

  useEffect(() => {
    getComputer(id)
      .then(async (comp) => {
        setComputer(comp)
        try {
          const clubData = await getClub(comp.club_id)
          setClub(clubData)
        } catch {
          // club info is optional for display
        }
      })
      .catch(() => setPageError("Комп'ютер не знайдено"))
      .finally(() => setPageLoading(false))
  }, [id])

  const handleCheckAvailability = async (e) => {
    e.preventDefault()
    setAvailabilityResult(null)
    setBookingError('')
    setBookingSuccess(false)

    if (!startTime || !endTime) return
    if (new Date(endTime) <= new Date(startTime)) {
      setBookingError('Час завершення має бути пізніше за час початку')
      return
    }

    setChecking(true)
    try {
      const result = await checkAvailability(id, startTime, endTime)
      setAvailabilityResult(result)
    } catch {
      setBookingError('Помилка перевірки доступності')
    } finally {
      setChecking(false)
    }
  }

  const handleBook = async () => {
    setBookingError('')
    setBooking(true)
    try {
      await createBooking(Number(id), startTime, endTime)
      setBookingSuccess(true)
      setAvailabilityResult(null)
    } catch (e) {
      const detail = e.response?.data?.detail || ''
      if (e.response?.status === 409 || detail.toLowerCase().includes('already booked')) {
        setBookingError('Цей час вже зайнятий іншим користувачем. Оберіть інший час.')
      } else {
        setBookingError(detail || 'Помилка при бронюванні')
      }
    } finally {
      setBooking(false)
    }
  }

  if (pageLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress sx={{ color: '#a855f7' }} />
      </Box>
    )
  }

  if (pageError || !computer) {
    return <Alert severity="error">{pageError || "Комп'ютер не знайдено"}</Alert>
  }

  const canBook = computer.is_active
  const statusCfg = canBook ? STATUS_COLORS.free : STATUS_COLORS.maintenance

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
            onChange={(e) => {
              setStartTime(e.target.value)
              setAvailabilityResult(null)
              setBookingSuccess(false)
            }}
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
            onChange={(e) => {
              setEndTime(e.target.value)
              setAvailabilityResult(null)
              setBookingSuccess(false)
            }}
            required
            disabled={!canBook}
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
          />
          <Button
            type="submit"
            variant="outlined"
            fullWidth
            disabled={!canBook || checking}
            sx={{ mb: 2 }}
            startIcon={checking ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {checking ? 'Перевірка...' : 'Перевірити доступність'}
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
                : { bgcolor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }),
            }}
          >
            {availabilityResult.available
              ? "Комп'ютер вільний на обраний час!"
              : "Цей час вже зайнятий. Оберіть інший час."}
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
            disabled={booking}
            startIcon={booking ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{ mt: 1 }}
          >
            {booking ? 'Бронювання...' : 'Забронювати'}
          </Button>
        )}
      </Paper>
    </Box>
  )
}

export default ComputerDetailPage

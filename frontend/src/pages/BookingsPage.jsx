import { useState } from 'react'
import {
  Box,
  Typography,
  Alert,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Grid,
  Divider,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import EventIcon from '@mui/icons-material/Event'
import ComputerIcon from '@mui/icons-material/Computer'
import CancelIcon from '@mui/icons-material/Cancel'
import StorefrontIcon from '@mui/icons-material/Storefront'
import { MOCK_BOOKINGS } from '../mocks/data'

const STATUS_CONFIG = {
  active:    { label: 'Активне',    color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.3)' },
  completed: { label: 'Завершене',  color: '#818cf8', bg: 'rgba(129,140,248,0.1)', border: 'rgba(129,140,248,0.3)' },
  cancelled: { label: 'Скасоване',  color: '#6b7280', bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.3)' },
}

const formatDateTime = (dt) =>
  new Date(dt).toLocaleString('uk-UA', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

const getDuration = (start, end) => {
  const diff = (new Date(end) - new Date(start)) / 1000 / 60
  const h = Math.floor(diff / 60)
  const m = diff % 60
  return h > 0 ? `${h} год${m > 0 ? ` ${m} хв` : ''}` : `${m} хв`
}

const BookingsPage = () => {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState(MOCK_BOOKINGS)

  const handleCancel = (id) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b))
    )
  }

  const activeBookings = bookings.filter((b) => b.status === 'active')
  const archiveBookings = bookings.filter((b) => b.status !== 'active')

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          fontWeight={700}
          gutterBottom
          sx={{
            background: 'linear-gradient(135deg, #e2e8f0, #a855f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Мої бронювання
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {[
            { label: 'Всього',     value: bookings.length,         color: '#a855f7' },
            { label: 'Активних',   value: activeBookings.length,   color: '#10b981' },
            { label: 'В архіві',   value: archiveBookings.length,  color: '#6b7280' },
          ].map((s) => (
            <Box
              key={s.label}
              sx={{
                px: 2.5, py: 1,
                borderRadius: 2,
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${s.color}33`,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Typography fontWeight={700} sx={{ color: s.color }}>{s.value}</Typography>
              <Typography variant="body2" color="text.secondary">{s.label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {bookings.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <EventIcon sx={{ fontSize: 72, color: 'rgba(147,51,234,0.2)', mb: 2 }} />
          <Typography color="text.secondary" variant="h6">У вас ще немає бронювань</Typography>
          <Button variant="contained" sx={{ mt: 3 }} onClick={() => navigate('/clubs')}>
            Знайти клуб
          </Button>
        </Box>
      )}

      {activeBookings.length > 0 && (
        <Box sx={{ mb: 5 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: '#10b981' }}>
            Активні бронювання
          </Typography>
          <Grid container spacing={2}>
            {activeBookings.map((booking) => (
              <Grid item xs={12} sm={6} md={4} key={booking.id}>
                <BookingCard booking={booking} onCancel={handleCancel} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {archiveBookings.length > 0 && (
        <>
          <Divider sx={{ mb: 4 }} />
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: 'text.secondary' }}>
            Архів
          </Typography>
          <Grid container spacing={2}>
            {archiveBookings.map((booking) => (
              <Grid item xs={12} sm={6} md={4} key={booking.id}>
                <BookingCard booking={booking} />
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Box>
  )
}

const BookingCard = ({ booking, onCancel }) => {
  const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.active
  const isActive = booking.status === 'active'

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: `1px solid ${cfg.border}`,
        transition: 'transform 0.2s',
        ...(isActive && { '&:hover': { transform: 'translateY(-3px)' } }),
        opacity: isActive ? 1 : 0.65,
      }}
    >
      <Box
        sx={{
          px: 2, py: 1.5,
          background: cfg.bg,
          borderBottom: `1px solid ${cfg.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <ComputerIcon sx={{ fontSize: 16, color: cfg.color }} />
          <Typography variant="subtitle2" fontWeight={700} sx={{ color: cfg.color }}>
            {booking.computer_name}
          </Typography>
        </Box>
        <Chip
          label={cfg.label}
          size="small"
          sx={{
            bgcolor: cfg.bg,
            color: cfg.color,
            border: `1px solid ${cfg.border}`,
            fontSize: '0.7rem',
            height: 22,
          }}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
          <StorefrontIcon sx={{ fontSize: 14, color: '#a855f7' }} />
          <Typography variant="body2" fontWeight={600} color="text.primary">
            {booking.club_name}
          </Typography>
        </Box>

        <Divider sx={{ mb: 1.5 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <EventIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
            <Typography variant="body2" color="text.secondary">
              {formatDateTime(booking.start_time)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <EventIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
            <Typography variant="body2" color="text.secondary">
              {formatDateTime(booking.end_time)}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.disabled">
            Тривалість: {getDuration(booking.start_time, booking.end_time)}
          </Typography>
        </Box>
      </CardContent>

      {isActive && onCancel && (
        <CardActions sx={{ px: 2, pb: 2 }}>
          <Button
            variant="outlined"
            fullWidth
            size="small"
            startIcon={<CancelIcon />}
            onClick={() => onCancel(booking.id)}
            sx={{
              borderColor: 'rgba(239,68,68,0.4)',
              color: '#ef4444',
              '&:hover': {
                borderColor: '#ef4444',
                bgcolor: 'rgba(239,68,68,0.08)',
              },
            }}
          >
            Скасувати
          </Button>
        </CardActions>
      )}
    </Card>
  )
}

export default BookingsPage

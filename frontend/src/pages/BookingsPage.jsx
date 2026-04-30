import { useState, useEffect } from 'react'
import {
  Alert, Box, Button, Card, CardActions, CardContent, Chip,
  CircularProgress, Dialog, DialogContent, DialogTitle,
  Divider, Grid, IconButton, Tab, Tabs, Tooltip, Typography,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import EventIcon from '@mui/icons-material/Event'
import ComputerIcon from '@mui/icons-material/Computer'
import CancelIcon from '@mui/icons-material/Cancel'
import StorefrontIcon from '@mui/icons-material/Storefront'
import QrCodeIcon from '@mui/icons-material/QrCode'
import AddTimeIcon from '@mui/icons-material/MoreTime'
import CloseIcon from '@mui/icons-material/Close'
import { getMyBookings, cancelBooking, extendBooking } from '../api/bookings'

const STATUS_CONFIG = {
  active:    { label: 'Активне',   color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.3)' },
  completed: { label: 'Завершене', color: '#818cf8', bg: 'rgba(129,140,248,0.1)', border: 'rgba(129,140,248,0.3)' },
  cancelled: { label: 'Скасоване', color: '#6b7280', bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.3)' },
}
const TABS = [
  { value: 'all', label: 'Всі' },
  { value: 'active', label: 'Активні' },
  { value: 'completed', label: 'Завершені' },
  { value: 'cancelled', label: 'Скасовані' },
]

const fmt = (dt) => new Date(dt).toLocaleString('uk-UA', {
  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
})
const duration = (start, end) => {
  const m = (new Date(end) - new Date(start)) / 60000
  const h = Math.floor(m / 60); const min = m % 60
  return h > 0 ? `${h} год${min > 0 ? ` ${min} хв` : ''}` : `${min} хв`
}

const BookingsPage = () => {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('all')
  const [qrBooking, setQrBooking] = useState(null)

  useEffect(() => {
    getMyBookings().then(setBookings).catch(() => setError('Не вдалося завантажити бронювання')).finally(() => setLoading(false))
  }, [])

  const handleCancel = async (id) => {
    try {
      await cancelBooking(id)
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: 'cancelled' } : b))
    } catch (e) { setError(e.response?.data?.detail || 'Помилка при скасуванні') }
  }

  const handleExtend = async (id, hours) => {
    try {
      const updated = await extendBooking(id, hours)
      setBookings((prev) => prev.map((b) => b.id === id ? updated : b))
    } catch (e) { setError(e.response?.data?.detail || 'Не вдалося продовжити бронювання') }
  }

  const filtered = tab === 'all' ? bookings : bookings.filter((b) => b.status === tab)
  const counts = { all: bookings.length, active: bookings.filter(b => b.status === 'active').length, completed: bookings.filter(b => b.status === 'completed').length, cancelled: bookings.filter(b => b.status === 'cancelled').length }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress sx={{ color: '#a855f7' }} /></Box>

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ background: 'linear-gradient(135deg,#e2e8f0,#a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Мої бронювання
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
          {[{ label: 'Всього', value: counts.all, color: '#a855f7' }, { label: 'Активних', value: counts.active, color: '#10b981' }, { label: 'Завершених', value: counts.completed, color: '#818cf8' }, { label: 'Скасованих', value: counts.cancelled, color: '#6b7280' }].map((s) => (
            <Box key={s.label} sx={{ px: 2.5, py: 1, borderRadius: 2, background: 'rgba(147,51,234,0.04)', border: `1px solid ${s.color}33`, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography fontWeight={700} sx={{ color: s.color }}>{s.value}</Typography>
              <Typography variant="body2" color="text.secondary">{s.label}</Typography>
            </Box>
          ))}
        </Box>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, minHeight: 40 }, '& .MuiTabs-indicator': { backgroundColor: '#a855f7' }, '& .Mui-selected': { color: '#a855f7 !important' }, borderBottom: '1px solid rgba(147,51,234,0.2)' }}>
          {TABS.map((t) => <Tab key={t.value} value={t.value} label={`${t.label}${counts[t.value] > 0 ? ` (${counts[t.value]})` : ''}`} />)}
        </Tabs>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}

      {filtered.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <EventIcon sx={{ fontSize: 72, color: 'rgba(147,51,234,0.2)', mb: 2 }} />
          <Typography color="text.secondary" variant="h6">{tab === 'all' ? 'У вас ще немає бронювань' : 'Немає бронювань з таким статусом'}</Typography>
          {tab === 'all' && <Button variant="contained" sx={{ mt: 3 }} onClick={() => navigate('/clubs')}>Знайти клуб</Button>}
        </Box>
      )}

      <Grid container spacing={2}>
        {filtered.map((booking) => (
          <Grid item xs={12} sm={6} md={4} key={booking.id}>
            <BookingCard booking={booking} onCancel={handleCancel} onExtend={handleExtend} onQr={setQrBooking} />
          </Grid>
        ))}
      </Grid>

      {/* QR Dialog */}
      <Dialog open={Boolean(qrBooking)} onClose={() => setQrBooking(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>QR-код бронювання</Box>
          <IconButton size="small" onClick={() => setQrBooking(null)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pb: 4 }}>
          {qrBooking && (
            <>
              <Box sx={{ p: 2, bgcolor: '#fff', borderRadius: 2, mb: 2 }}>
                <QRCodeSVG
                  value={`ClubReserve\n#${qrBooking.id}\n${qrBooking.computer_name ?? `PC #${qrBooking.computer_id}`}\n${qrBooking.club_name ?? ''}\n${fmt(qrBooking.start_time)} → ${fmt(qrBooking.end_time)}`}
                  size={200}
                  level="M"
                />
              </Box>
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#a855f7' }}>
                {qrBooking.computer_name ?? `PC #${qrBooking.computer_id}`}
              </Typography>
              {qrBooking.club_name && <Typography variant="body2" color="text.secondary">{qrBooking.club_name}</Typography>}
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                {fmt(qrBooking.start_time)} → {fmt(qrBooking.end_time)}
              </Typography>
              <Typography variant="caption" color="text.disabled">#{qrBooking.id}</Typography>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  )
}

const BookingCard = ({ booking, onCancel, onExtend, onQr }) => {
  const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.active
  const isActive = booking.status === 'active'
  const [extending, setExtending] = useState(false)

  const handleExtend = async (h) => {
    setExtending(true)
    await onExtend(booking.id, h)
    setExtending(false)
  }

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: `1px solid ${cfg.border}`, transition: 'transform 0.2s', ...(isActive && { '&:hover': { transform: 'translateY(-3px)' } }), opacity: isActive ? 1 : 0.7 }}>
      <Box sx={{ px: 2, py: 1.5, background: cfg.bg, borderBottom: `1px solid ${cfg.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <ComputerIcon sx={{ fontSize: 16, color: cfg.color }} />
          <Typography variant="subtitle2" fontWeight={700} sx={{ color: cfg.color }}>
            {booking.computer_name ?? `PC #${booking.computer_id}`}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Chip label={cfg.label} size="small" sx={{ bgcolor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, fontSize: '0.7rem', height: 22 }} />
          <Tooltip title="QR-код">
            <IconButton size="small" onClick={() => onQr(booking)} sx={{ color: '#a855f7', p: 0.25 }}>
              <QrCodeIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <CardContent sx={{ flexGrow: 1, py: 2 }}>
        {booking.club_name && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
            <StorefrontIcon sx={{ fontSize: 14, color: '#a855f7' }} />
            <Typography variant="body2" fontWeight={600}>{booking.club_name}</Typography>
          </Box>
        )}
        <Divider sx={{ mb: 1.5 }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <EventIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
            <Typography variant="body2" color="text.secondary">{fmt(booking.start_time)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <EventIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
            <Typography variant="body2" color="text.secondary">{fmt(booking.end_time)}</Typography>
          </Box>
          <Typography variant="caption" color="text.disabled">Тривалість: {duration(booking.start_time, booking.end_time)}</Typography>
          {booking.promo_code && (
            <Chip label={`Промо: ${booking.promo_code}`} size="small" sx={{ bgcolor: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', mt: 0.5, alignSelf: 'flex-start', fontSize: '0.7rem', height: 20 }} />
          )}
        </Box>
      </CardContent>

      {isActive && (
        <CardActions sx={{ px: 2, pb: 2, flexDirection: 'column', gap: 1 }}>
          {/* Extend buttons */}
          <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
            {[1, 2].map((h) => (
              <Button key={h} size="small" variant="outlined" fullWidth disabled={extending}
                startIcon={extending ? <CircularProgress size={12} /> : <AddTimeIcon />}
                onClick={() => handleExtend(h)}
                sx={{ borderColor: 'rgba(168,85,247,0.4)', color: '#a855f7', '&:hover': { borderColor: '#a855f7', bgcolor: 'rgba(168,85,247,0.06)' }, fontSize: '0.75rem' }}
              >
                +{h} год
              </Button>
            ))}
          </Box>
          <Button variant="outlined" fullWidth size="small" startIcon={<CancelIcon />} onClick={() => onCancel(booking.id)}
            sx={{ borderColor: 'rgba(239,68,68,0.4)', color: '#ef4444', '&:hover': { borderColor: '#ef4444', bgcolor: 'rgba(239,68,68,0.08)' } }}>
            Скасувати
          </Button>
        </CardActions>
      )}
    </Card>
  )
}

export default BookingsPage

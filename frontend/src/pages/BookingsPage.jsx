import { useState, useEffect, useRef } from 'react'
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
import { usePageTitle } from '../hooks/usePageTitle'
import DownloadIcon from '@mui/icons-material/Download'

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

const exportCSV = (bookings) => {
  const rows = [
    ['ID', 'Клуб', "Комп'ютер", 'Початок', 'Кінець', 'Статус', 'Промо-код'],
    ...bookings.map((b) => [
      b.id,
      b.club_name || '',
      b.computer_name || `PC #${b.computer_id}`,
      new Date(b.start_time).toLocaleString('uk-UA'),
      new Date(b.end_time).toLocaleString('uk-UA'),
      b.status,
      b.promo_code || '',
    ]),
  ]
  const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'bookings.csv'; a.click()
  URL.revokeObjectURL(url)
}

const downloadPDF = (booking, qrRef) => {
  const svgEl = qrRef.current?.querySelector('svg')
  const svgStr = svgEl ? new XMLSerializer().serializeToString(svgEl) : ''
  const svgDataUrl = svgStr ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgStr)}` : ''
  const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.active

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<title>Бронювання #${booking.id} — ClubReserve</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Arial,sans-serif;padding:40px;color:#1a1a2e;background:#fff}
  .brand{text-align:center;margin-bottom:28px}
  .brand-name{font-size:22px;font-weight:bold;color:#7c3aed}
  .brand-sub{color:#6b7280;font-size:13px;margin-top:3px}
  .card{border:2px solid #e9d5ff;border-radius:12px;padding:28px;max-width:380px;margin:0 auto}
  .qr{text-align:center;margin-bottom:20px}
  .qr img{width:180px;height:180px}
  .row{display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid #f3f4f6;font-size:14px}
  .row:last-child{border-bottom:none}
  .lbl{color:#6b7280}
  .val{font-weight:600;text-align:right;max-width:55%}
  .status{padding:2px 10px;border-radius:20px;font-size:12px;font-weight:600;background:#d1fae5;color:#065f46}
  .promo{padding:2px 10px;border-radius:20px;font-size:12px;font-weight:600;background:#ede9fe;color:#6d28d9}
  .footer{text-align:center;color:#9ca3af;font-size:11px;margin-top:16px}
  @media print{body{padding:20px}}
</style></head><body>
<div class="brand"><div class="brand-name">ClubReserve</div><div class="brand-sub">Підтвердження бронювання</div></div>
<div class="card">
  <div class="qr">${svgDataUrl ? `<img src="${svgDataUrl}" alt="QR"/>` : ''}</div>
  <div class="row"><span class="lbl">Комп'ютер</span><span class="val">${booking.computer_name ?? `PC #${booking.computer_id}`}</span></div>
  ${booking.club_name ? `<div class="row"><span class="lbl">Клуб</span><span class="val">${booking.club_name}</span></div>` : ''}
  <div class="row"><span class="lbl">Початок</span><span class="val">${fmt(booking.start_time)}</span></div>
  <div class="row"><span class="lbl">Кінець</span><span class="val">${fmt(booking.end_time)}</span></div>
  <div class="row"><span class="lbl">Тривалість</span><span class="val">${duration(booking.start_time, booking.end_time)}</span></div>
  <div class="row"><span class="lbl">Статус</span><span class="val"><span class="status">${cfg.label}</span></span></div>
  ${booking.promo_code ? `<div class="row"><span class="lbl">Промо-код</span><span class="val"><span class="promo">${booking.promo_code}</span></span></div>` : ''}
  <div class="footer">#${booking.id}</div>
</div>
<script>window.onload=function(){window.print()}<\/script>
</body></html>`

  const w = window.open('', '_blank', 'width=520,height=720')
  if (w) { w.document.write(html); w.document.close() }
}

const BookingsPage = () => {
  usePageTitle('Мої бронювання')
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('all')
  const [qrBooking, setQrBooking] = useState(null)
  const qrRef = useRef()

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
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5, mb: 3, maxWidth: { sm: 'max-content' } }}>
          {[{ label: 'Всього', value: counts.all, color: '#a855f7' }, { label: 'Активних', value: counts.active, color: '#10b981' }, { label: 'Завершених', value: counts.completed, color: '#818cf8' }, { label: 'Скасованих', value: counts.cancelled, color: '#6b7280' }].map((s) => (
            <Box key={s.label} sx={{ px: 2, py: 1, borderRadius: 2, background: 'rgba(147,51,234,0.04)', border: `1px solid ${s.color}33`, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography fontWeight={700} sx={{ color: s.color }}>{s.value}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>{s.label}</Typography>
            </Box>
          ))}
        </Box>
        {bookings.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
            <Button size="small" startIcon={<DownloadIcon />} onClick={() => exportCSV(filtered)}
              sx={{ color: 'text.secondary', '&:hover': { color: '#a855f7' } }}>
              Експорт CSV
            </Button>
          </Box>
        )}
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, minHeight: 40, fontSize: { xs: '0.8rem', sm: '0.875rem' } }, '& .MuiTabs-indicator': { backgroundColor: '#a855f7' }, '& .Mui-selected': { color: '#a855f7 !important' }, borderBottom: '1px solid rgba(147,51,234,0.2)' }}>
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
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pb: 3 }}>
          {qrBooking && (
            <>
              <Box ref={qrRef} sx={{ p: 2, bgcolor: '#fff', borderRadius: 2, mb: 2 }}>
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
              <Button
                variant="outlined" fullWidth startIcon={<DownloadIcon />}
                onClick={() => downloadPDF(qrBooking, qrRef)}
                sx={{ mt: 2.5, borderColor: 'rgba(147,51,234,0.4)', color: '#a855f7', '&:hover': { borderColor: '#a855f7', bgcolor: 'rgba(168,85,247,0.06)' } }}
              >
                Завантажити PDF
              </Button>
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

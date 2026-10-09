import { useState, useEffect, useRef } from 'react'
import {
  Alert, Box, Button, Dialog, DialogContent,
  IconButton, Skeleton, Tab, Tabs, Tooltip, Typography,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import CancelIcon from '@mui/icons-material/Cancel'
import StorefrontIcon from '@mui/icons-material/Storefront'
import QrCodeIcon from '@mui/icons-material/QrCode'
import AddTimeIcon from '@mui/icons-material/MoreTime'
import CloseIcon from '@mui/icons-material/Close'
import DownloadIcon from '@mui/icons-material/Download'
import { getMyBookings, cancelBooking, extendBooking } from '../api/bookings'
import { usePageTitle } from '../hooks/usePageTitle'
import { cr, font, tint, STATUS } from '../design/tokens'
import { EmptyState, GlassCard, HudStat, Mono, Reveal, SectionHeader, StatusBadge } from '../components/ui'

const TABS = [
  { value: 'all', label: 'Всі' },
  { value: 'active', label: 'Активні' },
  { value: 'completed', label: 'Минулі' },
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
  const cfg = STATUS[booking.status] || STATUS.active

  // Printable document: intentionally uses fixed print-friendly colors
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

// Ticking clock for countdowns (only runs while needed)
const useNow = (enabled) => {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!enabled) return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [enabled])
  return now
}

const hms = (ms) => {
  const s = Math.max(0, Math.floor(ms / 1000))
  const d = Math.floor(s / 86400)
  const hh = String(Math.floor((s % 86400) / 3600)).padStart(2, '0')
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return `${d > 0 ? `${d}д ` : ''}${hh}:${mm}:${ss}`
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
  const now = useNow(counts.active > 0)

  return (
    <Box>
      <SectionHeader
        component="h1"
        label="Особистий кабінет"
        title="Мої бронювання"
        size="md"
        action={bookings.length > 0 && (
          <Button variant="outlined" size="small" startIcon={<DownloadIcon />} onClick={() => exportCSV(filtered)}>
            Експорт CSV
          </Button>
        )}
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: { xs: 1.5, md: 2 }, mb: 4 }}>
        {[
          { label: 'Всього', value: counts.all, accent: cr.primary2 },
          { label: 'Активних', value: counts.active, accent: cr.success },
          { label: 'Минулих', value: counts.completed, accent: cr.cyan },
          { label: 'Скасованих', value: counts.cancelled, accent: cr.faint },
        ].map((s) => (
          <HudStat key={s.label} compact hud={false} label={s.label} value={loading ? '—' : s.value} accent={s.accent} />
        ))}
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" allowScrollButtonsMobile sx={{ mb: 3 }} aria-label="Фільтр бронювань">
        {TABS.map((t) => (
          <Tab key={t.value} value={t.value} label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {t.label}
              {counts[t.value] > 0 && <Mono sx={{ fontSize: '0.7rem', px: 0.75, borderRadius: '6px', bgcolor: tint(cr.primary, 15), color: cr.primaryText }}>{counts[t.value]}</Mono>}
            </Box>
          } />
        ))}
      </Tabs>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' }, gap: 2 }}>
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} variant="rounded" height={200} />)}
        </Box>
      ) : filtered.length === 0 ? (
        <GlassCard>
          <EmptyState
            art="calendar"
            title={tab === 'all' ? 'У вас ще немає бронювань' : 'Немає бронювань з таким статусом'}
            text={tab === 'all' ? 'Обери клуб і забронюй своє перше місце — це займе хвилину.' : undefined}
            action={tab === 'all' && <Button variant="contained" onClick={() => navigate('/clubs')}>Знайти клуб</Button>}
          />
        </GlassCard>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' }, gap: 2 }}>
          {filtered.map((booking, i) => (
            <Reveal key={booking.id} delay={(i % 2) * 70}>
              <BookingTicket booking={booking} now={now} onCancel={handleCancel} onExtend={handleExtend} onQr={setQrBooking} />
            </Reveal>
          ))}
        </Box>
      )}

      {/* QR Dialog */}
      <Dialog open={Boolean(qrBooking)} onClose={() => setQrBooking(null)} maxWidth="xs" fullWidth aria-labelledby="qr-title">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, pt: 2.5 }}>
          <Box>
            <Typography sx={{ fontFamily: font.mono, fontSize: '0.68rem', letterSpacing: '0.18em', color: cr.cyanText }}>ACCESS://QR</Typography>
            <Typography id="qr-title" component="h2" sx={{ fontFamily: font.display, fontWeight: 700, fontSize: '1.1rem' }}>QR-код бронювання</Typography>
          </Box>
          <IconButton size="small" onClick={() => setQrBooking(null)} aria-label="Закрити"><CloseIcon /></IconButton>
        </Box>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pb: 3, pt: 2.5 }}>
          {qrBooking && (
            <>
              {/* QR stays dark-on-white for scanner reliability */}
              <Box ref={qrRef} sx={{ position: 'relative', p: 2, bgcolor: '#fff', borderRadius: '14px', mb: 2.5, boxShadow: `0 0 0 1px ${cr.cyan}, 0 0 30px ${tint(cr.cyan, 40)}` }}>
                <QRCodeSVG
                  value={`ClubReserve\n#${qrBooking.id}\n${qrBooking.computer_name ?? `PC #${qrBooking.computer_id}`}\n${qrBooking.club_name ?? ''}\n${fmt(qrBooking.start_time)} → ${fmt(qrBooking.end_time)}`}
                  size={200}
                  level="M"
                />
              </Box>
              <Mono sx={{ fontWeight: 700, fontSize: '1.2rem', color: cr.text }}>
                {qrBooking.computer_name ?? `PC #${qrBooking.computer_id}`}
              </Mono>
              {qrBooking.club_name && <Typography variant="body2" sx={{ color: cr.muted }}>{qrBooking.club_name}</Typography>}
              <Mono sx={{ mt: 1, fontSize: '0.82rem', color: cr.cyanText, textAlign: 'center' }}>
                {fmt(qrBooking.start_time)} → {fmt(qrBooking.end_time)}
              </Mono>
              <Mono sx={{ fontSize: '0.72rem', color: cr.faint }}>#{qrBooking.id}</Mono>
              <Button variant="outlined" fullWidth startIcon={<DownloadIcon />} onClick={() => downloadPDF(qrBooking, qrRef)} sx={{ mt: 2.5 }}>
                Завантажити PDF
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  )
}

const BookingTicket = ({ booking, now, onCancel, onExtend, onQr }) => {
  const cfg = STATUS[booking.status] || STATUS.active
  const isActive = booking.status === 'active'
  const [extending, setExtending] = useState(false)

  const handleExtend = async (h) => {
    setExtending(true)
    await onExtend(booking.id, h)
    setExtending(false)
  }

  const start = new Date(booking.start_time).getTime()
  const end = new Date(booking.end_time).getTime()
  const countdown = isActive
    ? now < start
      ? { label: 'До початку', value: hms(start - now), color: cr.cyan, text: cr.cyanText }
      : now < end
        ? { label: 'Сесія триває · залишилось', value: hms(end - now), color: cr.success, text: cr.successText }
        : null
    : null

  const pcName = booking.computer_name ?? `PC #${booking.computer_id}`
  const startD = new Date(booking.start_time)
  const endD = new Date(booking.end_time)

  return (
    <Box
      component="article"
      aria-label={`Бронювання ${pcName}, ${cfg.label}`}
      sx={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '132px 1fr' },
        borderRadius: '18px',
        border: `1px solid ${isActive ? tint(cfg.color, 45) : cr.border}`,
        background: cr.glass,
        backdropFilter: 'blur(16px)',
        opacity: isActive ? 1 : 0.78,
        boxShadow: isActive ? `0 0 26px ${tint(cfg.color, 14)}` : 'none',
        overflow: 'hidden',
        transition: 'transform 300ms var(--cr-ease), box-shadow 300ms var(--cr-ease)',
        '@media (hover: hover)': isActive ? { '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 0 34px ${tint(cfg.color, 24)}` } } : {},
      }}
    >
      {/* Stub */}
      <Box sx={{
        position: 'relative',
        p: 2,
        display: 'flex',
        flexDirection: { xs: 'row', sm: 'column' },
        alignItems: { xs: 'center', sm: 'flex-start' },
        justifyContent: 'space-between',
        gap: 1,
        bgcolor: tint(cfg.color, 8),
        borderRight: { sm: `2px dashed ${tint(cfg.color, 35)}` },
        borderBottom: { xs: `2px dashed ${tint(cfg.color, 35)}`, sm: 'none' },
      }}>
        <Box>
          <Typography sx={{ fontFamily: font.mono, fontSize: '0.6rem', letterSpacing: '0.2em', color: cr.faint }}>МІСЦЕ</Typography>
          <Mono sx={{ display: 'block', fontSize: '1.35rem', fontWeight: 700, color: cr.text, lineHeight: 1.15, textShadow: `0 0 14px ${tint(cfg.color, 50)}`, wordBreak: 'break-word' }}>
            {pcName}
          </Mono>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'row', sm: 'column' }, alignItems: { xs: 'center', sm: 'flex-start' }, gap: 1 }}>
          <StatusBadge status={booking.status} />
          <Mono sx={{ fontSize: '0.68rem', color: cr.faint }}>#{String(booking.id).padStart(5, '0')}</Mono>
        </Box>
      </Box>

      {/* Body */}
      <Box sx={{ p: 2.25, display: 'flex', flexDirection: 'column', gap: 1.5, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          {booking.club_name ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
              <StorefrontIcon sx={{ fontSize: 16, color: cr.primaryText }} />
              <Typography fontWeight={700} noWrap>{booking.club_name}</Typography>
            </Box>
          ) : <span />}
          <Tooltip title="QR-код">
            <IconButton size="small" onClick={() => onQr(booking)} aria-label={`QR-код бронювання ${pcName}`} sx={{ color: cr.cyanText, border: `1px solid ${tint(cr.cyan, 35)}`, borderRadius: '10px' }}>
              <QrCodeIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, auto)', justifyContent: 'start', columnGap: 3, rowGap: 0.5 }}>
          {[
            ['Дата', startD.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: '2-digit' })],
            ['Час', `${startD.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}–${endD.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}`],
            ['Тривалість', duration(booking.start_time, booking.end_time)],
          ].map(([l, v]) => (
            <Box key={l}>
              <Typography sx={{ fontFamily: font.mono, fontSize: '0.6rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: cr.faint }}>{l}</Typography>
              <Mono sx={{ fontSize: '0.88rem', fontWeight: 600, color: cr.text }}>{v}</Mono>
            </Box>
          ))}
        </Box>

        {countdown && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, px: 1.5, py: 1, borderRadius: '10px', bgcolor: tint(countdown.color, 8), border: `1px solid ${tint(countdown.color, 30)}` }} aria-live="off">
            <Typography sx={{ fontFamily: font.mono, fontSize: '0.64rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: countdown.text }}>{countdown.label}</Typography>
            <Mono sx={{ fontWeight: 700, fontSize: '1rem', color: cr.text, textShadow: `0 0 12px ${tint(countdown.color, 60)}` }}>{countdown.value}</Mono>
          </Box>
        )}

        {booking.promo_code && (
          <StatusBadge status="free" pulse={false} label={`Промо: ${booking.promo_code}`} sx={{ alignSelf: 'flex-start' }} />
        )}

        {isActive && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 'auto', pt: 0.5 }}>
            {[1, 2].map((h) => (
              <Button key={h} size="small" variant="outlined" loading={extending} startIcon={<AddTimeIcon />} onClick={() => handleExtend(h)} sx={{ fontFamily: font.mono, flex: { xs: 1, sm: 'none' } }}>
                +{h} год
              </Button>
            ))}
            <Button size="small" variant="outlined" color="error" startIcon={<CancelIcon />} onClick={() => onCancel(booking.id)} sx={{ ml: { sm: 'auto' }, flex: { xs: '1 1 100%', sm: 'none' } }}>
              Скасувати
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default BookingsPage

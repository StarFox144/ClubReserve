import { useState, useEffect } from 'react'
import {
  Alert, Box, Breadcrumbs, Button, Chip, CircularProgress,
  Collapse, Divider, Link, Paper, TextField, Typography,
} from '@mui/material'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import dayjs from 'dayjs'
import { useParams, Link as RouterLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import ComputerIcon from '@mui/icons-material/Computer'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import EventAvailableIcon from '@mui/icons-material/EventAvailable'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import { getComputer, checkAvailability } from '../api/computers'
import { getClub } from '../api/clubs'
import { createBooking } from '../api/bookings'
import { validatePromo } from '../api/promos'

const STATUS_COLORS = {
  free:        { color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.3)',  label: 'Вільний' },
  maintenance: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', label: 'Тех. огляд' },
}

const DURATIONS = [
  { label: '30 хв', minutes: 30 },
  { label: '1 год', minutes: 60 },
  { label: '2 год', minutes: 120 },
  { label: '3 год', minutes: 180 },
  { label: '4 год', minutes: 240 },
]

const toApiStr = (dj) => dj?.isValid() ? dj.format('YYYY-MM-DDTHH:mm') : ''

const getDurationLabel = (start, end) => {
  if (!start || !end) return null
  const mins = end.diff(start, 'minute')
  if (mins <= 0) return null
  const h = Math.floor(mins / 60); const m = mins % 60
  return h > 0 ? `${h} год${m > 0 ? ` ${m} хв` : ''}` : `${m} хв`
}

const pickerSx = {
  width: '100%',
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    '& fieldset': { borderColor: 'rgba(147,51,234,0.35)' },
    '&:hover fieldset': { borderColor: '#9333ea' },
    '&.Mui-focused fieldset': { borderColor: '#9333ea', boxShadow: '0 0 0 2px rgba(147,51,234,0.2)' },
  },
  '& .MuiInputAdornment-root .MuiIconButton-root': { color: '#a855f7' },
}

const ComputerDetailPage = () => {
  const { id } = useParams()
  const { isAuthenticated } = useAuth()

  const [computer, setComputer] = useState(null)
  const [club, setClub] = useState(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [pageError, setPageError] = useState('')

  const [startTime, setStartTime] = useState(null)
  const [endTime, setEndTime] = useState(null)
  const [availabilityResult, setAvailabilityResult] = useState(null)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [checking, setChecking] = useState(false)
  const [booking, setBooking] = useState(false)

  // Promo code state
  const [showPromo, setShowPromo] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [promoResult, setPromoResult] = useState(null)
  const [promoValidating, setPromoValidating] = useState(false)

  useEffect(() => {
    getComputer(id)
      .then(async (comp) => {
        setComputer(comp)
        try { setClub(await getClub(comp.club_id)) } catch { /* optional */ }
      })
      .catch(() => setPageError("Комп'ютер не знайдено"))
      .finally(() => setPageLoading(false))
  }, [id])

  const resetBookingState = () => {
    setAvailabilityResult(null); setBookingSuccess(false); setBookingError('')
  }

  const handleStartChange = (val) => {
    setStartTime(val)
    if (val?.isValid()) setEndTime(val.add(1, 'hour'))
    else setEndTime(null)
    resetBookingState()
  }

  const handleQuickDuration = (minutes) => {
    if (!startTime?.isValid()) return
    setEndTime(startTime.add(minutes, 'minute'))
    resetBookingState()
  }

  const handleCheckAvailability = async (e) => {
    e.preventDefault(); resetBookingState()
    const startStr = toApiStr(startTime); const endStr = toApiStr(endTime)
    if (!startStr || !endStr) return
    if (endTime.isBefore(startTime) || endTime.isSame(startTime)) {
      setBookingError('Час завершення має бути пізніше за час початку'); return
    }
    setChecking(true)
    try {
      setAvailabilityResult(await checkAvailability(id, startStr, endStr))
    } catch { setBookingError('Помилка перевірки доступності') }
    finally { setChecking(false) }
  }

  const handleValidatePromo = async () => {
    if (!promoCode.trim()) return
    setPromoValidating(true); setPromoResult(null)
    try {
      const result = await validatePromo(promoCode.trim())
      setPromoResult(result)
    } catch { setPromoResult({ valid: false, message: 'Помилка перевірки' }) }
    finally { setPromoValidating(false) }
  }

  const handleBook = async () => {
    setBookingError(''); setBooking(true)
    try {
      const appliedPromo = promoResult?.valid ? promoCode.trim().toUpperCase() : null
      await createBooking(Number(id), toApiStr(startTime), toApiStr(endTime), appliedPromo)
      setBookingSuccess(true); setAvailabilityResult(null)
    } catch (e) {
      const detail = e.response?.data?.detail || ''
      setBookingError(
        e.response?.status === 409 || detail.toLowerCase().includes('already booked')
          ? 'Цей час вже зайнятий іншим користувачем. Оберіть інший час.'
          : detail || 'Помилка при бронюванні'
      )
    } finally { setBooking(false) }
  }

  if (pageLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress sx={{ color: '#a855f7' }} /></Box>
  if (pageError || !computer) return <Alert severity="error">{pageError || "Комп'ютер не знайдено"}</Alert>

  const canBook = computer.is_active
  const statusCfg = canBook ? STATUS_COLORS.free : STATUS_COLORS.maintenance
  const timeValid = startTime?.isValid() && endTime?.isValid() && endTime.isAfter(startTime.add(29, 'minute'))
  const durationLabel = getDurationLabel(startTime, endTime)
  const estimatedHours = timeValid ? endTime.diff(startTime, 'minute') / 60 : 0
  const baseCost = computer.price_per_hour && estimatedHours > 0
    ? estimatedHours * Number(computer.price_per_hour) : null
  const discountPct = promoResult?.valid ? promoResult.discount_percent : 0
  const discountedCost = baseCost != null ? baseCost * (1 - discountPct / 100) : null

  return (
    <Box>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/clubs" underline="hover" sx={{ color: 'text.secondary', '&:hover': { color: '#a855f7' } }}>
          Клуби
        </Link>
        {club && (
          <Link component={RouterLink} to={`/clubs/${club.id}`} underline="hover" sx={{ color: 'text.secondary', '&:hover': { color: '#a855f7' } }}>
            {club.name}
          </Link>
        )}
        <Typography sx={{ background: 'linear-gradient(135deg,#a855f7,#818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontWeight: 600 }}>
          {computer.name}
        </Typography>
      </Breadcrumbs>

      {/* Computer info */}
      <Box sx={(theme) => ({
        display: 'flex', alignItems: 'flex-start', gap: 3, mb: 4, p: 3, borderRadius: 3,
        background: theme.palette.mode === 'dark' ? 'linear-gradient(135deg,#12121a 0%,#1a0a2e 100%)' : 'linear-gradient(135deg,#faf7ff 0%,#f0e9ff 100%)',
        border: `1px solid ${statusCfg.border}`, boxShadow: `0 4px 24px ${statusCfg.bg}`,
      })}>
        <Box sx={{ p: 2, borderRadius: 2, background: statusCfg.bg, border: `1px solid ${statusCfg.border}`, flexShrink: 0 }}>
          <ComputerIcon sx={{ fontSize: 48, color: statusCfg.color }} />
        </Box>
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Typography variant="h4" fontWeight={700} sx={{ background: 'linear-gradient(135deg,#e2e8f0,#a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {computer.name}
            </Typography>
            <Chip label={statusCfg.label} size="small" sx={{ bgcolor: statusCfg.bg, color: statusCfg.color, border: `1px solid ${statusCfg.border}`, fontWeight: 600 }} />
          </Box>
          <Typography color="text.secondary" sx={{ mb: 1 }}>{computer.description}</Typography>
          {computer.price_per_hour && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
              <AttachMoneyIcon sx={{ fontSize: 18, color: '#a855f7' }} />
              <Typography fontWeight={700} sx={{ color: '#a855f7' }}>₴{Number(computer.price_per_hour).toFixed(0)} / год</Typography>
            </Box>
          )}
          {club && <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>Клуб: {club.name} · {club.address}</Typography>}
        </Box>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Booking form */}
      <Paper sx={(theme) => ({ p: 4, maxWidth: 520, background: theme.palette.mode === 'dark' ? 'linear-gradient(135deg,#12121a 0%,#1a1a2e 100%)' : '#ffffff' })}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <EventAvailableIcon sx={{ color: '#a855f7' }} />
          <Typography variant="h6" fontWeight={700}>Бронювання</Typography>
        </Box>

        {!canBook && <Alert severity="warning" sx={{ mb: 3, bgcolor: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b' }}>Цей комп'ютер зараз недоступний</Alert>}
        {!isAuthenticated && (
          <Alert severity="info" sx={{ mb: 3, bgcolor: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8' }}>
            Для бронювання потрібно <Link component={RouterLink} to="/login" sx={{ color: '#a855f7' }}>увійти в акаунт</Link>
          </Alert>
        )}

        <Box component="form" onSubmit={handleCheckAvailability} sx={{ opacity: canBook ? 1 : 0.5, pointerEvents: canBook ? 'auto' : 'none' }}>
          {/* Start time */}
          <Box sx={{ mb: 2.5 }}>
            <DateTimePicker label="Початок сесії" value={startTime} onChange={handleStartChange}
              minDateTime={dayjs()} minutesStep={15} ampm={false} sx={pickerSx}
              slotProps={{ textField: { fullWidth: true, helperText: 'Вибери дату та час початку' } }} />
          </Box>

          {/* Quick durations */}
          {startTime?.isValid() && (
            <Box sx={{ mb: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                <AccessTimeIcon sx={{ fontSize: 15, color: '#a855f7' }} />
                <Typography variant="body2" fontWeight={600}>Тривалість</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {DURATIONS.map((d) => {
                  const target = startTime.add(d.minutes, 'minute')
                  const selected = endTime?.isValid() && endTime.isSame(target, 'minute')
                  return (
                    <Button key={d.label} size="small" variant={selected ? 'contained' : 'outlined'}
                      onClick={() => handleQuickDuration(d.minutes)}
                      sx={{ minWidth: 68, borderRadius: 2, fontWeight: 600, ...(selected ? {} : { borderColor: 'rgba(147,51,234,0.4)', color: 'text.secondary', '&:hover': { borderColor: '#a855f7', color: '#a855f7', bgcolor: 'rgba(147,51,234,0.06)' } }) }}>
                      {d.label}
                    </Button>
                  )
                })}
              </Box>
            </Box>
          )}

          {/* End time */}
          <Box sx={{ mb: 2.5 }}>
            <DateTimePicker label="Кінець сесії" value={endTime}
              onChange={(v) => { setEndTime(v); resetBookingState() }}
              minDateTime={startTime?.isValid() ? startTime.add(30, 'minute') : dayjs()}
              minutesStep={15} ampm={false} sx={pickerSx}
              slotProps={{ textField: { fullWidth: true, helperText: 'Мінімум 30 хвилин від початку' } }} />
          </Box>

          {/* Summary */}
          {timeValid && (
            <Box sx={{ p: 2, mb: 2, borderRadius: 2, background: 'rgba(147,51,234,0.06)', border: '1px solid rgba(147,51,234,0.25)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {startTime.format('dd, D MMM · HH:mm')} → {endTime.format('HH:mm')}
                  </Typography>
                  {durationLabel && <Typography variant="body2" fontWeight={600}>{durationLabel}</Typography>}
                </Box>
                {baseCost != null && (
                  <Box sx={{ textAlign: 'right' }}>
                    {discountPct > 0 ? (
                      <>
                        <Typography variant="caption" color="text.disabled" sx={{ textDecoration: 'line-through' }}>₴{baseCost.toFixed(2)}</Typography>
                        <Typography variant="h6" fontWeight={700} sx={{ color: '#10b981', lineHeight: 1.2 }}>₴{discountedCost.toFixed(2)}</Typography>
                        <Typography variant="caption" sx={{ color: '#10b981' }}>-{discountPct}%</Typography>
                      </>
                    ) : (
                      <>
                        <Typography variant="caption" color="text.secondary">Орієнтовно</Typography>
                        <Typography variant="h6" fontWeight={700} sx={{ color: '#10b981', lineHeight: 1.2 }}>₴{baseCost.toFixed(2)}</Typography>
                      </>
                    )}
                  </Box>
                )}
              </Box>
            </Box>
          )}

          {/* Promo code */}
          {timeValid && (
            <Box sx={{ mb: 2 }}>
              <Button size="small" startIcon={<LocalOfferIcon sx={{ fontSize: 14 }} />}
                onClick={() => setShowPromo((v) => !v)}
                sx={{ color: 'text.secondary', '&:hover': { color: '#a855f7' }, mb: 1, p: 0, fontSize: '0.8rem' }}>
                {showPromo ? 'Приховати промо-код' : 'Є промо-код?'}
              </Button>
              <Collapse in={showPromo}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <TextField
                    size="small" label="Промо-код" value={promoCode}
                    onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoResult(null) }}
                    sx={{ flex: 1, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(147,51,234,0.35)' }, '&:hover fieldset': { borderColor: '#9333ea' } } }}
                  />
                  <Button variant="outlined" size="small" onClick={handleValidatePromo}
                    disabled={promoValidating || !promoCode.trim()} sx={{ height: 40, flexShrink: 0, borderColor: 'rgba(147,51,234,0.4)', color: '#a855f7' }}>
                    {promoValidating ? <CircularProgress size={14} /> : 'Застосувати'}
                  </Button>
                </Box>
                {promoResult && (
                  <Alert severity={promoResult.valid ? 'success' : 'error'} sx={{ mt: 1, py: 0.5,
                    ...(promoResult.valid ? { bgcolor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' } : { bgcolor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' })
                  }}>
                    {promoResult.valid ? `Знижка ${promoResult.discount_percent}% застосована!` : promoResult.message || 'Невірний код'}
                  </Alert>
                )}
              </Collapse>
            </Box>
          )}

          <Button type="submit" variant="outlined" fullWidth disabled={!timeValid || checking} sx={{ mb: 2 }}
            startIcon={checking ? <CircularProgress size={16} color="inherit" /> : null}>
            {checking ? 'Перевірка...' : 'Перевірити доступність'}
          </Button>
        </Box>

        {availabilityResult && (
          <Alert severity={availabilityResult.available ? 'success' : 'warning'} icon={availabilityResult.available ? <CheckCircleIcon /> : undefined}
            sx={{ mb: 2, ...(availabilityResult.available ? { bgcolor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' } : { bgcolor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }) }}>
            {availabilityResult.available ? "Комп'ютер вільний на обраний час!" : 'Цей час вже зайнятий. Оберіть інший час.'}
          </Alert>
        )}

        {bookingError && <Alert severity="error" sx={{ mb: 2, bgcolor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>{bookingError}</Alert>}

        {bookingSuccess && (
          <Alert severity="success" sx={{ mb: 2, bgcolor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}>
            Бронювання успішно створено!{' '}
            <Link component={RouterLink} to="/bookings" sx={{ color: '#10b981', fontWeight: 600 }}>Переглянути мої бронювання</Link>
          </Alert>
        )}

        {isAuthenticated && availabilityResult?.available && !bookingSuccess && (
          <Button variant="contained" fullWidth size="large" onClick={handleBook} disabled={booking} sx={{ mt: 1 }}
            startIcon={booking ? <CircularProgress size={16} color="inherit" /> : null}>
            {booking ? 'Бронювання...' : `Забронювати${discountPct > 0 && discountedCost ? ` · ₴${discountedCost.toFixed(2)}` : ''}`}
          </Button>
        )}
      </Paper>
    </Box>
  )
}

export default ComputerDetailPage

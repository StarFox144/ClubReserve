import { useState, useEffect } from 'react'
import {
  Alert, Box, Breadcrumbs, Button, Collapse, Link, Skeleton, TextField, Typography,
} from '@mui/material'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import { useParams, Link as RouterLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { usePageTitle } from '../hooks/usePageTitle'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import StorefrontIcon from '@mui/icons-material/Storefront'
import { getComputer, checkAvailability } from '../api/computers'
import { getClub } from '../api/clubs'
import { createBooking } from '../api/bookings'
import { validatePromo } from '../api/promos'
import { cr, font, tint } from '../design/tokens'
import { EmptyState, GlassCard, HudStat, HudStepper, Mono, SectionHeader, StatusBadge } from '../components/ui'
import { parseSpecs, isVip } from '../components/club/clubUtils'
import TimeSlotGrid, { slotKey } from '../components/booking/TimeSlotGrid'
import BookingSummary from '../components/booking/BookingSummary'
import AccessGranted from '../components/booking/AccessGranted'

const DURATIONS = [
  { label: '30 хв', minutes: 30 },
  { label: '1 год', minutes: 60 },
  { label: '2 год', minutes: 120 },
  { label: '3 год', minutes: 180 },
  { label: '4 год', minutes: 240 },
]

const BOOKING_STEPS = ['Місце', 'Дата і час', 'Підтвердження']

const toApiStr = (dj) => dj?.isValid() ? dj.format('YYYY-MM-DDTHH:mm') : ''

const getDurationLabel = (start, end) => {
  if (!start || !end) return null
  const mins = end.diff(start, 'minute')
  if (mins <= 0) return null
  const h = Math.floor(mins / 60); const m = mins % 60
  return h > 0 ? `${h} год${m > 0 ? ` ${m} хв` : ''}` : `${m} хв`
}

const capsLabel = { fontFamily: font.mono, fontSize: '0.68rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: cr.muted }

const ComputerDetailPage = () => {
  const { id } = useParams()
  const { isAuthenticated } = useAuth()

  const [computer, setComputer] = useState(null)
  const [club, setClub] = useState(null)
  const [pageLoading, setPageLoading] = useState(true)
  usePageTitle(computer?.name || "Комп'ютер")
  const [pageError, setPageError] = useState('')

  const [date, setDate] = useState(() => dayjs())
  const [busyKeys, setBusyKeys] = useState(new Set())
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

  const handleDateChange = (val) => {
    setDate(val)
    handleStartChange(null)
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
      const res = await checkAvailability(id, startStr, endStr)
      setAvailabilityResult(res)
      if (!res.available) setBusyKeys((prev) => new Set(prev).add(slotKey(startTime)))
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

  if (pageLoading) {
    return (
      <Box>
        <Skeleton variant="rounded" height={180} sx={{ mb: 3, borderRadius: '24px' }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 340px' }, gap: 3 }}>
          <Skeleton variant="rounded" height={420} />
          <Skeleton variant="rounded" height={300} />
        </Box>
      </Box>
    )
  }
  if (pageError || !computer) {
    return (
      <GlassCard>
        <EmptyState art="signal" title={pageError || "Комп'ютер не знайдено"} action={<Button variant="outlined" component={RouterLink} to="/clubs">До клубів</Button>} />
      </GlassCard>
    )
  }

  const canBook = computer.is_active
  const timeValid = startTime?.isValid() && endTime?.isValid() && endTime.isAfter(startTime.add(29, 'minute'))
  const durationLabel = getDurationLabel(startTime, endTime)
  const estimatedHours = timeValid ? endTime.diff(startTime, 'minute') / 60 : 0
  const baseCost = computer.price_per_hour && estimatedHours > 0
    ? estimatedHours * Number(computer.price_per_hour) : null
  const discountPct = promoResult?.valid ? promoResult.discount_percent : 0
  const discountedCost = baseCost != null ? baseCost * (1 - discountPct / 100) : null
  const step = bookingSuccess ? 3 : availabilityResult?.available ? 2 : 1
  const specs = parseSpecs(computer.description)
  const vip = isVip(computer)

  return (
    <Box>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2.5 }} aria-label="Навігаційний ланцюжок">
        <Link component={RouterLink} to="/clubs" underline="hover" sx={{ color: cr.muted }}>Клуби</Link>
        {club && <Link component={RouterLink} to={`/clubs/${club.id}`} underline="hover" sx={{ color: cr.muted }}>{club.name}</Link>}
        <Typography sx={{ font: 'inherit', color: cr.primaryText }}>{computer.name}</Typography>
      </Breadcrumbs>

      {/* ── Header ── */}
      <GlassCard hud accent={canBook ? cr.success : cr.warning} sx={{ p: { xs: 2.5, md: 4 }, mb: 3, overflow: 'hidden' }}>
        <Box aria-hidden sx={{ position: 'absolute', right: -40, top: -40, width: 240, height: 240, borderRadius: '50%', background: `radial-gradient(circle, ${tint(canBook ? cr.success : cr.warning, 18)}, transparent 70%)` }} />
        <Box sx={{ position: 'relative', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 2.5 }}>
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
              <StatusBadge status={canBook ? 'free' : 'maintenance'} size="md" label={canBook ? 'Доступний' : 'Тех. огляд'} />
              {vip && <StatusBadge status="vip" pulse={false} size="md" />}
            </Box>
            <Typography component="h1" sx={{ fontFamily: font.mono, fontWeight: 700, fontSize: { xs: '2rem', md: '2.8rem' }, lineHeight: 1.1, color: cr.text, textShadow: `0 0 24px ${tint(cr.primary2, 50)}` }}>
              {computer.name}
            </Typography>
            {club && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1 }}>
                <StorefrontIcon sx={{ fontSize: 16, color: cr.cyanText }} />
                <Typography sx={{ color: cr.muted, fontSize: '0.92rem' }}>{club.name} · {club.address}</Typography>
              </Box>
            )}
          </Box>
          {computer.price_per_hour && (
            <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
              <Typography sx={capsLabel}>Тариф</Typography>
              <Mono sx={{ fontSize: { xs: '1.8rem', md: '2.2rem' }, fontWeight: 700, color: cr.text, textShadow: `0 0 18px ${tint(cr.primary2, 45)}` }}>
                ₴{Number(computer.price_per_hour).toFixed(0)}<Box component="span" sx={{ fontSize: '0.9rem', color: cr.muted }}>/год</Box>
              </Mono>
            </Box>
          )}
        </Box>
      </GlassCard>

      {specs.length > 0 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: `repeat(${Math.min(specs.length, 4)}, 1fr)` }, gap: { xs: 1.5, md: 2 }, mb: { xs: 5, md: 7 } }}>
          {specs.map((s, i) => (
            <HudStat key={i} compact label={s.kind} value={<Box component="span" sx={{ fontSize: { xs: '0.92rem', md: '1.02rem' } }}>{s.label}</Box>} accent={s.color} />
          ))}
        </Box>
      )}

      {/* ── Booking ── */}
      <SectionHeader index={1} label="Бронювання" title="Забронювати сесію" size="md" />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 340px' }, gap: 3, alignItems: 'start' }}>
        <GlassCard strong sx={{ p: { xs: 2.5, md: 3.5 } }}>
          <HudStepper steps={BOOKING_STEPS} active={step} sx={{ mb: 3.5 }} />

          {!canBook && <Alert severity="warning" sx={{ mb: 3 }}>Цей комп'ютер зараз недоступний</Alert>}
          {!isAuthenticated && (
            <Alert severity="info" sx={{ mb: 3 }}>
              Для бронювання потрібно <Link component={RouterLink} to="/login">увійти в акаунт</Link>
            </Alert>
          )}

          {bookingSuccess ? (
            <AccessGranted pcName={computer.name} when={startTime?.isValid() && endTime?.isValid() ? `${startTime.format('D MMM, HH:mm')} → ${endTime.format('HH:mm')}` : null} />
          ) : step === 1 ? (
            <Box component="form" onSubmit={handleCheckAvailability} aria-disabled={!canBook} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, opacity: canBook ? 1 : 0.5, pointerEvents: canBook ? 'auto' : 'none' }}>
              <DatePicker label="Дата" value={date} onChange={handleDateChange} minDate={dayjs()} slotProps={{ textField: { fullWidth: true } }} />

              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.25 }}>
                  <AccessTimeIcon sx={{ fontSize: 15, color: cr.primaryText }} />
                  <Typography sx={capsLabel}>Час початку</Typography>
                </Box>
                <TimeSlotGrid date={date} value={startTime} onChange={handleStartChange} busyKeys={busyKeys} />
              </Box>

              {startTime?.isValid() && (
                <Box>
                  <Typography sx={{ ...capsLabel, mb: 1 }}>Тривалість</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {DURATIONS.map((d) => {
                      const target = startTime.add(d.minutes, 'minute')
                      const isSel = endTime?.isValid() && endTime.isSame(target, 'minute')
                      return (
                        <Button key={d.label} size="small" variant={isSel ? 'contained' : 'outlined'} aria-pressed={isSel}
                          onClick={() => handleQuickDuration(d.minutes)} sx={{ minWidth: 72, fontFamily: font.mono }}>
                          {d.label}
                        </Button>
                      )
                    })}
                  </Box>
                </Box>
              )}

              <DateTimePicker label="Кінець сесії" value={endTime}
                onChange={(v) => { setEndTime(v); resetBookingState() }}
                minDateTime={startTime?.isValid() ? startTime.add(30, 'minute') : dayjs()}
                minutesStep={15} ampm={false}
                slotProps={{ textField: { fullWidth: true, helperText: 'Мінімум 30 хвилин від початку' } }} />

              {availabilityResult && !availabilityResult.available && (
                <Alert severity="warning">Цей час вже зайнятий. Оберіть інший час.</Alert>
              )}
              {bookingError && <Alert severity="error">{bookingError}</Alert>}

              <Button type="submit" variant="contained" size="large" fullWidth disabled={!timeValid} loading={checking} endIcon={<ArrowForwardIcon />}>
                {checking ? 'Перевірка...' : 'Перевірити доступність'}
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
              <Alert severity="success">Комп'ютер вільний на обраний час!</Alert>

              <Box>
                <Button size="small" startIcon={<LocalOfferIcon sx={{ fontSize: 14 }} />} onClick={() => setShowPromo((v) => !v)} aria-expanded={showPromo}>
                  {showPromo ? 'Приховати промо-код' : 'Є промо-код?'}
                </Button>
                <Collapse in={showPromo}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mt: 1.5 }}>
                    <TextField size="small" label="Промо-код" value={promoCode}
                      onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoResult(null) }}
                      inputProps={{ style: { fontFamily: 'var(--cr-font-mono)', letterSpacing: '0.12em' } }}
                      sx={{ flex: 1 }} />
                    <Button variant="outlined" onClick={handleValidatePromo} loading={promoValidating} disabled={!promoCode.trim()} sx={{ height: 40, flexShrink: 0 }}>
                      Застосувати
                    </Button>
                  </Box>
                  {promoResult && (
                    <Alert severity={promoResult.valid ? 'success' : 'error'} sx={{ mt: 1, py: 0.25 }}>
                      {promoResult.valid ? `Знижка ${promoResult.discount_percent}% застосована!` : promoResult.message || 'Невірний код'}
                    </Alert>
                  )}
                </Collapse>
              </Box>

              {bookingError && <Alert severity="error">{bookingError}</Alert>}

              <Box sx={{ display: 'flex', gap: 1.25, flexDirection: { xs: 'column-reverse', sm: 'row' } }}>
                <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={resetBookingState} sx={{ flexShrink: 0 }}>Назад</Button>
                {isAuthenticated && (
                  <Button variant="contained" fullWidth size="large" onClick={handleBook} loading={booking}>
                    {booking ? 'Бронювання...' : `Забронювати${discountPct > 0 && discountedCost ? ` · ₴${discountedCost.toFixed(2)}` : ''}`}
                  </Button>
                )}
              </Box>
            </Box>
          )}
        </GlassCard>

        <Box sx={{ position: { md: 'sticky' }, top: { md: 96 } }}>
          <BookingSummary
            pcName={computer.name}
            clubName={club?.name}
            start={timeValid ? startTime : null}
            end={timeValid ? endTime : null}
            durationLabel={timeValid ? durationLabel : null}
            pricePerHour={computer.price_per_hour}
            baseCost={baseCost}
            discountPct={discountPct}
            finalCost={discountedCost}
          />
        </Box>
      </Box>
    </Box>
  )
}

export default ComputerDetailPage

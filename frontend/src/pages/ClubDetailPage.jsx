import { useState, useEffect, useCallback } from 'react'
import {
  Alert, Box, Breadcrumbs, Button, Collapse, Dialog, DialogContent,
  IconButton, Link, Rating, Skeleton, TextField, Typography,
} from '@mui/material'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import MemoryIcon from '@mui/icons-material/Memory'
import DeveloperBoardIcon from '@mui/icons-material/DeveloperBoard'
import MonitorIcon from '@mui/icons-material/Monitor'
import StorageIcon from '@mui/icons-material/Storage'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CloseIcon from '@mui/icons-material/Close'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { useAuth } from '../contexts/AuthContext'
import { usePageTitle } from '../hooks/usePageTitle'
import { getClub, getBusyComputers } from '../api/clubs'
import { getComputers, checkAvailability } from '../api/computers'
import { getReviews, createReview } from '../api/reviews'
import { createBooking } from '../api/bookings'
import { validatePromo } from '../api/promos'
import { cr, font, tint, STATUS } from '../design/tokens'
import { EmptyState, GlassCard, HudStat, HudStepper, Mono, Reveal, SectionHeader, StatusBadge } from '../components/ui'
import ClubBanner from '../components/club/ClubBanner'
import HallMap, { seatStatus } from '../components/club/HallMap'
import { parseSpecs, isVip, topSpec } from '../components/club/clubUtils'
import TimeSlotGrid, { slotKey } from '../components/booking/TimeSlotGrid'
import BookingSummary from '../components/booking/BookingSummary'
import AccessGranted from '../components/booking/AccessGranted'

const QUICK_DURATIONS = [
  { label: '1 год', minutes: 60 },
  { label: '2 год', minutes: 120 },
  { label: '3 год', minutes: 180 },
]

const BOOKING_STEPS = ['Місце', 'Дата і час', 'Підтвердження']

const toApiStr = (dj) => dj?.isValid() ? dj.format('YYYY-MM-DDTHH:mm') : ''

// Occupancy donut for the "nothing selected" side panel
const OccupancyRing = ({ segments, total }) => {
  const r = 52
  const c = 2 * Math.PI * r
  let offset = 0
  return (
    <Box sx={{ position: 'relative', width: 140, height: 140, mx: 'auto' }}>
      <svg viewBox="0 0 140 140" width="140" height="140" role="img" aria-label={segments.map((s) => `${s.label}: ${s.value}`).join(', ')}>
        <circle cx="70" cy="70" r={r} fill="none" stroke={tint(cr.primary, 15)} strokeWidth="12" />
        {segments.filter((s) => s.value > 0).map((s) => {
          const len = total ? (s.value / total) * c : 0
          const el = (
            <circle key={s.label} cx="70" cy="70" r={r} fill="none" stroke={s.color} strokeWidth="12"
              strokeDasharray={`${Math.max(len - 3, 0)} ${c}`} strokeDashoffset={-offset} strokeLinecap="round"
              transform="rotate(-90 70 70)" style={{ filter: `drop-shadow(0 0 6px ${s.color})` }} />
          )
          offset += len
          return el
        })}
      </svg>
      <Box sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
        <Box>
          <Mono sx={{ display: 'block', fontSize: '1.8rem', fontWeight: 700, color: cr.text, lineHeight: 1 }}>{segments[0].value}</Mono>
          <Mono sx={{ fontSize: '0.62rem', letterSpacing: '0.16em', color: cr.muted }}>/ {total} ВІЛЬНО</Mono>
        </Box>
      </Box>
    </Box>
  )
}

const capsLabel = { fontFamily: font.mono, fontSize: '0.68rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: cr.muted }

const ClubDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()

  const [club, setClub] = useState(null)
  const [computers, setComputers] = useState([])
  const [busyIds, setBusyIds] = useState(new Set())
  usePageTitle(club?.name || 'Клуб')
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewLoading, setReviewLoading] = useState(false)
  const [reviewError, setReviewError] = useState('')

  // Hall map selection (UI only)
  const [selectedId, setSelectedId] = useState(null)

  // Quick booking dialog
  const [quickTarget, setQuickTarget] = useState(null)
  const [qbDate, setQbDate] = useState(null)
  const [qbBusyKeys, setQbBusyKeys] = useState(new Set())
  const [qbStart, setQbStart] = useState(null)
  const [qbEnd, setQbEnd] = useState(null)
  const [qbAvailability, setQbAvailability] = useState(null)
  const [qbSuccess, setQbSuccess] = useState(false)
  const [qbError, setQbError] = useState('')
  const [qbChecking, setQbChecking] = useState(false)
  const [qbBooking, setQbBooking] = useState(false)
  const [qbShowPromo, setQbShowPromo] = useState(false)
  const [qbPromoCode, setQbPromoCode] = useState('')
  const [qbPromoResult, setQbPromoResult] = useState(null)
  const [qbPromoValidating, setQbPromoValidating] = useState(false)

  const fetchBusy = useCallback(() => {
    getBusyComputers(id)
      .then((data) => setBusyIds(new Set(data.busy_ids)))
      .catch(() => {})
  }, [id])

  useEffect(() => {
    Promise.all([getClub(id), getComputers(id, true), getBusyComputers(id), getReviews(id)])
      .then(([clubData, computersData, busyData, reviewsData]) => {
        setClub(clubData)
        setComputers(computersData)
        setBusyIds(new Set(busyData.busy_ids))
        setReviews(reviewsData)
      })
      .catch(() => setError('Не вдалося завантажити дані клубу'))
      .finally(() => setLoading(false))
  }, [id])

  // Poll busy status every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchBusy, 30000)
    return () => clearInterval(interval)
  }, [fetchBusy])

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    setReviewError('')
    setReviewLoading(true)
    try {
      const r = await createReview(id, { rating: reviewRating, comment: reviewComment })
      setReviews((prev) => [r, ...prev])
      setReviewComment('')
      setReviewRating(5)
    } catch (err) {
      setReviewError(err.response?.data?.detail || 'Помилка при збереженні відгуку')
    } finally {
      setReviewLoading(false)
    }
  }

  const openQuickBook = (computer) => {
    setQuickTarget(computer)
    setQbDate(dayjs()); setQbBusyKeys(new Set())
    setQbStart(null); setQbEnd(null)
    setQbAvailability(null); setQbSuccess(false); setQbError('')
    setQbShowPromo(false); setQbPromoCode(''); setQbPromoResult(null)
  }
  const closeQuickBook = () => setQuickTarget(null)

  const handleQbStartChange = (val) => {
    setQbStart(val)
    if (val?.isValid()) setQbEnd(val.add(1, 'hour'))
    else setQbEnd(null)
    setQbAvailability(null); setQbSuccess(false); setQbError('')
  }

  const handleQbDateChange = (val) => {
    setQbDate(val)
    handleQbStartChange(null)
  }

  const handleQbValidatePromo = async () => {
    if (!qbPromoCode.trim()) return
    setQbPromoValidating(true); setQbPromoResult(null)
    try {
      setQbPromoResult(await validatePromo(qbPromoCode.trim()))
    } catch { setQbPromoResult({ valid: false, message: 'Помилка перевірки' }) }
    finally { setQbPromoValidating(false) }
  }

  const handleQbCheck = async () => {
    if (!qbStart?.isValid() || !qbEnd?.isValid()) return
    setQbError(''); setQbChecking(true); setQbAvailability(null)
    try {
      const res = await checkAvailability(quickTarget.id, toApiStr(qbStart), toApiStr(qbEnd))
      setQbAvailability(res)
      // remember the busy start slot so the grid can cross it out
      if (!res.available) setQbBusyKeys((prev) => new Set(prev).add(slotKey(qbStart)))
    } catch { setQbError('Помилка перевірки доступності') }
    finally { setQbChecking(false) }
  }

  const handleQbBook = async () => {
    setQbError(''); setQbBooking(true)
    try {
      const appliedPromo = qbPromoResult?.valid ? qbPromoCode.trim().toUpperCase() : null
      await createBooking(quickTarget.id, toApiStr(qbStart), toApiStr(qbEnd), appliedPromo)
      setQbSuccess(true); setQbAvailability(null)
      fetchBusy()
    } catch (e) {
      const detail = e.response?.data?.detail || ''
      setQbError(e.response?.status === 409 || detail.toLowerCase().includes('already booked')
        ? 'Цей час вже зайнятий. Оберіть інший.'
        : detail || 'Помилка при бронюванні')
    } finally { setQbBooking(false) }
  }

  if (loading) {
    return (
      <Box>
        <Skeleton variant="rounded" height={280} sx={{ mb: 3, borderRadius: '24px' }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 4 }}>
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} variant="rounded" height={96} />)}
        </Box>
        <Skeleton variant="rounded" height={360} />
      </Box>
    )
  }
  if (error || !club) {
    return (
      <GlassCard>
        <EmptyState art="signal" title={error || 'Клуб не знайдено'} action={<Button variant="outlined" component={RouterLink} to="/clubs">До списку клубів</Button>} />
      </GlassCard>
    )
  }

  const freeCount = computers.filter((c) => c.is_active && !busyIds.has(c.id)).length
  const busyCount = computers.filter((c) => busyIds.has(c.id)).length
  const maintenanceCount = computers.filter((c) => !c.is_active).length
  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0
  const hasReviewed = user && reviews.some((r) => r.user_id === user.id)

  const prices = computers.filter((c) => c.price_per_hour).map((c) => Math.round(Number(c.price_per_hour)))
  const selected = computers.find((c) => c.id === selectedId) || null
  const selectedStatus = selected ? seatStatus(selected, busyIds) : null

  const qbTimeValid = qbStart?.isValid() && qbEnd?.isValid() && qbEnd.isAfter(qbStart.add(29, 'minute'))
  const qbDurationMins = qbTimeValid ? qbEnd.diff(qbStart, 'minute') : 0
  const qbDurationLabel = qbDurationMins > 0
    ? `${Math.floor(qbDurationMins / 60)}${Math.floor(qbDurationMins / 60) > 0 ? ' год' : ''}${qbDurationMins % 60 > 0 ? ` ${qbDurationMins % 60} хв` : ''}`
    : null
  const qbEstCost = qbTimeValid && quickTarget?.price_per_hour
    ? (qbDurationMins / 60 * Number(quickTarget.price_per_hour)).toFixed(2)
    : null
  const qbDiscountPct = qbPromoResult?.valid ? qbPromoResult.discount_percent : 0
  const qbDiscountedCost = qbEstCost && qbDiscountPct > 0
    ? (parseFloat(qbEstCost) * (1 - qbDiscountPct / 100)).toFixed(2)
    : null
  const qbStep = qbSuccess ? 3 : qbAvailability?.available ? 2 : 1

  const specs = [
    { label: 'GPU', value: topSpec(computers, 'GPU'), icon: <DeveloperBoardIcon />, accent: cr.success },
    { label: 'CPU', value: topSpec(computers, 'CPU'), icon: <MemoryIcon />, accent: cr.cyan },
    { label: 'Монітор', value: topSpec(computers, 'Hz'), icon: <MonitorIcon />, accent: cr.magenta },
    { label: 'RAM', value: topSpec(computers, 'RAM'), icon: <StorageIcon />, accent: cr.warning },
  ].filter((s) => s.value)

  return (
    <Box>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2.5 }} aria-label="Навігаційний ланцюжок">
        <Link component={RouterLink} to="/clubs" underline="hover" sx={{ color: cr.muted }}>Клуби</Link>
        <Typography sx={{ font: 'inherit', color: cr.primaryText }}>{club.name}</Typography>
      </Breadcrumbs>

      {/* ── Banner ── */}
      <GlassCard hud accent={cr.primary2} sx={{ overflow: 'hidden', mb: 3, borderRadius: '24px' }}>
        <ClubBanner id={club.id} name={club.name} height={{ xs: 300, md: 320 }}>
          <Box sx={{ position: 'absolute', inset: 0, background: `linear-gradient(90deg, ${tint(cr.primary, 22)}, transparent 60%)`, mixBlendMode: 'screen' }} aria-hidden />
          <Box sx={{ position: 'absolute', left: { xs: 20, md: 36 }, right: { xs: 20, md: 36 }, bottom: { xs: 20, md: 32 } }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
              <StatusBadge status="free" label={`Вільно ${freeCount}/${computers.length}`} size="md" />
              {busyCount > 0 && <StatusBadge status="busy" label={`Зайнято ${busyCount}`} size="md" />}
              {maintenanceCount > 0 && <StatusBadge status="maintenance" label={`Тех. огляд ${maintenanceCount}`} size="md" />}
            </Box>
            <Typography component="h1" sx={{ fontFamily: font.display, fontWeight: 800, fontSize: { xs: '1.9rem', sm: '2.4rem', md: '3rem' }, lineHeight: 1.08, color: cr.text, textShadow: `0 0 30px ${tint(cr.primary2, 55)}`, mb: 1 }}>
              {club.name}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', columnGap: 2.5, rowGap: 0.75 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocationOnIcon sx={{ fontSize: 17, color: cr.cyanText }} />
                <Typography sx={{ color: cr.text, opacity: 0.85, fontSize: '0.92rem' }}>{club.address}</Typography>
              </Box>
              {reviews.length > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Rating value={avgRating} precision={0.5} readOnly size="small" />
                  <Mono sx={{ fontSize: '0.82rem', color: cr.text }}>{avgRating.toFixed(1)}</Mono>
                  <Typography sx={{ fontSize: '0.82rem', color: cr.muted }}>({reviews.length} {reviews.length < 5 ? 'відгуки' : 'відгуків'})</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </ClubBanner>
        {club.description && (
          <Typography sx={{ px: { xs: 2.5, md: 4.5 }, py: 2.5, color: cr.muted, lineHeight: 1.75, borderTop: `1px solid ${cr.borderSoft}` }}>
            {club.description}
          </Typography>
        )}
      </GlassCard>

      {/* ── Hardware specs ── */}
      {specs.length > 0 && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: `repeat(${specs.length}, 1fr)` }, gap: { xs: 1.5, md: 2 }, mb: { xs: 6, md: 8 } }}>
          {specs.map((s, i) => (
            <Reveal key={s.label} delay={i * 70}>
              <HudStat compact label={s.label} value={<Box component="span" sx={{ fontSize: { xs: '0.95rem', md: '1.05rem' } }}>{s.value}</Box>} icon={s.icon} accent={s.accent} />
            </Reveal>
          ))}
        </Box>
      )}

      {/* ── Hall map ── */}
      <Box component="section" aria-labelledby="hall-title" sx={{ mb: { xs: 7, md: 10 } }}>
        <SectionHeader index={1} label="Схема залу" title={<span id="hall-title">Обери своє місце</span>} subtitle="Наведи на ПК, щоб побачити характеристики. Клікни — щоб обрати. Статус оновлюється кожні 30 секунд." size="md" />

        {computers.length === 0 ? (
          <GlassCard><EmptyState art="pc" compact title="У цьому клубі ще немає комп'ютерів" /></GlassCard>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 320px' }, gap: 2.5, alignItems: 'start' }}>
            <GlassCard strong sx={{ p: { xs: 2, sm: 3 }, minWidth: 0 }}>
              <HallMap computers={computers} busyIds={busyIds} selectedId={selectedId} onSelect={(pc) => setSelectedId(pc.id)} />
            </GlassCard>

            {/* Selected seat panel */}
            <GlassCard hud={Boolean(selected)} accent={cr.cyan} strong sx={{ p: 2.5, position: { lg: 'sticky' }, top: { lg: 96 } }} aria-live="polite">
              {!selected ? (
                <Box>
                  <Typography sx={capsLabel}>// Стан залу</Typography>
                  <Box sx={{ my: 2.5 }}>
                    <OccupancyRing
                      total={computers.length}
                      segments={[
                        { label: 'Вільно', value: freeCount, color: cr.success },
                        { label: 'Зайнято', value: busyCount, color: cr.danger },
                        { label: 'Тех. огляд', value: maintenanceCount, color: cr.warning },
                      ]}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2.5 }}>
                    {[
                      { k: 'free', v: freeCount },
                      { k: 'busy', v: busyCount },
                      { k: 'maintenance', v: maintenanceCount },
                      { k: 'vip', v: computers.filter(isVip).length },
                    ].map(({ k, v }) => (
                      <Box key={k} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.5, py: 0.9, borderRadius: '10px', bgcolor: tint(STATUS[k].color, 7), border: `1px solid ${tint(STATUS[k].color, 22)}` }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: STATUS[k].color, boxShadow: `0 0 6px ${STATUS[k].color}` }} />
                          <Typography sx={{ fontSize: '0.86rem', fontWeight: 600 }}>{STATUS[k].label}</Typography>
                        </Box>
                        <Mono sx={{ fontWeight: 700, color: cr.text }}>{v}</Mono>
                      </Box>
                    ))}
                  </Box>
                  {prices.length > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', pt: 2, mb: 2, borderTop: `1px dashed ${cr.border}` }}>
                      <Typography sx={capsLabel}>Тарифи</Typography>
                      <Mono sx={{ fontSize: '1.15rem', fontWeight: 700, color: cr.text }}>
                        ₴{Math.min(...prices)}{Math.max(...prices) !== Math.min(...prices) ? `–${Math.max(...prices)}` : ''}<Box component="span" sx={{ fontSize: '0.78rem', color: cr.muted }}>/год</Box>
                      </Mono>
                    </Box>
                  )}
                  <Typography sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.85rem', color: cr.cyanText }}>
                    <ArrowBackIcon sx={{ fontSize: 16, display: { xs: 'none', lg: 'inline' } }} />
                    Клікни на ПК на схемі, щоб обрати місце
                  </Typography>
                </Box>
              ) : (
                <Box key={selected.id} sx={{ animation: 'cr-fade-up 300ms var(--cr-ease)' }}>
                  <Typography sx={capsLabel}>// Обране місце</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mt: 1, mb: 2 }}>
                    <Mono sx={{ fontSize: '1.5rem', fontWeight: 700, color: cr.text, textShadow: cr.glowCyan }}>{selected.name}</Mono>
                    <Box sx={{ display: 'flex', gap: 0.75 }}>
                      {isVip(selected) && <StatusBadge status="vip" pulse={false} />}
                      <StatusBadge status={selectedStatus} />
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                    {parseSpecs(selected.description).map((s, i) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 1, borderRadius: '10px', bgcolor: tint(s.color, 7), border: `1px solid ${tint(s.color, 22)}` }}>
                        <Mono sx={{ fontSize: '0.66rem', fontWeight: 700, letterSpacing: '0.1em', color: s.text, width: 36 }}>{s.kind}</Mono>
                        <Typography sx={{ fontSize: '0.86rem', fontWeight: 600, color: cr.text }}>{s.label}</Typography>
                      </Box>
                    ))}
                  </Box>
                  {selected.price_per_hour && (
                    <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 2.5, pt: 2, borderTop: `1px dashed ${cr.border}` }}>
                      <Typography sx={capsLabel}>Тариф</Typography>
                      <Mono sx={{ fontSize: '1.4rem', fontWeight: 700, color: cr.text }}>₴{Number(selected.price_per_hour).toFixed(0)}<Box component="span" sx={{ fontSize: '0.8rem', color: cr.muted }}>/год</Box></Mono>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button variant="contained" fullWidth disabled={selectedStatus !== 'free'} onClick={() => openQuickBook(selected)}>
                      {selectedStatus === 'free' ? 'Забронювати' : STATUS[selectedStatus].label}
                    </Button>
                    <IconButton aria-label={`Детальніше про ${selected.name}`} onClick={() => navigate(`/computers/${selected.id}`)} sx={{ border: `1px solid ${cr.borderStrong}`, borderRadius: '12px', color: cr.primaryText }}>
                      <OpenInNewIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              )}
            </GlassCard>
          </Box>
        )}
      </Box>

      {/* ── Reviews ── */}
      <Box component="section" aria-labelledby="reviews-title">
        <SectionHeader
          index={2}
          label="Відгуки"
          size="md"
          title={<span id="reviews-title">Що кажуть гравці</span>}
          action={reviews.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Mono sx={{ fontSize: '2rem', fontWeight: 700, color: cr.text, lineHeight: 1 }}>{avgRating.toFixed(1)}</Mono>
              <Box>
                <Rating value={avgRating} precision={0.5} readOnly size="small" />
                <Typography sx={{ fontSize: '0.78rem', color: cr.muted }}>{reviews.length} відгук{reviews.length < 5 ? 'и' : 'ів'}</Typography>
              </Box>
            </Box>
          )}
        />

        {isAuthenticated && !hasReviewed && (
          <GlassCard component="form" onSubmit={handleSubmitReview} sx={{ p: { xs: 2.5, md: 3 }, mb: 3 }}>
            <Typography variant="h6" component="h3" sx={{ mb: 2 }}>Залишити відгук</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Typography component="span" id="review-rating-l" sx={capsLabel}>Оцінка</Typography>
              <Rating value={reviewRating} onChange={(_, v) => setReviewRating(v)} aria-labelledby="review-rating-l" />
            </Box>
            <TextField fullWidth multiline rows={3} label="Коментар (необов'язково)" value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} sx={{ mb: 2 }} />
            {reviewError && <Alert severity="error" sx={{ mb: 2 }}>{reviewError}</Alert>}
            <Button type="submit" variant="contained" loading={reviewLoading}>{reviewLoading ? 'Збереження...' : 'Опублікувати відгук'}</Button>
          </GlassCard>
        )}

        {reviews.length === 0 && (
          <GlassCard>
            <EmptyState compact art="calendar" title="Відгуків ще немає" text={isAuthenticated ? 'Будьте першим, хто залишить відгук!' : 'Увійдіть, щоб залишити перший відгук.'} />
          </GlassCard>
        )}

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
          {reviews.map((review, i) => (
            <Reveal key={review.id} delay={(i % 2) * 80}>
              <GlassCard sx={{ p: 2.5, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.25 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center', fontFamily: font.display, fontSize: 14, fontWeight: 700, color: cr.text, bgcolor: cr.surface, border: `2px solid ${cr.primary2}`, boxShadow: cr.glowSm }}>
                      {(review.username || 'U').charAt(0).toUpperCase()}
                    </Box>
                    <Typography fontWeight={700} noWrap>{review.username || 'Користувач'}</Typography>
                  </Box>
                  <Mono sx={{ fontSize: '0.72rem', color: cr.faint, flexShrink: 0 }}>{new Date(review.created_at).toLocaleDateString('uk-UA')}</Mono>
                </Box>
                <Rating value={review.rating} readOnly size="small" sx={{ mb: 0.75 }} />
                {review.comment && <Typography variant="body2" sx={{ color: cr.muted, lineHeight: 1.7 }}>{review.comment}</Typography>}
              </GlassCard>
            </Reveal>
          ))}
        </Box>
      </Box>

      {/* ── Booking dialog (stepper) ── */}
      <Dialog open={Boolean(quickTarget)} onClose={closeQuickBook} maxWidth="sm" fullWidth aria-labelledby="qb-title">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, pt: 2.5 }}>
          <Box>
            <Typography sx={capsLabel}>BOOKING://NEW</Typography>
            <Typography id="qb-title" component="h2" sx={{ fontFamily: font.display, fontWeight: 700, fontSize: '1.2rem' }}>
              Бронювання <Mono sx={{ color: cr.primaryText }}>{quickTarget?.name}</Mono>
            </Typography>
          </Box>
          <IconButton size="small" onClick={closeQuickBook} aria-label="Закрити"><CloseIcon /></IconButton>
        </Box>
        <DialogContent sx={{ pt: 2.5 }}>
          <HudStepper steps={BOOKING_STEPS} active={qbStep} sx={{ mb: 3 }} />

          {qbSuccess ? (
            <AccessGranted
              pcName={quickTarget?.name}
              when={qbStart?.isValid() && qbEnd?.isValid() ? `${qbStart.format('D MMM, HH:mm')} → ${qbEnd.format('HH:mm')}` : null}
              onClose={closeQuickBook}
            />
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
              {!isAuthenticated && (
                <Alert severity="info">
                  <Link component={RouterLink} to="/login">Увійдіть</Link> для бронювання
                </Alert>
              )}

              {qbStep === 1 && (
                <>
                  <DatePicker label="Дата" value={qbDate} onChange={handleQbDateChange} minDate={dayjs()} slotProps={{ textField: { fullWidth: true, size: 'small' } }} />

                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.25 }}>
                      <AccessTimeIcon sx={{ fontSize: 15, color: cr.primaryText }} />
                      <Typography sx={capsLabel}>Час початку</Typography>
                    </Box>
                    <TimeSlotGrid date={qbDate} value={qbStart} onChange={handleQbStartChange} busyKeys={qbBusyKeys} />
                  </Box>

                  {qbStart?.isValid() && (
                    <Box>
                      <Typography sx={{ ...capsLabel, mb: 1 }}>Тривалість</Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {QUICK_DURATIONS.map((d) => {
                          const target = qbStart.add(d.minutes, 'minute')
                          const isSel = qbEnd?.isValid() && qbEnd.isSame(target, 'minute')
                          return (
                            <Button key={d.label} size="small" variant={isSel ? 'contained' : 'outlined'} aria-pressed={isSel}
                              onClick={() => { setQbEnd(target); setQbAvailability(null); setQbError('') }}
                              sx={{ flex: 1, fontFamily: font.mono }}>
                              {d.label}
                            </Button>
                          )
                        })}
                      </Box>
                    </Box>
                  )}

                  <DateTimePicker label="Кінець сесії" value={qbEnd}
                    onChange={(v) => { setQbEnd(v); setQbAvailability(null); setQbError('') }}
                    minDateTime={qbStart?.isValid() ? qbStart.add(30, 'minute') : dayjs()}
                    minutesStep={15} ampm={false}
                    slotProps={{ textField: { fullWidth: true, size: 'small' } }} />

                  {qbTimeValid && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1.5, borderRadius: '12px', bgcolor: tint(cr.primary, 8), border: `1px solid ${cr.border}` }}>
                      <Mono sx={{ fontSize: '0.85rem', color: cr.muted }}>{qbStart.format('HH:mm')} → {qbEnd.format('HH:mm')} · {qbDurationLabel}</Mono>
                      {qbEstCost && <Mono sx={{ fontWeight: 700, color: cr.successText }}>≈ ₴{qbEstCost}</Mono>}
                    </Box>
                  )}

                  {qbAvailability && !qbAvailability.available && (
                    <Alert severity="warning">Час зайнятий. Оберіть інший слот.</Alert>
                  )}
                  {qbError && <Alert severity="error">{qbError}</Alert>}

                  <Button variant="contained" size="large" fullWidth disabled={!qbTimeValid} loading={qbChecking} onClick={handleQbCheck} endIcon={<ArrowForwardIcon />}>
                    {qbChecking ? 'Перевірка...' : 'Перевірити доступність'}
                  </Button>
                </>
              )}

              {qbStep === 2 && (
                <>
                  <Alert severity="success">Вільний на обраний час!</Alert>

                  <BookingSummary
                    pcName={quickTarget?.name}
                    clubName={club.name}
                    start={qbStart}
                    end={qbEnd}
                    durationLabel={qbDurationLabel}
                    pricePerHour={quickTarget?.price_per_hour}
                    baseCost={qbEstCost}
                    discountPct={qbDiscountPct}
                    finalCost={qbDiscountedCost ?? qbEstCost}
                  />

                  <Box>
                    <Button size="small" startIcon={<LocalOfferIcon sx={{ fontSize: 14 }} />} onClick={() => setQbShowPromo((v) => !v)} aria-expanded={qbShowPromo}>
                      {qbShowPromo ? 'Приховати промо-код' : 'Є промо-код?'}
                    </Button>
                    <Collapse in={qbShowPromo}>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mt: 1.5 }}>
                        <TextField size="small" label="Промо-код" value={qbPromoCode}
                          onChange={(e) => { setQbPromoCode(e.target.value.toUpperCase()); setQbPromoResult(null) }}
                          inputProps={{ style: { fontFamily: 'var(--cr-font-mono)', letterSpacing: '0.12em' } }}
                          sx={{ flex: 1 }} />
                        <Button variant="outlined" onClick={handleQbValidatePromo} loading={qbPromoValidating} disabled={!qbPromoCode.trim()} sx={{ height: 40, flexShrink: 0 }}>
                          OK
                        </Button>
                      </Box>
                      {qbPromoResult && (
                        <Alert severity={qbPromoResult.valid ? 'success' : 'error'} sx={{ mt: 1, py: 0.25 }}>
                          {qbPromoResult.valid ? `Знижка ${qbPromoResult.discount_percent}% застосована!` : qbPromoResult.message || 'Невірний код'}
                        </Alert>
                      )}
                    </Collapse>
                  </Box>

                  {qbError && <Alert severity="error">{qbError}</Alert>}

                  <Box sx={{ display: 'flex', gap: 1.25, flexDirection: { xs: 'column-reverse', sm: 'row' } }}>
                    <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => setQbAvailability(null)} sx={{ flexShrink: 0 }}>Назад</Button>
                    {isAuthenticated && (
                      <Button variant="contained" fullWidth size="large" onClick={handleQbBook} loading={qbBooking}>
                        {qbBooking ? 'Бронювання...' : `Забронювати${qbDiscountedCost ? ` · ₴${qbDiscountedCost}` : qbEstCost ? ` · ₴${qbEstCost}` : ''}`}
                      </Button>
                    )}
                  </Box>
                </>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default ClubDetailPage

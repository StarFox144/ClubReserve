import { useState, useEffect, useCallback } from 'react'
import {
  Alert, Box, Breadcrumbs, Button, Card, CardActions, CardContent,
  Chip, CircularProgress, Dialog, DialogContent, DialogTitle,
  Divider, Grid, IconButton, Link, Rating, TextField, Typography,
} from '@mui/material'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import dayjs from 'dayjs'
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import ComputerIcon from '@mui/icons-material/Computer'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import BuildIcon from '@mui/icons-material/Build'
import BlockIcon from '@mui/icons-material/Block'
import StarIcon from '@mui/icons-material/Star'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CloseIcon from '@mui/icons-material/Close'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { useAuth } from '../contexts/AuthContext'
import { getClub, getBusyComputers } from '../api/clubs'
import { getComputers, checkAvailability } from '../api/computers'
import { getReviews, createReview } from '../api/reviews'
import { createBooking } from '../api/bookings'

const STATUS_CONFIG = {
  free:        { label: 'Вільний',    color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.3)',  icon: <CheckCircleIcon sx={{ fontSize: 14 }} /> },
  busy:        { label: 'Зайнятий',   color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.3)',   icon: <BlockIcon sx={{ fontSize: 14 }} /> },
  maintenance: { label: 'Тех. огляд', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', icon: <BuildIcon sx={{ fontSize: 14 }} /> },
}

const QUICK_DURATIONS = [
  { label: '1 год', minutes: 60 },
  { label: '2 год', minutes: 120 },
  { label: '3 год', minutes: 180 },
]

const toApiStr = (dj) => dj?.isValid() ? dj.format('YYYY-MM-DDTHH:mm') : ''

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

const ClubDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()

  const [club, setClub] = useState(null)
  const [computers, setComputers] = useState([])
  const [busyIds, setBusyIds] = useState(new Set())
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewLoading, setReviewLoading] = useState(false)
  const [reviewError, setReviewError] = useState('')

  // Quick booking dialog
  const [quickTarget, setQuickTarget] = useState(null)
  const [qbStart, setQbStart] = useState(null)
  const [qbEnd, setQbEnd] = useState(null)
  const [qbAvailability, setQbAvailability] = useState(null)
  const [qbSuccess, setQbSuccess] = useState(false)
  const [qbError, setQbError] = useState('')
  const [qbChecking, setQbChecking] = useState(false)
  const [qbBooking, setQbBooking] = useState(false)

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
    setQbStart(null); setQbEnd(null)
    setQbAvailability(null); setQbSuccess(false)
    setQbError('')
  }
  const closeQuickBook = () => setQuickTarget(null)

  const handleQbStartChange = (val) => {
    setQbStart(val)
    if (val?.isValid()) setQbEnd(val.add(1, 'hour'))
    else setQbEnd(null)
    setQbAvailability(null); setQbSuccess(false); setQbError('')
  }

  const handleQbCheck = async () => {
    if (!qbStart?.isValid() || !qbEnd?.isValid()) return
    setQbError(''); setQbChecking(true); setQbAvailability(null)
    try {
      const res = await checkAvailability(quickTarget.id, toApiStr(qbStart), toApiStr(qbEnd))
      setQbAvailability(res)
    } catch { setQbError('Помилка перевірки доступності') }
    finally { setQbChecking(false) }
  }

  const handleQbBook = async () => {
    setQbError(''); setQbBooking(true)
    try {
      await createBooking(quickTarget.id, toApiStr(qbStart), toApiStr(qbEnd))
      setQbSuccess(true); setQbAvailability(null)
      fetchBusy()
    } catch (e) {
      const detail = e.response?.data?.detail || ''
      setQbError(e.response?.status === 409 || detail.toLowerCase().includes('already booked')
        ? 'Цей час вже зайнятий. Оберіть інший.'
        : detail || 'Помилка при бронюванні')
    } finally { setQbBooking(false) }
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress sx={{ color: '#a855f7' }} /></Box>
  if (error || !club) return <Alert severity="error">{error || 'Клуб не знайдено'}</Alert>

  const freeCount = computers.filter((c) => c.is_active && !busyIds.has(c.id)).length
  const busyCount = computers.filter((c) => busyIds.has(c.id)).length
  const maintenanceCount = computers.filter((c) => !c.is_active).length
  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0
  const hasReviewed = user && reviews.some((r) => r.user_id === user.id)

  const qbTimeValid = qbStart?.isValid() && qbEnd?.isValid() && qbEnd.isAfter(qbStart.add(29, 'minute'))
  const qbDurationMins = qbTimeValid ? qbEnd.diff(qbStart, 'minute') : 0
  const qbDurationLabel = qbDurationMins > 0
    ? `${Math.floor(qbDurationMins / 60)}${Math.floor(qbDurationMins / 60) > 0 ? ' год' : ''}${qbDurationMins % 60 > 0 ? ` ${qbDurationMins % 60} хв` : ''}`
    : null
  const qbEstCost = qbTimeValid && quickTarget?.price_per_hour
    ? (qbDurationMins / 60 * Number(quickTarget.price_per_hour)).toFixed(2)
    : null

  return (
    <Box>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/clubs" underline="hover" sx={{ color: 'text.secondary', '&:hover': { color: '#a855f7' } }}>
          Клуби
        </Link>
        <Typography sx={{ background: 'linear-gradient(135deg,#a855f7,#818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontWeight: 600 }}>
          {club.name}
        </Typography>
      </Breadcrumbs>

      {/* Club header */}
      <Box sx={(theme) => ({
        p: 4, mb: 4, borderRadius: 3,
        background: theme.palette.mode === 'dark' ? 'linear-gradient(135deg,#12121a 0%,#1a0a2e 100%)' : 'linear-gradient(135deg,#faf7ff 0%,#f0e9ff 100%)',
        border: '1px solid rgba(147,51,234,0.25)', boxShadow: '0 4px 24px rgba(147,51,234,0.1)',
      })}>
        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ background: 'linear-gradient(135deg,#e2e8f0,#a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          {club.name}
        </Typography>

        {reviews.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Rating value={avgRating} precision={0.5} readOnly size="small" sx={{ '& .MuiRating-iconFilled': { color: '#f59e0b' } }} />
            <Typography variant="body2" color="text.secondary">
              {avgRating.toFixed(1)} ({reviews.length} {reviews.length < 5 ? 'відгуки' : 'відгуків'})
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
          <LocationOnIcon sx={{ fontSize: 16, color: '#a855f7' }} />
          <Typography color="text.secondary">{club.address}</Typography>
        </Box>

        <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 600 }}>{club.description}</Typography>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {[
            { label: 'Вільних',    value: freeCount,        color: '#10b981' },
            { label: 'Зайнятих',   value: busyCount,        color: '#ef4444' },
            { label: 'Тех. огляд', value: maintenanceCount, color: '#f59e0b' },
            { label: 'Всього',     value: computers.length, color: '#a855f7' },
          ].map((s) => (
            <Box key={s.label} sx={(theme) => ({
              px: 3, py: 1.5, borderRadius: 2, textAlign: 'center', minWidth: 90,
              background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              border: `1px solid ${s.color}33`,
            })}>
              <Typography variant="h5" fontWeight={700} sx={{ color: s.color }}>{s.value}</Typography>
              <Typography variant="caption" color="text.secondary">{s.label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Divider sx={{ mb: 4 }} />
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>Комп'ютери клубу</Typography>

      {computers.length === 0 && <Typography color="text.secondary">У цьому клубі ще немає комп'ютерів</Typography>}

      <Grid container spacing={2}>
        {computers.map((computer) => {
          const status = !computer.is_active ? 'maintenance' : busyIds.has(computer.id) ? 'busy' : 'free'
          const cfg = STATUS_CONFIG[status]
          const canBook = status === 'free'
          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={computer.id}>
              <Card sx={{
                height: '100%', display: 'flex', flexDirection: 'column',
                transition: 'transform 0.2s,box-shadow 0.2s', opacity: canBook ? 1 : 0.65,
                ...(canBook && { '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 6px 24px rgba(147,51,234,0.2)', borderColor: 'rgba(147,51,234,0.5)' } }),
              }}>
                <Box sx={{ px: 2, py: 1.5, background: cfg.bg, borderBottom: `1px solid ${cfg.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ComputerIcon sx={{ fontSize: 18, color: cfg.color }} />
                    <Typography variant="subtitle2" fontWeight={700}>{computer.name}</Typography>
                  </Box>
                  <Chip icon={cfg.icon} label={cfg.label} size="small" sx={{ bgcolor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, fontSize: '0.7rem', height: 22, '& .MuiChip-icon': { color: cfg.color } }} />
                </Box>
                <CardContent sx={{ flexGrow: 1, py: 1.5 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>{computer.description}</Typography>
                  {computer.price_per_hour && (
                    <Typography variant="body2" fontWeight={700} sx={{ color: '#a855f7', mt: 1, fontSize: '0.85rem' }}>
                      ₴{Number(computer.price_per_hour).toFixed(0)}/год
                    </Typography>
                  )}
                </CardContent>
                <CardActions sx={{ px: 2, pb: 2, gap: 1 }}>
                  <Button variant={canBook ? 'contained' : 'outlined'} size="small" fullWidth
                    onClick={() => canBook ? openQuickBook(computer) : null}
                    disabled={!canBook}
                    sx={!canBook ? { borderColor: 'rgba(255,255,255,0.1)', color: 'text.disabled' } : {}}>
                    {canBook ? 'Забронювати' : cfg.label}
                  </Button>
                  <Button variant="outlined" size="small" onClick={() => navigate(`/computers/${computer.id}`)}
                    sx={{ flexShrink: 0, minWidth: 'auto', px: 1, borderColor: 'rgba(147,51,234,0.3)', color: '#a855f7' }}>
                    <OpenInNewIcon sx={{ fontSize: 16 }} />
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          )
        })}
      </Grid>

      {/* Reviews */}
      <Divider sx={{ my: 5 }} />
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Відгуки
        {reviews.length > 0 && (
          <Box component="span" sx={{ ml: 2 }}>
            <Rating value={avgRating} precision={0.5} readOnly size="small" sx={{ verticalAlign: 'middle', '& .MuiRating-iconFilled': { color: '#f59e0b' } }} />
            <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              {avgRating.toFixed(1)} · {reviews.length} відгук{reviews.length < 5 ? 'и' : 'ів'}
            </Typography>
          </Box>
        )}
      </Typography>

      {isAuthenticated && !hasReviewed && (
        <Box component="form" onSubmit={handleSubmitReview} sx={(theme) => ({ p: 3, mb: 4, borderRadius: 2, background: theme.palette.mode === 'dark' ? 'rgba(147,51,234,0.05)' : 'rgba(147,51,234,0.04)', border: '1px solid rgba(147,51,234,0.2)' })}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>Залишити відгук</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Typography variant="body2" color="text.secondary">Оцінка:</Typography>
            <Rating value={reviewRating} onChange={(_, v) => setReviewRating(v)} icon={<StarIcon sx={{ color: '#f59e0b' }} />} />
          </Box>
          <TextField fullWidth multiline rows={3} label="Коментар (необов'язково)" value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} sx={{ mb: 2 }} />
          {reviewError && <Alert severity="error" sx={{ mb: 2 }}>{reviewError}</Alert>}
          <Button type="submit" variant="contained" disabled={reviewLoading}>{reviewLoading ? 'Збереження...' : 'Опублікувати відгук'}</Button>
        </Box>
      )}

      {reviews.length === 0 && <Typography color="text.secondary">{isAuthenticated ? 'Будьте першим, хто залишить відгук!' : 'Відгуків ще немає.'}</Typography>}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {reviews.map((review) => (
          <Box key={review.id} sx={(theme) => ({ p: 2.5, borderRadius: 2, background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#faf7ff', border: '1px solid rgba(147,51,234,0.12)' })}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#9333ea)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>
                  {(review.username || 'U').charAt(0).toUpperCase()}
                </Box>
                <Typography variant="subtitle2" fontWeight={600}>{review.username || 'Користувач'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Rating value={review.rating} readOnly size="small" sx={{ '& .MuiRating-iconFilled': { color: '#f59e0b' } }} />
                <Typography variant="caption" color="text.disabled">{new Date(review.created_at).toLocaleDateString('uk-UA')}</Typography>
              </Box>
            </Box>
            {review.comment && <Typography variant="body2" color="text.secondary">{review.comment}</Typography>}
          </Box>
        ))}
      </Box>

      {/* Quick Booking Dialog */}
      <Dialog open={Boolean(quickTarget)} onClose={closeQuickBook} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>Бронювання</Typography>
            <Typography variant="body2" color="text.secondary">{quickTarget?.name}</Typography>
          </Box>
          <IconButton size="small" onClick={closeQuickBook}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: '8px !important' }}>
          {qbSuccess ? (
            <Alert severity="success" sx={{ bgcolor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}>
              Бронювання успішно створено!{' '}
              <Link component={RouterLink} to="/bookings" sx={{ color: '#10b981', fontWeight: 600 }}>Мої бронювання</Link>
            </Alert>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {!isAuthenticated && (
                <Alert severity="info" sx={{ bgcolor: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8' }}>
                  <Link component={RouterLink} to="/login" sx={{ color: '#a855f7' }}>Увійдіть</Link> для бронювання
                </Alert>
              )}

              <DateTimePicker label="Початок сесії" value={qbStart} onChange={handleQbStartChange}
                minDateTime={dayjs()} minutesStep={15} ampm={false} sx={pickerSx}
                slotProps={{ textField: { fullWidth: true, size: 'small' } }} />

              {qbStart?.isValid() && (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                    <AccessTimeIcon sx={{ fontSize: 14, color: '#a855f7' }} />
                    <Typography variant="body2" fontWeight={600}>Тривалість</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {QUICK_DURATIONS.map((d) => {
                      const target = qbStart.add(d.minutes, 'minute')
                      const selected = qbEnd?.isValid() && qbEnd.isSame(target, 'minute')
                      return (
                        <Button key={d.label} size="small" variant={selected ? 'contained' : 'outlined'}
                          onClick={() => { setQbEnd(target); setQbAvailability(null); setQbError('') }}
                          sx={{ flex: 1, ...(selected ? {} : { borderColor: 'rgba(147,51,234,0.4)', color: 'text.secondary' }) }}>
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
                minutesStep={15} ampm={false} sx={pickerSx}
                slotProps={{ textField: { fullWidth: true, size: 'small' } }} />

              {qbTimeValid && (
                <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(147,51,234,0.06)', border: '1px solid rgba(147,51,234,0.2)', display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">{qbDurationLabel}</Typography>
                  {qbEstCost && <Typography variant="body2" fontWeight={700} sx={{ color: '#10b981' }}>≈ ₴{qbEstCost}</Typography>}
                </Box>
              )}

              {qbError && <Alert severity="error" sx={{ bgcolor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>{qbError}</Alert>}

              {qbAvailability && (
                <Alert severity={qbAvailability.available ? 'success' : 'warning'}
                  sx={qbAvailability.available
                    ? { bgcolor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }
                    : { bgcolor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
                  {qbAvailability.available ? "Вільний на обраний час!" : 'Час зайнятий. Оберіть інший.'}
                </Alert>
              )}

              <Button variant="outlined" fullWidth disabled={!qbTimeValid || qbChecking} onClick={handleQbCheck}
                startIcon={qbChecking ? <CircularProgress size={14} color="inherit" /> : null}>
                {qbChecking ? 'Перевірка...' : 'Перевірити доступність'}
              </Button>

              {isAuthenticated && qbAvailability?.available && (
                <Button variant="contained" fullWidth size="large" onClick={handleQbBook} disabled={qbBooking}
                  startIcon={qbBooking ? <CircularProgress size={14} color="inherit" /> : null}>
                  {qbBooking ? 'Бронювання...' : 'Забронювати'}
                </Button>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default ClubDetailPage

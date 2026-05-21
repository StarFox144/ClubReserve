import { useState, useEffect } from 'react'
import {
  Alert, Box, Button, CircularProgress, Divider,
  Grid, LinearProgress, Paper, TextField, Tooltip, Typography,
} from '@mui/material'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { usePageTitle } from '../hooks/usePageTitle'
import { updateMe, getMe } from '../api/users'
import apiClient from '../api/client'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Cancel'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import StarsIcon from '@mui/icons-material/Stars'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import StorefrontIcon from '@mui/icons-material/Storefront'
import RateReviewIcon from '@mui/icons-material/RateReview'

const BADGES = [
  { id: 'first',     emoji: '🎮', title: 'Перший крок',       desc: 'Перше бронювання',          condition: (s) => s.total_bookings >= 1  },
  { id: 'five',      emoji: '⚡', title: 'Активний гравець',   desc: '5 бронювань',               condition: (s) => s.total_bookings >= 5  },
  { id: 'ten',       emoji: '🏆', title: 'Постійний клієнт',   desc: '10 бронювань',              condition: (s) => s.total_bookings >= 10 },
  { id: 'hours5',    emoji: '⏰', title: '5 годин у клубі',    desc: 'Загалом 5+ годин',          condition: (s) => s.total_hours >= 5     },
  { id: 'hours20',   emoji: '🌟', title: 'Зірка клубу',        desc: '20+ годин зіграно',         condition: (s) => s.total_hours >= 20    },
  { id: 'reviewer',  emoji: '✍️', title: 'Критик',             desc: 'Залишив перший відгук',     condition: (s) => s.total_reviews >= 1   },
  { id: 'loyal100',  emoji: '💜', title: 'Лоялний',            desc: '100+ балів лояльності',     condition: (s) => s.loyalty_points >= 100},
  { id: 'loyal500',  emoji: '👑', title: 'VIP',                desc: '500+ балів лояльності',     condition: (s) => s.loyalty_points >= 500},
]

const LOYALTY_LEVELS = [
  { min: 0,   max: 100,  label: 'Новачок',   color: '#6b7280' },
  { min: 100, max: 300,  label: 'Гравець',   color: '#818cf8' },
  { min: 300, max: 700,  label: 'Ветеран',   color: '#a855f7' },
  { min: 700, max: 1500, label: 'Майстер',   color: '#f59e0b' },
  { min: 1500,max: 9999, label: 'Легенда',   color: '#10b981' },
]

const getLoyaltyLevel = (pts) => LOYALTY_LEVELS.find((l) => pts >= l.min && pts < l.max) || LOYALTY_LEVELS[LOYALTY_LEVELS.length - 1]

const ProfilePage = () => {
  usePageTitle('Профіль')
  const { user } = useAuth()
  const { showToast } = useToast()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ username: user?.username || '', email: user?.email || '' })
  const [stats, setStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    apiClient.get('/users/me/stats')
      .then((r) => setStats(r.data))
      .catch(() => {})
      .finally(() => setStatsLoading(false))
  }, [])

  const updateMutation = useMutation({
    mutationFn: updateMe,
    onSuccess: () => {
      setEditing(false)
      showToast('Профіль оновлено!', 'success')
    },
    onError: (err) => {
      showToast(err.response?.data?.detail || 'Помилка оновлення профілю', 'error')
    },
  })

  const handleSave = (e) => {
    e.preventDefault()
    updateMutation.mutate(form)
  }

  if (!user) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress sx={{ color: '#a855f7' }} /></Box>
  }

  const pts = stats?.loyalty_points || 0
  const level = getLoyaltyLevel(pts)
  const nextLevel = LOYALTY_LEVELS[LOYALTY_LEVELS.findIndex((l) => pts >= l.min && pts < l.max) + 1]
  const progress = nextLevel ? ((pts - level.min) / (nextLevel.min - level.min)) * 100 : 100
  const earnedBadges = stats ? BADGES.filter((b) => b.condition(stats)) : []
  const lockedBadges = stats ? BADGES.filter((b) => !b.condition(stats)) : []

  const STAT_ITEMS = [
    { icon: <CalendarMonthIcon />, label: 'Бронювань', value: stats?.total_bookings ?? '—', color: '#a855f7' },
    { icon: <AccessTimeIcon />,    label: 'Годин зіграно', value: stats?.total_hours != null ? `${stats.total_hours}г` : '—', color: '#818cf8' },
    { icon: <RateReviewIcon />,    label: 'Відгуків', value: stats?.total_reviews ?? '—', color: '#f59e0b' },
    { icon: <StorefrontIcon />,    label: 'Улюблений клуб', value: stats?.favorite_club || '—', color: '#10b981', small: true },
  ]

  return (
    <Box sx={{ maxWidth: 760, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={700} gutterBottom sx={{
        background: 'linear-gradient(135deg,#e2e8f0,#a855f7)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
      }}>
        Профіль
      </Typography>

      {/* Header card */}
      <Paper sx={(theme) => ({
        p: { xs: 2.5, sm: 4 }, mb: 3, borderRadius: 3,
        background: theme.palette.mode === 'dark' ? 'linear-gradient(135deg,#12121a,#1a0a2e)' : 'linear-gradient(135deg,#faf7ff,#f0e9ff)',
        border: '1px solid rgba(147,51,234,0.25)',
      })}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, sm: 3 }, flexWrap: 'wrap' }}>
          {/* Avatar */}
          <Box sx={{
            width: 80, height: 80, borderRadius: 3, flexShrink: 0,
            background: 'linear-gradient(135deg,#7c3aed,#9333ea)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', fontWeight: 800, color: '#fff',
            boxShadow: '0 0 25px rgba(147,51,234,0.5)',
          }}>
            {user.username?.charAt(0).toUpperCase()}
          </Box>

          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 0.5 }}>
              <Typography variant="h5" fontWeight={800}>{user.username}</Typography>
              {user.is_admin && (
                <Box sx={{ px: 1.5, py: 0.25, borderRadius: 10, bgcolor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: '0.75rem', fontWeight: 700 }}>
                  ADMIN
                </Box>
              )}
              <Box sx={{ px: 1.5, py: 0.25, borderRadius: 10, border: `1px solid ${level.color}50`, color: level.color, fontSize: '0.75rem', fontWeight: 700, bgcolor: `${level.color}12` }}>
                {level.label}
              </Box>
            </Box>
            <Typography color="text.secondary" variant="body2">{user.email}</Typography>
            <Typography color="text.disabled" variant="caption">
              Учасник з {new Date(user.created_at).toLocaleDateString('uk-UA', { day: '2-digit', month: 'long', year: 'numeric' })}
            </Typography>
          </Box>
        </Box>

        {/* Loyalty bar */}
        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <StarsIcon sx={{ fontSize: 16, color: level.color }} />
              <Typography variant="body2" fontWeight={700} sx={{ color: level.color }}>
                {pts} балів лояльності
              </Typography>
            </Box>
            {nextLevel && (
              <Typography variant="caption" color="text.secondary">
                До «{nextLevel.label}»: {nextLevel.min - pts} балів
              </Typography>
            )}
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(progress, 100)}
            sx={{
              height: 8, borderRadius: 4,
              bgcolor: `${level.color}20`,
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                background: `linear-gradient(90deg,${level.color},${nextLevel?.color || level.color})`,
              },
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
            {LOYALTY_LEVELS.slice(0, -1).map((l) => (
              <Typography key={l.label} variant="caption" sx={{ color: pts >= l.min ? l.color : 'text.disabled', fontSize: '0.65rem' }}>
                {l.label}
              </Typography>
            ))}
          </Box>
        </Box>
      </Paper>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {STAT_ITEMS.map((s) => (
          <Grid item xs={6} md={3} key={s.label}>
            <Paper sx={(theme) => ({
              p: 2.5, textAlign: 'center', borderRadius: 2,
              background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#faf7ff',
              border: `1px solid ${s.color}25`,
              transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-3px)', borderColor: `${s.color}50` },
            })}>
              <Box sx={{ color: s.color, mb: 0.5 }}>{s.icon}</Box>
              <Typography variant={s.small ? 'body2' : 'h5'} fontWeight={700} sx={{ color: s.color, lineHeight: 1.2 }}>
                {statsLoading ? '...' : s.value}
              </Typography>
              <Typography variant="caption" color="text.secondary">{s.label}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Badges */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
          <EmojiEventsIcon sx={{ color: '#f59e0b' }} />
          <Typography variant="subtitle1" fontWeight={700}>
            Досягнення ({earnedBadges.length}/{BADGES.length})
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
          {earnedBadges.map((b) => (
            <Tooltip key={b.id} title={b.desc} arrow>
              <Box sx={{
                display: 'flex', alignItems: 'center', gap: 1,
                px: 2, py: 1, borderRadius: 2,
                bgcolor: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.3)',
                cursor: 'default', transition: 'transform 0.2s',
                '&:hover': { transform: 'scale(1.05)' },
              }}>
                <Typography sx={{ fontSize: '1.2rem' }}>{b.emoji}</Typography>
                <Typography variant="body2" fontWeight={600} sx={{ color: '#a855f7' }}>{b.title}</Typography>
              </Box>
            </Tooltip>
          ))}
          {lockedBadges.map((b) => (
            <Tooltip key={b.id} title={`🔒 ${b.desc}`} arrow>
              <Box sx={{
                display: 'flex', alignItems: 'center', gap: 1,
                px: 2, py: 1, borderRadius: 2,
                bgcolor: 'rgba(107,114,128,0.05)', border: '1px solid rgba(107,114,128,0.15)',
                opacity: 0.45, cursor: 'default', filter: 'grayscale(1)',
              }}>
                <Typography sx={{ fontSize: '1.2rem' }}>{b.emoji}</Typography>
                <Typography variant="body2" fontWeight={600} color="text.disabled">{b.title}</Typography>
              </Box>
            </Tooltip>
          ))}
        </Box>
      </Paper>

      {/* Edit profile */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2.5 }}>Редагування профілю</Typography>
        <Divider sx={{ mb: 3 }} />

        {!editing ? (
          <>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {[
                { label: "Ім'я користувача", value: user.username },
                { label: 'Email',             value: user.email },
                { label: 'ID',                value: `#${user.id}` },
                { label: 'Дата реєстрації',   value: new Date(user.created_at).toLocaleDateString('uk-UA') },
              ].map((f) => (
                <Grid item xs={12} sm={6} key={f.label}>
                  <Typography variant="caption" color="text.secondary">{f.label}</Typography>
                  <Typography fontWeight={600} sx={{ mt: 0.25 }}>{f.value}</Typography>
                </Grid>
              ))}
            </Grid>
            <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setEditing(true)} sx={{ borderColor: 'rgba(147,51,234,0.4)', color: '#a855f7', '&:hover': { borderColor: '#a855f7', bgcolor: 'rgba(147,51,234,0.06)' } }}>
              Редагувати
            </Button>
          </>
        ) : (
          <Box component="form" onSubmit={handleSave}>
            <TextField fullWidth label="Ім'я користувача" value={form.username}
              onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))} sx={{ mb: 2 }} />
            <TextField fullWidth label="Email" type="email" value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} sx={{ mb: 3 }} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? <CircularProgress size={20} color="inherit" /> : 'Зберегти'}
              </Button>
              <Button variant="outlined" startIcon={<CancelIcon />} onClick={() => { setEditing(false); setForm({ username: user.username, email: user.email }) }} disabled={updateMutation.isPending}>
                Скасувати
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  )
}

export default ProfilePage

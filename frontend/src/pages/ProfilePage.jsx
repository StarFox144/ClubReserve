import { useState, useEffect } from 'react'
import { Box, Button, TextField, Tooltip, Typography } from '@mui/material'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { usePageTitle } from '../hooks/usePageTitle'
import { updateMe } from '../api/users'
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
import LockIcon from '@mui/icons-material/Lock'
import { cr, font, tint } from '../design/tokens'
import { GlassCard, HudStat, Mono, PageLoader, Reveal, SectionHeader, StatusBadge } from '../components/ui'

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
  { min: 0,   max: 100,  label: 'Новачок',   color: cr.faint },
  { min: 100, max: 300,  label: 'Гравець',   color: cr.cyan },
  { min: 300, max: 700,  label: 'Ветеран',   color: cr.primary2 },
  { min: 700, max: 1500, label: 'Майстер',   color: cr.vip },
  { min: 1500,max: 9999, label: 'Легенда',   color: cr.success },
]

const getLoyaltyLevel = (pts) => LOYALTY_LEVELS.find((l) => pts >= l.min && pts < l.max) || LOYALTY_LEVELS[LOYALTY_LEVELS.length - 1]

const capsLabel = { fontFamily: font.mono, fontSize: '0.66rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: cr.faint }

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

  if (!user) return <PageLoader label="Завантаження профілю" />

  const pts = stats?.loyalty_points || 0
  const level = getLoyaltyLevel(pts)
  const nextLevel = LOYALTY_LEVELS[LOYALTY_LEVELS.findIndex((l) => pts >= l.min && pts < l.max) + 1]
  const progress = nextLevel ? ((pts - level.min) / (nextLevel.min - level.min)) * 100 : 100
  const earnedBadges = stats ? BADGES.filter((b) => b.condition(stats)) : []
  const lockedBadges = stats ? BADGES.filter((b) => !b.condition(stats)) : []

  const STAT_ITEMS = [
    { icon: <CalendarMonthIcon />, label: 'Бронювань', value: stats?.total_bookings ?? '—', accent: cr.primary2 },
    { icon: <AccessTimeIcon />,    label: 'Годин у грі', value: stats?.total_hours != null ? `${stats.total_hours}г` : '—', accent: cr.cyan },
    { icon: <RateReviewIcon />,    label: 'Відгуків', value: stats?.total_reviews ?? '—', accent: cr.vip },
    { icon: <StorefrontIcon />,    label: 'Улюблений клуб', value: <Box component="span" sx={{ fontSize: '1rem' }}>{stats?.favorite_club || '—'}</Box>, accent: cr.success },
  ]

  return (
    <Box>
      <SectionHeader component="h1" label="Player profile" title="Профіль гравця" size="md" />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.1fr) minmax(0, 1fr)' }, gap: 3, alignItems: 'start' }}>
      <Box>

      {/* ── Identity ── */}
      <GlassCard hud accent={level.color} strong sx={{ p: { xs: 2.5, md: 4 }, mb: 3, overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2.5, md: 3.5 }, flexWrap: 'wrap' }}>
          {/* Avatar in neon ring */}
          <Box sx={{ position: 'relative', flexShrink: 0 }}>
            <Box aria-hidden sx={{ position: 'absolute', inset: -6, borderRadius: '50%', background: `conic-gradient(from 0deg, ${cr.primary2}, ${cr.cyan}, ${cr.magenta}, ${cr.primary2})`, filter: 'blur(10px)', opacity: 0.6, animation: 'cr-spin 8s linear infinite' }} />
            <Box sx={{ position: 'relative', p: '3px', borderRadius: '50%', background: `conic-gradient(from 0deg, ${cr.primary2}, ${cr.cyan}, ${cr.magenta}, ${cr.primary2})` }}>
              <Box sx={{ width: { xs: 84, md: 104 }, height: { xs: 84, md: 104 }, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: cr.surface, border: `3px solid ${cr.bg}`, fontFamily: font.display, fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 800, color: cr.text }}>
                {user.username?.charAt(0).toUpperCase()}
              </Box>
            </Box>
            <Box aria-hidden sx={{ position: 'absolute', right: 4, bottom: 6, width: 16, height: 16, borderRadius: '50%', bgcolor: cr.success, border: `3px solid ${cr.surface}`, boxShadow: `0 0 10px ${cr.success}` }} />
          </Box>

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.75 }}>
              <Typography component="h2" sx={{ fontFamily: font.display, fontWeight: 800, fontSize: { xs: '1.5rem', md: '1.9rem' }, mr: 0.5, wordBreak: 'break-word' }}>{user.username}</Typography>
              {user.is_admin && <StatusBadge status="admin" pulse={false} />}
              <StatusBadge color={level.color} label={level.label} pulse={false} />
            </Box>
            <Mono sx={{ display: 'block', color: cr.muted, fontSize: '0.88rem', wordBreak: 'break-all' }}>{user.email}</Mono>
            <Typography sx={{ color: cr.faint, fontSize: '0.8rem', mt: 0.5 }}>
              Учасник з {new Date(user.created_at).toLocaleDateString('uk-UA', { day: '2-digit', month: 'long', year: 'numeric' })}
            </Typography>
          </Box>
        </Box>

        {/* Loyalty XP bar */}
        <Box sx={{ mt: 3.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 1, mb: 1, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <StarsIcon sx={{ fontSize: 18, color: level.color }} />
              <Mono sx={{ fontWeight: 700, color: cr.text }}>{pts}</Mono>
              <Typography sx={{ fontSize: '0.85rem', color: cr.muted }}>балів лояльності</Typography>
            </Box>
            {nextLevel && (
              <Typography sx={{ fontSize: '0.8rem', color: cr.muted }}>
                До «{nextLevel.label}»: <Mono sx={{ color: cr.text }}>{nextLevel.min - pts}</Mono>
              </Typography>
            )}
          </Box>
          <Box role="progressbar" aria-valuenow={Math.round(Math.min(progress, 100))} aria-valuemin={0} aria-valuemax={100} aria-label="Прогрес рівня" sx={{ position: 'relative', height: 10, borderRadius: 10, bgcolor: tint(level.color, 15), overflow: 'hidden' }}>
            <Box sx={{ height: '100%', width: `${Math.min(progress, 100)}%`, borderRadius: 10, background: `linear-gradient(90deg, ${level.color}, ${nextLevel?.color || level.color})`, boxShadow: `0 0 14px ${level.color}`, transition: 'width 800ms var(--cr-ease)' }} />
            <Box aria-hidden sx={{ position: 'absolute', inset: 0, backgroundImage: `repeating-linear-gradient(90deg, transparent 0 18px, ${tint(cr.bg, 60)} 18px 20px)` }} />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.75 }}>
            {LOYALTY_LEVELS.slice(0, -1).map((l) => (
              <Typography key={l.label} sx={{ fontFamily: font.mono, fontSize: '0.62rem', letterSpacing: '0.06em', color: pts >= l.min ? cr.text : cr.faint }}>
                {l.label}
              </Typography>
            ))}
          </Box>
        </Box>
      </GlassCard>

      {/* ── Player stats ── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)', lg: 'repeat(2, 1fr)' }, gap: { xs: 1.5, md: 2 }, mb: { xs: 3, lg: 0 } }}>
        {STAT_ITEMS.map((s, i) => (
          <Reveal key={s.label} delay={i * 70}>
            <HudStat label={s.label} icon={s.icon} accent={s.accent} value={statsLoading ? '…' : s.value} />
          </Reveal>
        ))}
      </Box>

      </Box>

      <Box>
      {/* ── Achievements ── */}
      <GlassCard sx={{ p: { xs: 2.5, md: 3 }, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
          <EmojiEventsIcon sx={{ color: cr.vip }} />
          <Typography variant="h6" component="h3">Досягнення</Typography>
          <Mono sx={{ ml: 'auto', fontSize: '0.85rem', color: cr.muted }}>{earnedBadges.length}/{BADGES.length}</Mono>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)', lg: 'repeat(2, 1fr)' }, gap: 1.25 }}>
          {earnedBadges.map((b) => (
            <Tooltip key={b.id} title={b.desc}>
              <Box tabIndex={0} sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 1.25, borderRadius: '12px', bgcolor: tint(cr.primary2, 10), border: `1px solid ${tint(cr.primary2, 40)}`, boxShadow: `inset 0 0 14px ${tint(cr.primary2, 12)}`, transition: 'transform 200ms var(--cr-ease)', '&:hover': { transform: 'translateY(-2px)' }, '&:focus-visible': { boxShadow: cr.focusRing } }}>
                <Typography component="span" sx={{ fontSize: '1.25rem' }} aria-hidden>{b.emoji}</Typography>
                <Typography variant="body2" fontWeight={700} sx={{ color: cr.text, lineHeight: 1.25 }}>{b.title}</Typography>
              </Box>
            </Tooltip>
          ))}
          {lockedBadges.map((b) => (
            <Tooltip key={b.id} title={`Заблоковано: ${b.desc}`}>
              <Box tabIndex={0} sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 1.25, borderRadius: '12px', border: `1px dashed ${cr.border}`, color: cr.faint, '&:focus-visible': { boxShadow: cr.focusRing } }}>
                <LockIcon sx={{ fontSize: 18 }} />
                <Typography variant="body2" fontWeight={600} sx={{ color: cr.faint, lineHeight: 1.25 }}>{b.title}</Typography>
              </Box>
            </Tooltip>
          ))}
        </Box>
      </GlassCard>

      {/* ── Account data ── */}
      <GlassCard sx={{ p: { xs: 2.5, md: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 2.5 }}>
          <Typography variant="h6" component="h3">Дані акаунта</Typography>
          {!editing && (
            <Button variant="outlined" size="small" startIcon={<EditIcon />} onClick={() => setEditing(true)}>Редагувати</Button>
          )}
        </Box>

        {!editing ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.5 }}>
            {[
              { label: "Ім'я користувача", value: user.username },
              { label: 'Email',             value: user.email },
              { label: 'ID',                value: `#${user.id}`, mono: true },
              { label: 'Дата реєстрації',   value: new Date(user.created_at).toLocaleDateString('uk-UA'), mono: true },
            ].map((f) => (
              <Box key={f.label} sx={{ px: 2, py: 1.5, borderRadius: '12px', bgcolor: tint(cr.primary, 5), border: `1px solid ${cr.borderSoft}`, minWidth: 0 }}>
                <Typography sx={capsLabel}>{f.label}</Typography>
                <Typography fontWeight={600} sx={{ mt: 0.25, fontFamily: f.mono ? font.mono : undefined, wordBreak: 'break-word' }}>{f.value}</Typography>
              </Box>
            ))}
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSave} sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
            <TextField fullWidth label="Ім'я користувача" value={form.username}
              onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))} />
            <TextField fullWidth label="Email" type="email" value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Button type="submit" variant="contained" startIcon={<SaveIcon />} loading={updateMutation.isPending}>
                Зберегти
              </Button>
              <Button variant="outlined" startIcon={<CancelIcon />} onClick={() => { setEditing(false); setForm({ username: user.username, email: user.email }) }} disabled={updateMutation.isPending}>
                Скасувати
              </Button>
            </Box>
          </Box>
        )}
      </GlassCard>
      </Box>
      </Box>
    </Box>
  )
}

export default ProfilePage

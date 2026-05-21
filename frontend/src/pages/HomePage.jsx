import { useEffect, useRef, useState } from 'react'
import { Box, Button, Chip, Grid, Paper, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { usePageTitle } from '../hooks/usePageTitle'
import ParticleCanvas from '../components/ParticleCanvas'
import ComputerIcon from '@mui/icons-material/Computer'
import EventAvailableIcon from '@mui/icons-material/EventAvailable'
import SpeedIcon from '@mui/icons-material/Speed'
import StarIcon from '@mui/icons-material/Star'
import SecurityIcon from '@mui/icons-material/Security'
import GroupIcon from '@mui/icons-material/Group'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import CheckIcon from '@mui/icons-material/Check'

const FEATURES = [
  {
    icon: <ComputerIcon sx={{ fontSize: 32 }} />,
    color: '#a855f7',
    gradient: 'linear-gradient(135deg,rgba(168,85,247,0.2),rgba(168,85,247,0.05))',
    title: "Вибір комп'ютера",
    description: "Переглядайте доступні ПК у різних клубах. Характеристики, ціна, статус — все одразу.",
    points: ['RTX 4070-4090', '144–360 Гц монітори', 'Реальний статус'],
  },
  {
    icon: <EventAvailableIcon sx={{ fontSize: 32 }} />,
    color: '#818cf8',
    gradient: 'linear-gradient(135deg,rgba(129,140,248,0.2),rgba(129,140,248,0.05))',
    title: 'Онлайн бронювання',
    description: 'Бронюй у кілька кліків без черг. Вибирай час, перевіряй доступність, підтверджуй.',
    points: ['Миттєве підтвердження', 'QR-код бронювання', 'Промо-коди та знижки'],
  },
  {
    icon: <SpeedIcon sx={{ fontSize: 32 }} />,
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg,rgba(6,182,212,0.2),rgba(6,182,212,0.05))',
    title: 'Керуй часом',
    description: 'Скасовуй, продовжуй або переглядай бронювання в особистому кабінеті.',
    points: ['Продовжити на +1/+2 год', 'Фільтр за статусом', 'Архів бронювань'],
  },
]

const STATS = [
  { num: 3,    suffix: '+',  label: 'Клуби',            color: '#a855f7' },
  { num: 15,   suffix: '+',  label: "Комп'ютери",        color: '#818cf8' },
  { num: null, display: '24/7', label: 'Онлайн бронювання', color: '#06b6d4' },
  { num: 100,  suffix: '%',  label: 'Без черг',           color: '#10b981' },
]

const CountUp = ({ target, suffix = '', duration = 1200 }) => {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const start = performance.now()
          const tick = (now) => {
            const t = Math.min((now - start) / duration, 1)
            const ease = 1 - Math.pow(1 - t, 3)
            setCount(Math.round(ease * target))
            if (t < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.5 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [target, duration])

  return <span ref={ref}>{count}{suffix}</span>
}

const STEPS = [
  { num: '01', title: 'Реєстрація',    desc: 'Створи акаунт за 30 секунд' },
  { num: '02', title: 'Вибір клубу',   desc: 'Знайди клуб поруч або за рейтингом' },
  { num: '03', title: 'Обери ПК',      desc: 'Дивись характеристики та ціни' },
  { num: '04', title: 'Забронюй',      desc: 'Обери час і отримай QR-підтвердження' },
]

const HomePage = () => {
  usePageTitle('')
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  return (
    <Box>
      {/* ── Hero ── */}
      <Box sx={{
        position: 'relative', overflow: 'hidden',
        borderRadius: 4, mb: 8, py: { xs: 8, md: 14 }, px: { xs: 3, md: 6 },
        textAlign: 'center',
        background: 'linear-gradient(135deg,#08080f 0%,#12062a 50%,#080814 100%)',
        border: '1px solid rgba(147,51,234,0.3)',
        '&::before': {
          content: '""', position: 'absolute', inset: 0, borderRadius: 'inherit', padding: '1px',
          background: 'linear-gradient(135deg,#9333ea,#6366f1,#06b6d4,#9333ea)',
          backgroundSize: '300% 300%',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor', maskComposite: 'exclude',
          animation: 'rgbLine 5s linear infinite',
        },
      }}>
        {/* Particle canvas */}
        <ParticleCanvas count={65} maxDist={120} />

        {/* Glow blobs */}
        {[
          { top: '10%', left: '5%',  size: 350, color: 'rgba(147,51,234,0.12)' },
          { top: '40%', right: '5%', size: 280, color: 'rgba(99,102,241,0.1)' },
          { bottom: '5%', left: '30%', size: 200, color: 'rgba(6,182,212,0.08)' },
        ].map((b, i) => (
          <Box key={i} sx={{
            position: 'absolute', borderRadius: '50%', pointerEvents: 'none',
            width: b.size, height: b.size, filter: 'blur(60px)',
            background: `radial-gradient(circle,${b.color} 0%,transparent 70%)`,
            top: b.top, left: b.left, right: b.right, bottom: b.bottom,
          }} />
        ))}

        {/* Floating decorative PCs */}
        <Box className="float" sx={{ position: 'absolute', top: '15%', left: '6%', opacity: 0.08, fontSize: 80, color: '#a855f7', display: { xs: 'none', md: 'block' } }}>
          <ComputerIcon sx={{ fontSize: 80 }} />
        </Box>
        <Box className="float" sx={{ position: 'absolute', bottom: '15%', right: '6%', opacity: 0.08, animationDelay: '2s', display: { xs: 'none', md: 'block' } }}>
          <ComputerIcon sx={{ fontSize: 64, color: '#818cf8' }} />
        </Box>

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Chip
            label="🎮  Онлайн-бронювання комп'ютерних клубів"
            size="small"
            className="fade-in"
            sx={{ mb: 3, bgcolor: 'rgba(168,85,247,0.15)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.4)', fontWeight: 600, fontSize: '0.8rem' }}
          />

          <Typography
            variant="h1"
            className="shimmer-text"
            sx={{ fontWeight: 900, fontSize: { xs: '2.4rem', md: '4rem', lg: '4.8rem' }, lineHeight: 1.1, mb: 3 }}
          >
            Забронюй місце<br />у клубі онлайн
          </Typography>

          <Typography variant="h5" color="text.secondary"
            sx={{ mb: 5, maxWidth: 560, mx: 'auto', fontSize: { xs: '1rem', md: '1.15rem' }, lineHeight: 1.7 }}>
            ClubReserve — зручна платформа бронювання ПК у комп'ютерних клубах.
            Без черг, без дзвінків, миттєво.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="contained" size="large" onClick={() => navigate('/clubs')}
              endIcon={<ArrowForwardIcon />}
              sx={{ px: 5, py: 1.6, fontSize: '1rem', borderRadius: 3,
                background: 'linear-gradient(135deg,#7c3aed,#9333ea,#6366f1)',
                backgroundSize: '200%', transition: 'background-position 0.3s',
                '&:hover': { backgroundPosition: 'right center', boxShadow: '0 0 30px rgba(147,51,234,0.6)' },
              }}>
              Переглянути клуби
            </Button>
            {!isAuthenticated && (
              <Button variant="outlined" size="large" onClick={() => navigate('/register')}
                sx={{ px: 5, py: 1.6, fontSize: '1rem', borderRadius: 3,
                  borderColor: 'rgba(168,85,247,0.5)', color: '#a855f7',
                  backdropFilter: 'blur(8px)',
                  '&:hover': { borderColor: '#a855f7', bgcolor: 'rgba(168,85,247,0.08)', boxShadow: '0 0 20px rgba(168,85,247,0.2)' },
                }}>
                Зареєструватися
              </Button>
            )}
          </Box>

          {/* Stats row with CountUp */}
          <Box sx={{ display: 'flex', gap: { xs: 3, md: 5 }, justifyContent: 'center', flexWrap: 'wrap', mt: 7 }}>
            {STATS.map((s) => (
              <Box key={s.label} sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight={800} sx={{ color: s.color, lineHeight: 1, textShadow: `0 0 20px ${s.color}66` }}>
                  {s.num != null
                    ? <CountUp target={s.num} suffix={s.suffix} />
                    : s.display
                  }
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                  {s.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* ── Features ── */}
      <Box sx={{ mb: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Chip label="Можливості" size="small" sx={{ mb: 2, bgcolor: 'rgba(168,85,247,0.1)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.3)' }} />
          <Typography variant="h3" fontWeight={800} sx={{
            background: 'linear-gradient(135deg,#e2e8f0,#a855f7,#818cf8)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            Чому ClubReserve?
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {FEATURES.map((f, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Paper sx={(theme) => ({
                p: 4, height: '100%', borderRadius: 3, position: 'relative', overflow: 'hidden',
                background: theme.palette.mode === 'dark' ? 'rgba(18,18,26,0.8)' : '#fff',
                border: `1px solid ${f.color}30`,
                transition: 'transform 0.3s,box-shadow 0.3s,border-color 0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: `0 12px 40px ${f.color}25`,
                  borderColor: `${f.color}70`,
                },
                '&::before': {
                  content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                  background: `linear-gradient(90deg,transparent,${f.color},transparent)`,
                },
              })}>
                {/* Big background number */}
                <Typography sx={{
                  position: 'absolute', top: -20, right: 16,
                  fontSize: '7rem', fontWeight: 900, lineHeight: 1,
                  color: `${f.color}08`, userSelect: 'none', pointerEvents: 'none',
                }}>
                  {String(i + 1).padStart(2, '0')}
                </Typography>

                <Box sx={{
                  width: 56, height: 56, borderRadius: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: f.gradient, border: `1px solid ${f.color}40`, mb: 3, color: f.color,
                }}>
                  {f.icon}
                </Box>

                <Typography variant="h6" fontWeight={700} sx={{ mb: 1.5, color: 'text.primary' }}>
                  {f.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.7 }}>
                  {f.description}
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  {f.points.map((p) => (
                    <Box key={p} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: `${f.color}20`, border: `1px solid ${f.color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <CheckIcon sx={{ fontSize: 11, color: f.color }} />
                      </Box>
                      <Typography variant="caption" color="text.secondary">{p}</Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ── How it works ── */}
      <Box sx={{ mb: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Chip label="Як це працює" size="small" sx={{ mb: 2, bgcolor: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)' }} />
          <Typography variant="h3" fontWeight={800} sx={{
            background: 'linear-gradient(135deg,#e2e8f0,#818cf8)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            4 кроки до гри
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 0, flexWrap: { xs: 'wrap', md: 'nowrap' }, position: 'relative' }}>
          {/* Connector line */}
          <Box sx={{ display: { xs: 'none', md: 'block' }, position: 'absolute', top: 28, left: '12.5%', right: '12.5%', height: 2, background: 'linear-gradient(90deg,#9333ea,#6366f1,#06b6d4,#10b981)', opacity: 0.3, zIndex: 0 }} />

          {STEPS.map((s, i) => (
            <Box key={i} sx={{ flex: 1, minWidth: { xs: '48%', md: 0 }, textAlign: 'center', px: { xs: 1, sm: 2 }, mb: { xs: 3, md: 0 }, position: 'relative', zIndex: 1 }}>
              <Box sx={{
                width: 56, height: 56, borderRadius: '50%', mx: 'auto', mb: 2,
                background: `linear-gradient(135deg,#${['7c3aed', '6366f1', '0891b2', '059669'][i]},#${['a855f7', '818cf8', '06b6d4', '10b981'][i]})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 20px rgba(${[['124,58,237'], ['99,102,241'], ['6,182,212'], ['16,185,129']][i].join(',')},0.4)`,
              }}>
                <Typography fontWeight={800} sx={{ color: '#fff', fontSize: '1rem' }}>{s.num}</Typography>
              </Box>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>{s.title}</Typography>
              <Typography variant="body2" color="text.secondary">{s.desc}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── Trust badges ── */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: 8 }}>
        {[
          { icon: <SecurityIcon sx={{ fontSize: 18 }} />, text: 'Безпечна оплата', color: '#10b981' },
          { icon: <StarIcon sx={{ fontSize: 18 }} />,     text: 'Реальні відгуки',  color: '#f59e0b' },
          { icon: <GroupIcon sx={{ fontSize: 18 }} />,    text: 'Активна спільнота', color: '#818cf8' },
          { icon: <SpeedIcon sx={{ fontSize: 18 }} />,    text: 'Миттєве бронювання', color: '#a855f7' },
        ].map((b) => (
          <Box key={b.text} sx={{
            display: 'flex', alignItems: 'center', gap: 1,
            px: 2.5, py: 1.25, borderRadius: 10,
            bgcolor: `${b.color}12`, border: `1px solid ${b.color}35`,
            color: b.color, transition: 'transform 0.2s',
            '&:hover': { transform: 'scale(1.05)' },
          }}>
            {b.icon}
            <Typography variant="body2" fontWeight={600}>{b.text}</Typography>
          </Box>
        ))}
      </Box>

      {/* ── CTA ── */}
      <Box className="rgb-glow" sx={{
        p: { xs: 5, md: 8 }, textAlign: 'center', borderRadius: 4,
        background: 'linear-gradient(135deg,#1a0a2e 0%,#0d0d1a 40%,#0a1628 100%)',
        border: '1px solid rgba(147,51,234,0.2)', position: 'relative', overflow: 'hidden',
      }}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 300, borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(147,51,234,0.08) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" fontWeight={800} gutterBottom sx={{
            background: 'linear-gradient(135deg,#e2e8f0,#a855f7,#6366f1)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            Готовий грати?
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 420, mx: 'auto', fontSize: '1.05rem' }}>
            Приєднуйся до ClubReserve — бронюй місця в улюблених клубах без зайвих клопотів.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="contained" size="large" onClick={() => navigate('/clubs')}
              endIcon={<ArrowForwardIcon />}
              sx={{ px: 5, py: 1.6, fontSize: '1rem', borderRadius: 3 }}>
              Переглянути клуби
            </Button>
            {!isAuthenticated && (
              <Button variant="outlined" size="large" onClick={() => navigate('/register')}
                sx={{ px: 5, py: 1.6, fontSize: '1rem', borderRadius: 3, borderColor: 'rgba(168,85,247,0.5)', color: '#a855f7', '&:hover': { borderColor: '#a855f7', bgcolor: 'rgba(168,85,247,0.08)' } }}>
                Створити акаунт
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default HomePage

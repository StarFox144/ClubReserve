import { Box, Button, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { usePageTitle } from '../hooks/usePageTitle'
import GridViewIcon from '@mui/icons-material/GridView'
import BoltIcon from '@mui/icons-material/Bolt'
import QrCode2Icon from '@mui/icons-material/QrCode2'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import MoreTimeIcon from '@mui/icons-material/MoreTime'
import StarIcon from '@mui/icons-material/Star'
import StorefrontIcon from '@mui/icons-material/Storefront'
import ComputerIcon from '@mui/icons-material/Computer'
import AllInclusiveIcon from '@mui/icons-material/AllInclusive'
import VerifiedIcon from '@mui/icons-material/Verified'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { cr, font, tint, ACCENTS } from '../design/tokens'
import { CountUp, GlassCard, GlitchText, HudStat, Marquee, Reveal, SectionHeader, StatusBadge, SynthGrid } from '../components/ui'

const STATS = [
  { num: 3,    suffix: '+',  label: 'Клуби',             icon: <StorefrontIcon />,   color: cr.primary2 },
  { num: 15,   suffix: '+',  label: "Комп'ютери",        icon: <ComputerIcon />,     color: cr.cyan },
  { num: null, display: '24/7', label: 'Онлайн бронювання', icon: <AllInclusiveIcon />, color: cr.magenta },
  { num: 100,  suffix: '%',  label: 'Без черг',          icon: <VerifiedIcon />,     color: cr.success },
]

// Bento tiles: `span` = grid columns on desktop, `tall` = 2 rows
const FEATURES = [
  { icon: <GridViewIcon />, title: 'Схема залу наживо', text: 'Бачиш кожне місце: вільні, зайняті, VIP. Наведи — побачиш залізо, клікни — бронюй.', span: 2, tall: true, demo: true },
  { icon: <BoltIcon />, title: 'Бронювання в 3 кроки', text: 'Місце → час → підтвердження. Без дзвінків.', span: 2, extra: 'steps' },
  { icon: <QrCode2Icon />, title: 'QR-доступ', text: 'Код підтвердження і PDF-квиток.', span: 1, extra: 'qr' },
  { icon: <LocalOfferIcon />, title: 'Промо-коди', text: 'Знижки застосовуються миттєво.', span: 1, extra: 'promo' },
  { icon: <MoreTimeIcon />, title: 'Продовження сесії', text: 'Додай +1 або +2 години з особистого кабінету.', span: 2, extra: 'extend' },
  { icon: <StarIcon />, title: 'Рейтинги клубів', text: 'Реальні відгуки гравців.', span: 2, extra: 'rating' },
]

// Deterministic 7×7 pseudo-QR pattern
const QR_CELLS = Array.from({ length: 49 }, (_, i) => {
  const x = i % 7; const y = Math.floor(i / 7)
  const finder = (x < 2 && y < 2) || (x > 4 && y < 2) || (x < 2 && y > 4)
  return finder || ((x * 3 + y * 5 + x * y) % 3 === 0)
})

// Small decorative illustrations at the bottom of bento tiles
const TileExtra = ({ kind, accent }) => {
  const chip = { fontFamily: font.mono, fontSize: '0.75rem', fontWeight: 700, px: 1.25, py: 0.5, borderRadius: '8px', border: `1px solid ${tint(accent, 45)}`, bgcolor: tint(accent, 10), color: cr.text }
  if (kind === 'steps') return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {['Місце', 'Час', 'OK'].map((l, i) => (
        <Box key={l} sx={{ display: 'contents' }}>
          {i > 0 && <Box sx={{ flex: 1, height: 2, background: `linear-gradient(90deg, ${accent}, ${cr.primary2})`, boxShadow: `0 0 8px ${accent}`, opacity: 0.8 }} />}
          <Box sx={{ ...chip, ...(i === 2 && { bgcolor: tint(cr.success, 14), borderColor: tint(cr.success, 50) }) }}>{String(i + 1).padStart(2, '0')} · {l}</Box>
        </Box>
      ))}
    </Box>
  )
  if (kind === 'qr') return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px', width: 84, p: 1, borderRadius: '10px', border: `1px solid ${tint(accent, 40)}`, boxShadow: `0 0 16px ${tint(accent, 20)}` }}>
      {QR_CELLS.map((on, i) => <Box key={i} sx={{ aspectRatio: '1', borderRadius: '1px', bgcolor: on ? accent : 'transparent', opacity: on ? 0.85 : 1 }} />)}
    </Box>
  )
  if (kind === 'promo') return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', border: `1px dashed ${tint(accent, 60)}`, borderRadius: '10px', overflow: 'hidden' }}>
      <Box sx={{ fontFamily: font.mono, fontWeight: 700, letterSpacing: '0.14em', px: 1.5, py: 0.75, color: cr.text }}>NEON10</Box>
      <Box sx={{ fontFamily: font.mono, fontWeight: 700, px: 1.25, py: 0.75, bgcolor: tint(accent, 18), color: cr.successText }}>−10%</Box>
    </Box>
  )
  if (kind === 'extend') return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
      <Box sx={{ ...chip, bgcolor: tint(cr.success, 10), borderColor: tint(cr.success, 40) }}>⏱ 01:24:07</Box>
      <Box sx={chip}>+1 год</Box>
      <Box sx={chip}>+2 год</Box>
    </Box>
  )
  if (kind === 'rating') return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{ fontFamily: font.mono, fontWeight: 700, fontSize: '2rem', lineHeight: 1, color: cr.text, textShadow: `0 0 16px ${tint(cr.vip, 50)}` }}>4.8</Box>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {[86, 64, 22, 8].map((w, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ fontFamily: font.mono, fontSize: '0.6rem', color: cr.faint, width: 8 }}>{5 - i}</Box>
            <Box sx={{ flex: 1, height: 4, borderRadius: 4, bgcolor: tint(cr.vip, 12) }}>
              <Box sx={{ width: `${w}%`, height: '100%', borderRadius: 4, bgcolor: cr.vip, boxShadow: `0 0 6px ${tint(cr.vip, 60)}` }} />
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  )
  return null
}

const STEPS = [
  { title: 'Обери клуб', text: 'Порівняй клуби за рейтингом, ціною та розташуванням.' },
  { title: 'Обери місце й час', text: 'Клікни на ПК на схемі залу і вибери вільний слот.' },
  { title: 'Грай', text: 'Покажи QR-код адміністратору — місце вже чекає.' },
]

const GAMES = ['Counter-Strike 2', 'Dota 2', 'Valorant', 'League of Legends', 'Fortnite', 'PUBG', 'Apex Legends', 'Rocket League', 'GTA V', 'Minecraft', 'Overwatch 2', 'Rainbow Six Siege']

// Decorative HUD widgets floating in the hero's side space (desktop only)
const HeroWidget = ({ sx, delay = 0, accent, title, children }) => (
  <Box aria-hidden sx={{
    position: 'absolute', zIndex: 1, width: 210, p: 1.75,
    display: { xs: 'none', xl: 'block' },
    borderRadius: '14px', bgcolor: cr.glassStrong, backdropFilter: 'blur(12px)',
    border: `1px solid ${tint(accent, 40)}`, boxShadow: `0 0 24px ${tint(accent, 18)}`,
    animation: `cr-float 6s ease-in-out ${delay}s infinite`,
    ...sx,
  }}>
    <Typography sx={{ fontFamily: font.mono, fontSize: '0.6rem', letterSpacing: '0.18em', color: cr.faint, mb: 1 }}>{title}</Typography>
    {children}
  </Box>
)

const Bars = ({ values, color }) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: 28 }}>
    {values.map((v, i) => <Box key={i} sx={{ flex: 1, height: `${v}%`, borderRadius: '2px', bgcolor: color, opacity: 0.35 + (v / 100) * 0.65, boxShadow: `0 0 6px ${tint(color, 50)}` }} />)}
  </Box>
)

// Mini hall map used as decoration in the hero bento tile
const DEMO_SEATS = ['f', 'f', 'b', 'f', 'v', 'f', 'b', 'f', 'f', 'm', 'f', 'b', 'f', 'f', 'v', 'f', 'b', 'f']
const SEAT_COLOR = { f: cr.success, b: cr.danger, v: cr.vip, m: cr.warning }

const HomePage = () => {
  usePageTitle('')
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  return (
    <Box>
      {/* ── Hero: terminal screen ── */}
      <Box
        component="section"
        aria-labelledby="hero-title"
        sx={{
          position: 'relative',
          borderRadius: { xs: '20px', md: '28px' },
          p: '1px',
          mb: { xs: 3, md: 4 },
          background: cr.gradRgb,
          backgroundSize: '300% 100%',
          animation: 'cr-border-flow 8s linear infinite',
          boxShadow: cr.glowLg,
        }}
      >
        <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: 'inherit', bgcolor: cr.surface }}>
          {/* Title bar */}
          <Box sx={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.25, borderBottom: `1px solid ${cr.borderSoft}`, bgcolor: tint(cr.primary, 6) }}>
            {[cr.danger, cr.warning, cr.success].map((c, i) => (
              <Box key={i} aria-hidden sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: c, boxShadow: `0 0 6px ${c}` }} />
            ))}
            <Typography sx={{ ml: 1.5, fontFamily: font.mono, fontSize: '0.72rem', color: cr.faint, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              clubreserve://booking.sys — сесія активна
            </Typography>
            <Box sx={{ ml: 'auto', display: { xs: 'none', sm: 'block' } }}><StatusBadge status="online" /></Box>
          </Box>

          <SynthGrid />

          <HeroWidget accent={cr.success} title="// STATION PC-07" sx={{ left: { lg: 28, xl: 48 }, top: 90 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography sx={{ fontFamily: font.mono, fontWeight: 700, color: cr.text }}>RTX 4090</Typography>
              <StatusBadge status="free" />
            </Box>
            <Typography sx={{ fontFamily: font.mono, fontSize: '0.72rem', color: cr.muted }}>i9-13900KS · 64 GB · 360 Гц</Typography>
          </HeroWidget>

          <HeroWidget accent={cr.cyan} delay={1.5} title="// NETWORK" sx={{ left: { lg: 48, xl: 90 }, bottom: 90 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
              <Typography sx={{ fontFamily: font.mono, fontSize: '0.72rem', color: cr.muted }}>PING</Typography>
              <Typography sx={{ fontFamily: font.mono, fontWeight: 700, color: cr.cyanText }}>12 ms</Typography>
            </Box>
            <Bars values={[40, 55, 35, 70, 50, 85, 60, 75, 45, 90, 65, 80]} color={cr.cyan} />
          </HeroWidget>

          <HeroWidget accent={cr.primary2} delay={0.8} title="// ЗАЛ · ЗАВАНТАЖЕННЯ" sx={{ right: { lg: 28, xl: 48 }, top: 110 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
              <Typography sx={{ fontFamily: font.mono, fontSize: '0.72rem', color: cr.muted }}>Вільно</Typography>
              <Typography sx={{ fontFamily: font.mono, fontWeight: 700, color: cr.text }}>8/15</Typography>
            </Box>
            <Box sx={{ height: 6, borderRadius: 6, bgcolor: tint(cr.primary, 18), overflow: 'hidden' }}>
              <Box sx={{ width: '53%', height: '100%', borderRadius: 6, background: `linear-gradient(90deg, ${cr.success}, ${cr.cyan})`, boxShadow: `0 0 10px ${cr.success}` }} />
            </Box>
          </HeroWidget>

          <HeroWidget accent={cr.magenta} delay={2.2} title="// НАСТУПНИЙ СЛОТ" sx={{ right: { lg: 48, xl: 90 }, bottom: 100 }}>
            <Typography sx={{ fontFamily: font.mono, fontWeight: 700, fontSize: '1.4rem', color: cr.text, textShadow: `0 0 14px ${tint(cr.magenta, 50)}` }}>18:30</Typography>
            <Typography sx={{ fontFamily: font.mono, fontSize: '0.72rem', color: cr.muted }}>2 год · ₴160</Typography>
          </HeroWidget>

          <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', px: { xs: 2.5, md: 6 }, pt: { xs: 6, md: 10 }, pb: { xs: 8, md: 14 } }}>
            <Typography sx={{ fontFamily: font.mono, fontSize: { xs: '0.7rem', md: '0.78rem' }, letterSpacing: '0.24em', textTransform: 'uppercase', color: cr.cyanText, mb: 2.5 }}>
              &gt; Онлайн-бронювання комп'ютерних клубів
            </Typography>

            <GlitchText
              id="hero-title"
              component="h1"
              text={'Забронюй місце\nу клубі онлайн'}
              className="cr-gradient-text"
              sx={{
                display: 'block',
                fontFamily: font.display,
                fontWeight: 800,
                fontSize: { xs: '2.1rem', sm: '3rem', md: '4.2rem', lg: '4.8rem' },
                lineHeight: 1.08,
                letterSpacing: '-0.03em',
                mb: 3,
                minHeight: { xs: '4.6rem', sm: '6.5rem', md: '9rem', lg: '10.4rem' },
              }}
            />

            <Typography sx={{ color: cr.muted, maxWidth: 580, mx: 'auto', fontSize: { xs: '1rem', md: '1.12rem' }, lineHeight: 1.75, mb: 5 }}>
              ClubReserve — платформа бронювання ПК у комп'ютерних клубах. Обирай місце на схемі залу, бронюй час — без черг і дзвінків.
            </Typography>

            <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button variant="contained" size="large" onClick={() => navigate('/clubs')} endIcon={<ArrowForwardIcon />} sx={{ px: 4.5 }}>
                Переглянути клуби
              </Button>
              {!isAuthenticated && (
                <Button variant="outlined" size="large" onClick={() => navigate('/register')} sx={{ px: 4.5 }}>
                  Зареєструватися
                </Button>
              )}
            </Box>

            <Typography sx={{ mt: 5, fontFamily: font.mono, fontSize: '0.76rem', color: cr.faint }}>
              $ status --clubs <Box component="span" sx={{ color: cr.successText }}>ok</Box> · --latency <Box component="span" sx={{ color: cr.cyanText }}>12ms</Box>
              <Box component="span" aria-hidden sx={{ ml: 0.5, color: cr.cyan, animation: 'cr-blink 1s steps(1) infinite' }}>▋</Box>
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── Games ticker ── */}
      <Marquee items={GAMES} label="Популярні ігри в клубах" sx={{ mb: { xs: 3, md: 4 }, mx: { xs: -2, sm: -3 } }} />

      {/* ── Stats ── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: { xs: 1.5, md: 2 }, mb: { xs: 10, md: 14 } }}>
        {STATS.map((s, i) => (
          <Reveal key={s.label} delay={i * 80}>
            <HudStat
              label={s.label}
              icon={s.icon}
              accent={s.color}
              value={s.num != null ? <CountUp target={s.num} suffix={s.suffix} /> : s.display}
            />
          </Reveal>
        ))}
      </Box>

      {/* ── Bento features ── */}
      <Box component="section" sx={{ mb: { xs: 10, md: 14 } }}>
        <Reveal>
          <SectionHeader index={1} label="Можливості" title="Чому ClubReserve?" subtitle="Усе, що потрібно гравцю — від вибору місця до продовження сесії." />
        </Reveal>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gridAutoRows: { md: 'minmax(170px, auto)' }, gap: 2 }}>
          {FEATURES.map((f, i) => {
            const accent = ACCENTS[i % ACCENTS.length]
            return (
              <Reveal
                key={f.title}
                delay={i * 70}
                sx={{ gridColumn: { sm: f.span === 2 ? 'span 2' : 'span 1', md: `span ${f.span}` }, gridRow: { md: f.tall ? 'span 2' : 'auto' } }}
              >
                <GlassCard hover accent={accent} hud={f.demo} sx={{ p: { xs: 2.5, md: 3 }, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <Box sx={{ width: 44, height: 44, borderRadius: '12px', display: 'grid', placeItems: 'center', color: accent, bgcolor: tint(accent, 12), border: `1px solid ${tint(accent, 35)}`, boxShadow: `0 0 16px ${tint(accent, 25)}`, mb: 2 }}>
                    {f.icon}
                  </Box>
                  <Typography variant="h6" component="h3" sx={{ mb: 1 }}>{f.title}</Typography>
                  <Typography sx={{ color: cr.muted, lineHeight: 1.7, fontSize: '0.94rem' }}>{f.text}</Typography>

                  {f.extra && <Box aria-hidden sx={{ mt: 'auto', pt: 2.5 }}><TileExtra kind={f.extra} accent={accent} /></Box>}

                  {f.demo && (
                    <Box aria-hidden sx={{ mt: 'auto', pt: 3 }}>
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 1, p: 2, borderRadius: '14px', border: `1px dashed ${cr.border}`, bgcolor: tint(cr.bg, 40) }}>
                        {DEMO_SEATS.map((s, k) => (
                          <Box key={k} sx={{
                            aspectRatio: '1', borderRadius: '6px',
                            border: `1px solid ${tint(SEAT_COLOR[s], 70)}`,
                            bgcolor: tint(SEAT_COLOR[s], s === 'b' ? 30 : 14),
                            boxShadow: k === 7 ? `0 0 14px ${cr.cyan}, inset 0 0 0 1px ${cr.cyan}` : 'none',
                            backgroundImage: s === 'b' ? `linear-gradient(45deg, transparent 46%, ${tint(SEAT_COLOR[s], 70)} 48%, ${tint(SEAT_COLOR[s], 70)} 52%, transparent 54%)` : 'none',
                          }} />
                        ))}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2, mt: 1.5, flexWrap: 'wrap' }}>
                        {[['Вільно', cr.success], ['Зайнято', cr.danger], ['VIP', cr.vip]].map(([l, c]) => (
                          <Box key={l} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontFamily: font.mono, fontSize: '0.68rem', color: cr.muted }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: c, boxShadow: `0 0 6px ${c}` }} />{l}
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </GlassCard>
              </Reveal>
            )
          })}
        </Box>
      </Box>

      {/* ── How it works: 3-step timeline ── */}
      <Box component="section" sx={{ mb: { xs: 10, md: 14 } }}>
        <Reveal>
          <SectionHeader index={2} label="Як це працює" title="Три кроки до гри" align="center" />
        </Reveal>
        <Box component="ol" sx={{ position: 'relative', listStyle: 'none', p: 0, m: 0, display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: { xs: 4, md: 3 } }}>
          {/* neon timeline line */}
          <Box aria-hidden sx={{
            position: 'absolute',
            top: { xs: 28, md: 28 }, bottom: { xs: 28, md: 'auto' },
            left: { xs: 27, md: '16.66%' }, right: { md: '16.66%' },
            width: { xs: 2, md: 'auto' }, height: { md: 2 },
            background: { xs: `linear-gradient(180deg, ${cr.primary2}, ${cr.cyan}, ${cr.magenta})`, md: `linear-gradient(90deg, ${cr.primary2}, ${cr.cyan}, ${cr.magenta})` },
            boxShadow: `0 0 12px ${tint(cr.cyan, 60)}`,
            opacity: 0.8,
          }} />
          {STEPS.map((s, i) => {
            const accent = [cr.primary2, cr.cyan, cr.magenta][i]
            return (
              <Reveal key={s.title} component="li" delay={i * 120} sx={{ position: 'relative', display: 'flex', flexDirection: { xs: 'row', md: 'column' }, alignItems: { xs: 'flex-start', md: 'center' }, gap: { xs: 2.5, md: 2 }, textAlign: { xs: 'left', md: 'center' } }}>
                <Box sx={{
                  position: 'relative', zIndex: 1, flexShrink: 0,
                  width: 56, height: 56, borderRadius: '16px', display: 'grid', placeItems: 'center',
                  fontFamily: font.mono, fontWeight: 700, fontSize: '1.05rem', color: cr.text,
                  bgcolor: cr.surface, border: `1px solid ${accent}`,
                  boxShadow: `0 0 22px ${tint(accent, 50)}, inset 0 0 12px ${tint(accent, 25)}`,
                }}>
                  {String(i + 1).padStart(2, '0')}
                </Box>
                <Box sx={{ pt: { xs: 0.5, md: 0 } }}>
                  <Typography variant="h6" component="h3" sx={{ mb: 0.75 }}>{s.title}</Typography>
                  <Typography sx={{ color: cr.muted, lineHeight: 1.7, maxWidth: 300, mx: { md: 'auto' } }}>{s.text}</Typography>
                </Box>
              </Reveal>
            )
          })}
        </Box>
      </Box>

      {/* ── Final CTA ── */}
      <Reveal>
        <GlassCard hud accent={cr.cyan} sx={{ position: 'relative', overflow: 'hidden', textAlign: 'center', px: { xs: 3, md: 8 }, py: { xs: 6, md: 9 } }}>
          <SynthGrid full horizon={false} />
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography sx={{ fontFamily: font.mono, fontSize: '0.74rem', letterSpacing: '0.22em', color: cr.cyanText, mb: 2 }}>// READY PLAYER ONE?</Typography>
            <Typography component="h2" className="cr-gradient-text" sx={{ fontFamily: font.display, fontWeight: 800, fontSize: { xs: '1.9rem', md: '3rem' }, lineHeight: 1.1, mb: 2 }}>
              Готовий грати?
            </Typography>
            <Typography sx={{ color: cr.muted, mb: 4, maxWidth: 460, mx: 'auto', fontSize: '1.02rem', lineHeight: 1.7 }}>
              Приєднуйся до ClubReserve — бронюй місця в улюблених клубах без зайвих клопотів.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button variant="contained" size="large" onClick={() => navigate('/clubs')} endIcon={<ArrowForwardIcon />}>
                Переглянути клуби
              </Button>
              {!isAuthenticated && (
                <Button variant="outlined" size="large" onClick={() => navigate('/register')}>
                  Створити акаунт
                </Button>
              )}
            </Box>
          </Box>
        </GlassCard>
      </Reveal>
    </Box>
  )
}

export default HomePage

import {
  Alert, Box, Button, FormControl, InputAdornment, InputLabel,
  MenuItem, Rating, Select, Skeleton, TextField, Typography,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import SearchIcon from '@mui/icons-material/Search'
import StarIcon from '@mui/icons-material/Star'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff'
import TuneIcon from '@mui/icons-material/Tune'
import StorefrontIcon from '@mui/icons-material/Storefront'
import PlaceIcon from '@mui/icons-material/Place'
import PaymentsIcon from '@mui/icons-material/Payments'
import GridViewIcon from '@mui/icons-material/GridView'
import QrCode2Icon from '@mui/icons-material/QrCode2'
import BoltIcon from '@mui/icons-material/Bolt'
import { usePageTitle } from '../hooks/usePageTitle'
import { useState, useEffect, useMemo } from 'react'
import { getClubs } from '../api/clubs'
import { cr, font, tint } from '../design/tokens'
import { EmptyState, GlassCard, HudStat, Marquee, Mono, Reveal, SectionHeader, StatusBadge } from '../components/ui'
import ClubBanner from '../components/club/ClubBanner'
import { cityOf } from '../components/club/clubUtils'

const MAX_PRICE_OPTIONS = [
  { label: 'Будь-яка', value: 0 },
  { label: 'до ₴50/год', value: 50 },
  { label: 'до ₴70/год', value: 70 },
  { label: 'до ₴100/год', value: 100 },
]

const PERKS = [
  { icon: <GridViewIcon />, title: 'Схема залу наживо', text: 'Статус кожного ПК оновлюється автоматично — бачиш вільні місця ще до приходу.', accent: cr.primary2 },
  { icon: <BoltIcon />, title: 'Бронювання за хвилину', text: 'Місце → час → підтвердження. Без дзвінків і передоплат на картку адміну.', accent: cr.cyan },
  { icon: <QrCode2Icon />, title: 'QR-доступ', text: 'Покажи код на рецепції — і сідай грати. PDF-квиток завжди під рукою.', accent: cr.magenta },
]

const ClubCardSkeleton = () => (
  <GlassCard sx={{ overflow: 'hidden', height: '100%' }}>
    <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 0 }} />
    <Box sx={{ p: 2.5 }}>
      <Skeleton variant="text" width="60%" height={32} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="text" width="90%" />
      <Skeleton variant="rounded" width="100%" height={42} sx={{ mt: 2 }} />
    </Box>
  </GlassCard>
)

const gridSx = { display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: { xs: 2, md: 3 } }

const ClubsPage = () => {
  usePageTitle('Клуби')
  const navigate = useNavigate()
  const [clubs, setClubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('name')
  const [minRating, setMinRating] = useState(0)
  const [maxPrice, setMaxPrice] = useState(0)
  const [city, setCity] = useState('')

  useEffect(() => {
    getClubs()
      .then((data) => setClubs(data.filter((c) => c.is_active)))
      .catch(() => setError('Не вдалося завантажити клуби'))
      .finally(() => setLoading(false))
  }, [])

  const cities = useMemo(() => [...new Set(clubs.map(cityOf).filter(Boolean))].sort((a, b) => a.localeCompare(b)), [clubs])
  const hasFilters = minRating > 0 || maxPrice > 0 || Boolean(city)

  const filtered = useMemo(() => {
    let result = clubs.filter((c) => {
      const q = search.toLowerCase()
      const matchSearch =
        c.name.toLowerCase().includes(q) ||
        (c.address || '').toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q)
      const matchRating = minRating === 0 || (c.avg_rating != null && c.avg_rating >= minRating)
      const matchPrice = maxPrice === 0 || c.min_price == null || c.min_price <= maxPrice
      const matchCity = !city || cityOf(c) === city
      return matchSearch && matchRating && matchPrice && matchCity
    })
    if (sort === 'name') result = [...result].sort((a, b) => a.name.localeCompare(b.name))
    if (sort === 'newest') result = [...result].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    if (sort === 'rating') result = [...result].sort((a, b) => (b.avg_rating ?? 0) - (a.avg_rating ?? 0))
    return result
  }, [clubs, search, sort, minRating, maxPrice, city])

  const prices = clubs.map((c) => c.min_price).filter((v) => v != null)
  const rated = clubs.filter((c) => c.avg_rating != null)
  const avgRating = rated.length ? rated.reduce((s, c) => s + c.avg_rating, 0) / rated.length : null

  const resetFilters = () => { setMinRating(0); setMaxPrice(0); setCity('') }

  return (
    <Box>
      <SectionHeader
        component="h1"
        label="Каталог"
        title="Комп'ютерні клуби"
        subtitle={loading ? 'Сканування мережі клубів…' : `${clubs.length} ${clubs.length === 1 ? 'клуб' : 'клубів'} онлайн. Обери свій і забронюй місце на схемі залу.`}
        size="md"
      />

      {/* ── Network stats ── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: { xs: 1.5, md: 2 }, mb: 3 }}>
        {[
          { label: 'Клубів онлайн', value: clubs.length, icon: <StorefrontIcon />, accent: cr.primary2 },
          { label: 'Міст', value: cities.length, icon: <PlaceIcon />, accent: cr.cyan },
          { label: 'Ціна від', value: prices.length ? `₴${Math.round(Math.min(...prices))}` : '—', icon: <PaymentsIcon />, accent: cr.success },
          { label: 'Сер. рейтинг', value: avgRating ? avgRating.toFixed(1) : '—', icon: <StarIcon />, accent: cr.vip },
        ].map((s) => (
          <HudStat key={s.label} compact label={s.label} value={loading ? '—' : s.value} icon={s.icon} accent={s.accent} />
        ))}
      </Box>

      {/* ── Filters ── */}
      <GlassCard strong sx={{ p: { xs: 2, md: 2.5 }, mb: 4 }} role="search" aria-label="Фільтри клубів">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <TuneIcon sx={{ fontSize: 18, color: cr.cyanText }} />
          <Typography sx={{ fontFamily: font.mono, fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: cr.muted }}>Фільтри</Typography>
          {(hasFilters || search) && (
            <Button size="small" startIcon={<FilterAltOffIcon />} onClick={() => { resetFilters(); setSearch('') }} sx={{ ml: 'auto' }}>
              Скинути
            </Button>
          )}
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: '2fr repeat(3, 1fr)' }, gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Назва, адреса, опис…"
            label="Пошук"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
            sx={{ gridColumn: { sm: 'span 2', md: 'auto' } }}
          />
          <FormControl size="small">
            <InputLabel id="city-l">Місто</InputLabel>
            <Select labelId="city-l" value={city} label="Місто" onChange={(e) => setCity(e.target.value)}>
              <MenuItem value="">Усі міста</MenuItem>
              {cities.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small">
            <InputLabel id="price-l">Ціна</InputLabel>
            <Select labelId="price-l" value={maxPrice} label="Ціна" onChange={(e) => setMaxPrice(e.target.value)}>
              {MAX_PRICE_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small">
            <InputLabel id="sort-l">Сортування</InputLabel>
            <Select labelId="sort-l" value={sort} label="Сортування" onChange={(e) => setSort(e.target.value)}>
              <MenuItem value="name">За назвою</MenuItem>
              <MenuItem value="newest">Найновіші</MenuItem>
              <MenuItem value="rating">За рейтингом</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 2, flexWrap: 'wrap' }}>
          <Typography component="span" id="rating-l" sx={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: cr.muted }}>Мін. рейтинг</Typography>
          <Rating value={minRating} onChange={(_, v) => setMinRating(v ?? 0)} size="small" aria-labelledby="rating-l" />
          {minRating > 0 && <Mono sx={{ fontSize: '0.78rem', color: cr.vipText }}>≥ {minRating}.0</Mono>}
          {search && (
            <Mono sx={{ ml: 'auto', fontSize: '0.78rem', color: cr.muted }}>
              знайдено: <Box component="span" sx={{ color: cr.cyanText }}>{filtered.length}</Box>
            </Mono>
          )}
        </Box>
      </GlassCard>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={gridSx}>
          {[1, 2, 3, 4, 5, 6].map((i) => <ClubCardSkeleton key={i} />)}
        </Box>
      ) : filtered.length === 0 ? (
        <GlassCard>
          <EmptyState
            art="search"
            title="Клубів не знайдено"
            text="Спробуй змінити фільтри або пошуковий запит."
            action={<Button variant="outlined" onClick={() => { setSearch(''); resetFilters() }}>Скинути всі фільтри</Button>}
          />
        </GlassCard>
      ) : (
        <Box sx={gridSx}>
          {filtered.map((club, idx) => {
            const clubCity = cityOf(club)
            return (
              <Reveal key={club.id} delay={(idx % 3) * 80}>
                <GlassCard
                  hover
                  component="article"
                  sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', cursor: 'pointer' }}
                  onClick={() => navigate(`/clubs/${club.id}`)}
                >
                  <ClubBanner id={club.id} name={club.name} height={180}>
                    <Box sx={{ position: 'absolute', top: 12, left: 12, right: 12, display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                      <StatusBadge status="online" label="Відкрито" />
                      {club.review_count > 0 && (
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, height: 24, borderRadius: '8px', bgcolor: cr.glassStrong, backdropFilter: 'blur(8px)', border: `1px solid ${tint(cr.vip, 40)}` }}>
                          <StarIcon sx={{ fontSize: 14, color: cr.vip }} />
                          <Mono sx={{ fontSize: '0.75rem', fontWeight: 700, color: cr.text }}>{(club.avg_rating || 0).toFixed(1)}</Mono>
                          <Mono sx={{ fontSize: '0.68rem', color: cr.muted }}>({club.review_count})</Mono>
                        </Box>
                      )}
                    </Box>
                    <Box sx={{ position: 'absolute', left: 16, right: 16, bottom: 12 }}>
                      <Typography component="h2" sx={{ fontFamily: font.display, fontWeight: 700, fontSize: '1.2rem', lineHeight: 1.2, color: cr.text }}>
                        {club.name}
                      </Typography>
                      {clubCity && <Mono sx={{ fontSize: '0.7rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: cr.cyanText }}>{clubCity}</Mono>}
                    </Box>
                  </ClubBanner>

                  <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75, mb: 1.25 }}>
                      <LocationOnIcon sx={{ fontSize: 16, color: cr.primaryText, mt: '2px', flexShrink: 0 }} />
                      <Typography variant="body2" sx={{ color: cr.muted }}>{club.address}</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: cr.muted, mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.65 }}>
                      {club.description}
                    </Typography>

                    <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 1, pt: 2, borderTop: `1px solid ${cr.borderSoft}` }}>
                      <Box>
                        <Typography sx={{ fontFamily: font.mono, fontSize: '0.62rem', letterSpacing: '0.16em', color: cr.faint }}>ЦІНА ВІД</Typography>
                        <Mono sx={{ fontSize: '1.3rem', fontWeight: 700, color: cr.text, textShadow: `0 0 14px ${tint(cr.primary2, 45)}` }}>
                          {club.min_price ? `₴${Math.round(club.min_price)}` : '—'}
                          <Box component="span" sx={{ fontSize: '0.75rem', color: cr.muted, fontWeight: 500 }}>/год</Box>
                        </Mono>
                      </Box>
                      <Button
                        variant="contained"
                        endIcon={<ArrowForwardIcon />}
                        onClick={(e) => { e.stopPropagation(); navigate(`/clubs/${club.id}`) }}
                        aria-label={`Переглянути та забронювати: ${club.name}`}
                      >
                        Обрати місце
                      </Button>
                    </Box>
                  </Box>
                </GlassCard>
              </Reveal>
            )
          })}
        </Box>
      )}

      {/* ── Perks band ── */}
      <Box sx={{ mt: { xs: 8, md: 12 } }}>
        <Marquee items={cities.length ? [...cities, 'Нові клуби щотижня', 'RTX 40-серія', '240–360 Гц', 'VIP-зони'] : ['RTX 40-серія', '240–360 Гц', 'VIP-зони', 'Нічні тарифи']} label="Мережа клубів" sx={{ mb: { xs: 4, md: 5 }, mx: { xs: -2, sm: -3 } }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
          {PERKS.map((p, i) => (
            <Reveal key={p.title} delay={i * 80}>
              <GlassCard hover accent={p.accent} sx={{ p: 3, height: '100%', display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Box sx={{ width: 44, height: 44, flexShrink: 0, borderRadius: '12px', display: 'grid', placeItems: 'center', color: p.accent, bgcolor: tint(p.accent, 12), border: `1px solid ${tint(p.accent, 35)}`, boxShadow: `0 0 16px ${tint(p.accent, 25)}` }}>
                  {p.icon}
                </Box>
                <Box>
                  <Typography variant="h6" component="h3" sx={{ mb: 0.75 }}>{p.title}</Typography>
                  <Typography sx={{ color: cr.muted, fontSize: '0.92rem', lineHeight: 1.65 }}>{p.text}</Typography>
                </Box>
              </GlassCard>
            </Reveal>
          ))}
        </Box>
      </Box>
    </Box>
  )
}

export default ClubsPage

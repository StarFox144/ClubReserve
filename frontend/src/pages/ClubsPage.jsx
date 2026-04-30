import {
  Alert, Box, Button, Card, CardActions, CardContent, Chip,
  CircularProgress, FormControl, Grid, InputAdornment, InputLabel,
  MenuItem, Rating, Select, TextField, Typography,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import SearchIcon from '@mui/icons-material/Search'
import StorefrontIcon from '@mui/icons-material/Storefront'
import SortIcon from '@mui/icons-material/Sort'
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff'
import { useState, useEffect, useMemo } from 'react'
import { getClubs } from '../api/clubs'

const CLUB_GRADIENTS = [
  'linear-gradient(135deg,#1a0a2e 0%,#2d1b69 100%)',
  'linear-gradient(135deg,#0a1628 0%,#1e3a5f 100%)',
  'linear-gradient(135deg,#1a0a1e 0%,#4a1942 100%)',
  'linear-gradient(135deg,#0a1a0a 0%,#1a3a2a 100%)',
  'linear-gradient(135deg,#1a1a0a 0%,#3a2a0a 100%)',
  'linear-gradient(135deg,#0a0a1a 0%,#1a2a4a 100%)',
]

const MAX_PRICE_OPTIONS = [
  { label: 'Будь-яка', value: 0 },
  { label: 'до ₴50/год', value: 50 },
  { label: 'до ₴70/год', value: 70 },
  { label: 'до ₴100/год', value: 100 },
]

const ClubsPage = () => {
  const navigate = useNavigate()
  const [clubs, setClubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('name')
  const [minRating, setMinRating] = useState(0)
  const [maxPrice, setMaxPrice] = useState(0)

  useEffect(() => {
    getClubs()
      .then((data) => setClubs(data.filter((c) => c.is_active)))
      .catch(() => setError('Не вдалося завантажити клуби'))
      .finally(() => setLoading(false))
  }, [])

  const hasFilters = minRating > 0 || maxPrice > 0

  const filtered = useMemo(() => {
    let result = clubs.filter((c) => {
      const q = search.toLowerCase()
      const matchSearch =
        c.name.toLowerCase().includes(q) ||
        (c.address || '').toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q)
      const matchRating = minRating === 0 || (c.avg_rating != null && c.avg_rating >= minRating)
      const matchPrice = maxPrice === 0 || c.min_price == null || c.min_price <= maxPrice
      return matchSearch && matchRating && matchPrice
    })
    if (sort === 'name') result = [...result].sort((a, b) => a.name.localeCompare(b.name))
    if (sort === 'newest') result = [...result].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    if (sort === 'rating') result = [...result].sort((a, b) => (b.avg_rating ?? 0) - (a.avg_rating ?? 0))
    return result
  }, [clubs, search, sort, minRating, maxPrice])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress sx={{ color: '#a855f7' }} />
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom sx={{
          background: 'linear-gradient(135deg,#e2e8f0,#a855f7)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          Комп'ютерні клуби
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          {clubs.length} {clubs.length === 1 ? 'клуб' : 'клубів'} доступно
        </Typography>

        {/* Search + Sort */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
          <TextField
            placeholder="Пошук за назвою, адресою..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flexGrow: 1, minWidth: 220, maxWidth: 400 }}
            size="small"
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'text.secondary' }} /></InputAdornment>,
            }}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Сортування</InputLabel>
            <Select value={sort} label="Сортування" onChange={(e) => setSort(e.target.value)}
              startAdornment={<SortIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />}>
              <MenuItem value="name">За назвою</MenuItem>
              <MenuItem value="newest">Найновіші</MenuItem>
              <MenuItem value="rating">За рейтингом</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Filters row */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">Мін. рейтинг:</Typography>
            <Rating
              value={minRating}
              onChange={(_, v) => setMinRating(v ?? 0)}
              size="small"
              sx={{ '& .MuiRating-iconFilled': { color: '#f59e0b' }, '& .MuiRating-iconEmpty': { color: 'rgba(245,158,11,0.3)' } }}
            />
            {minRating > 0 && (
              <Typography variant="caption" sx={{ color: '#a855f7' }}>від {minRating}★</Typography>
            )}
          </Box>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Макс. ціна</InputLabel>
            <Select value={maxPrice} label="Макс. ціна" onChange={(e) => setMaxPrice(e.target.value)}>
              {MAX_PRICE_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {hasFilters && (
            <Button
              size="small"
              startIcon={<FilterAltOffIcon />}
              onClick={() => { setMinRating(0); setMaxPrice(0) }}
              sx={{ color: 'text.secondary', '&:hover': { color: '#a855f7' } }}
            >
              Скинути фільтри
            </Button>
          )}
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {search && (
        <Typography color="text.secondary" sx={{ mb: 2, fontSize: '0.875rem' }}>
          Знайдено: {filtered.length} клуб{filtered.length !== 1 ? 'ів' : ''}
        </Typography>
      )}

      {filtered.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <StorefrontIcon sx={{ fontSize: 72, color: 'rgba(147,51,234,0.2)', mb: 2 }} />
          <Typography color="text.secondary" variant="h6">Клубів не знайдено</Typography>
          <Button variant="outlined" sx={{ mt: 3 }} onClick={() => { setSearch(''); setMinRating(0); setMaxPrice(0) }}>
            Скинути всі фільтри
          </Button>
        </Box>
      )}

      <Grid container spacing={3}>
        {filtered.map((club, idx) => (
          <Grid item xs={12} sm={6} md={4} key={club.id}>
            <Card sx={{
              height: '100%', display: 'flex', flexDirection: 'column',
              transition: 'transform 0.25s,box-shadow 0.25s',
              '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 8px 32px rgba(147,51,234,0.25)', borderColor: 'rgba(147,51,234,0.5)' },
            }}>
              <Box sx={{
                height: 110,
                background: CLUB_GRADIENTS[idx % CLUB_GRADIENTS.length],
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                px: 3, position: 'relative', overflow: 'hidden',
                '&::after': { content: '""', position: 'absolute', bottom: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(147,51,234,0.1)' },
              }}>
                <StorefrontIcon sx={{ fontSize: 52, color: 'rgba(168,85,247,0.6)' }} />
                <Box sx={{ textAlign: 'right', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-end' }}>
                  <Chip label="Доступний" size="small" sx={{ background: 'rgba(16,185,129,0.2)', color: '#10b981', border: '1px solid rgba(16,185,129,0.4)', fontWeight: 600 }} />
                  {club.min_price && (
                    <Chip label={`від ₴${Math.round(club.min_price)}/год`} size="small"
                      sx={{ background: 'rgba(168,85,247,0.2)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.4)', fontWeight: 600, fontSize: '0.7rem' }} />
                  )}
                </Box>
              </Box>

              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>{club.name}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mb: 1 }}>
                  <LocationOnIcon sx={{ fontSize: 15, color: '#a855f7', mt: '3px', flexShrink: 0 }} />
                  <Typography variant="body2" color="text.secondary">{club.address}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {club.description}
                </Typography>
                {club.review_count > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Rating value={club.avg_rating || 0} precision={0.5} readOnly size="small"
                      sx={{ '& .MuiRating-iconFilled': { color: '#f59e0b' } }} />
                    <Typography variant="caption" color="text.secondary">
                      {(club.avg_rating || 0).toFixed(1)} ({club.review_count})
                    </Typography>
                  </Box>
                )}
              </CardContent>

              <CardActions sx={{ px: 2, pb: 2 }}>
                <Button variant="contained" fullWidth onClick={() => navigate(`/clubs/${club.id}`)}>
                  Переглянути та забронювати
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default ClubsPage

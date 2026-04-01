import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Badge,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import SearchIcon from '@mui/icons-material/Search'
import StorefrontIcon from '@mui/icons-material/Storefront'
import ComputerIcon from '@mui/icons-material/Computer'
import SortIcon from '@mui/icons-material/Sort'
import { useState, useMemo } from 'react'
import { MOCK_CLUBS, MOCK_COMPUTERS } from '../mocks/data'

const CITIES = ['Всі міста', 'Київ', 'Львів', 'Харків', 'Одеса']

const CLUB_GRADIENTS = [
  'linear-gradient(135deg, #1a0a2e 0%, #2d1b69 100%)',
  'linear-gradient(135deg, #0a1628 0%, #1e3a5f 100%)',
  'linear-gradient(135deg, #1a0a1e 0%, #4a1942 100%)',
  'linear-gradient(135deg, #0a1a0a 0%, #1a3a2a 100%)',
  'linear-gradient(135deg, #1a1a0a 0%, #3a2a0a 100%)',
  'linear-gradient(135deg, #0a0a1a 0%, #1a2a4a 100%)',
]

const ClubsPage = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [city, setCity] = useState('Всі міста')
  const [sort, setSort] = useState('name')

  const filtered = useMemo(() => {
    let result = MOCK_CLUBS.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.address.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase())
      const matchCity = city === 'Всі міста' || c.city === city
      return matchSearch && matchCity
    })

    if (sort === 'name') result = [...result].sort((a, b) => a.name.localeCompare(b.name))
    if (sort === 'computers') result = [...result].sort((a, b) => b.computers_count - a.computers_count)
    if (sort === 'newest') result = [...result].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    return result
  }, [search, city, sort])

  const getFreeCount = (clubId) => {
    const computers = MOCK_COMPUTERS[clubId] || []
    return computers.filter((c) => c.is_active && c.status === 'free').length
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          fontWeight={700}
          gutterBottom
          sx={{
            background: 'linear-gradient(135deg, #e2e8f0, #a855f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Комп'ютерні клуби
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          {MOCK_CLUBS.length} клубів у {CITIES.length - 1} містах України
        </Typography>

        {/* Search + Filters row */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Пошук за назвою, адресою, описом..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flexGrow: 1, minWidth: 220, maxWidth: 420 }}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Сортування</InputLabel>
            <Select
              value={sort}
              label="Сортування"
              onChange={(e) => setSort(e.target.value)}
              startAdornment={<SortIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />}
            >
              <MenuItem value="name">За назвою</MenuItem>
              <MenuItem value="computers">За кількістю ПК</MenuItem>
              <MenuItem value="newest">Найновіші</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* City filter chips */}
        <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
          {CITIES.map((c) => (
            <Chip
              key={c}
              label={c}
              onClick={() => setCity(c)}
              variant={city === c ? 'filled' : 'outlined'}
              sx={{
                cursor: 'pointer',
                ...(city === c
                  ? {
                      background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
                      color: 'white',
                      boxShadow: '0 0 12px rgba(147,51,234,0.4)',
                    }
                  : {
                      borderColor: 'rgba(147,51,234,0.3)',
                      color: 'text.secondary',
                      '&:hover': { borderColor: '#9333ea', color: '#a855f7' },
                    }),
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Results count */}
      {search || city !== 'Всі міста' ? (
        <Typography color="text.secondary" sx={{ mb: 2, fontSize: '0.875rem' }}>
          Знайдено: {filtered.length} клуб{filtered.length !== 1 ? 'ів' : ''}
        </Typography>
      ) : null}

      {/* Empty state */}
      {filtered.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <StorefrontIcon sx={{ fontSize: 72, color: 'rgba(147,51,234,0.2)', mb: 2 }} />
          <Typography color="text.secondary" variant="h6">Клубів не знайдено</Typography>
          <Typography color="text.disabled" variant="body2" sx={{ mt: 1 }}>
            Спробуйте змінити фільтри або пошуковий запит
          </Typography>
          <Button
            variant="outlined"
            sx={{ mt: 3 }}
            onClick={() => { setSearch(''); setCity('Всі міста') }}
          >
            Скинути фільтри
          </Button>
        </Box>
      )}

      {/* Club cards */}
      <Grid container spacing={3}>
        {filtered.map((club, idx) => {
          const freeCount = getFreeCount(club.id)
          const totalCount = (MOCK_COMPUTERS[club.id] || []).filter(c => c.is_active).length

          return (
            <Grid item xs={12} sm={6} md={4} key={club.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.25s, box-shadow 0.25s',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 8px 32px rgba(147,51,234,0.25)',
                    borderColor: 'rgba(147,51,234,0.5)',
                  },
                }}
              >
                {/* Card banner */}
                <Box
                  sx={{
                    height: 110,
                    background: CLUB_GRADIENTS[idx % CLUB_GRADIENTS.length],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 3,
                    position: 'relative',
                    overflow: 'hidden',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -20,
                      right: -20,
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      background: 'rgba(147,51,234,0.1)',
                    },
                  }}
                >
                  <StorefrontIcon sx={{ fontSize: 52, color: 'rgba(168,85,247,0.6)' }} />
                  <Box sx={{ textAlign: 'right', zIndex: 1 }}>
                    <Chip
                      label={`${freeCount} вільних`}
                      size="small"
                      sx={{
                        background: freeCount > 0
                          ? 'rgba(16,185,129,0.2)'
                          : 'rgba(239,68,68,0.2)',
                        color: freeCount > 0 ? '#10b981' : '#ef4444',
                        border: `1px solid ${freeCount > 0 ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}`,
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                </Box>

                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom color="text.primary">
                    {club.name}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mb: 1 }}>
                    <LocationOnIcon sx={{ fontSize: 15, color: '#a855f7', mt: '3px', flexShrink: 0 }} />
                    <Typography variant="body2" color="text.secondary">
                      {club.address}
                    </Typography>
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 1,
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {club.description}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ComputerIcon sx={{ fontSize: 15, color: 'text.disabled' }} />
                    <Typography variant="caption" color="text.disabled">
                      {totalCount} комп'ютерів ({freeCount} доступно)
                    </Typography>
                  </Box>
                </CardContent>

                <CardActions sx={{ px: 2, pb: 2 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => navigate(`/clubs/${club.id}`)}
                    disabled={freeCount === 0}
                  >
                    {freeCount > 0 ? "Переглянути та забронювати" : "Всі зайняті"}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          )
        })}
      </Grid>
    </Box>
  )
}

export default ClubsPage

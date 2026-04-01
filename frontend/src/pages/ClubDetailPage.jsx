import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Breadcrumbs,
  Link,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material'
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import ComputerIcon from '@mui/icons-material/Computer'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import BuildIcon from '@mui/icons-material/Build'
import { getClub } from '../api/clubs'
import { getComputers } from '../api/computers'

const STATUS_CONFIG = {
  free:        { label: 'Вільний',    color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.3)',  icon: <CheckCircleIcon sx={{ fontSize: 14 }} /> },
  maintenance: { label: 'Тех. огляд', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', icon: <BuildIcon sx={{ fontSize: 14 }} /> },
}

const ClubDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [club, setClub] = useState(null)
  const [computers, setComputers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([getClub(id), getComputers(id)])
      .then(([clubData, computersData]) => {
        setClub(clubData)
        setComputers(computersData)
      })
      .catch(() => setError('Не вдалося завантажити дані клубу'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress sx={{ color: '#a855f7' }} />
      </Box>
    )
  }

  if (error || !club) {
    return <Alert severity="error">{error || 'Клуб не знайдено'}</Alert>
  }

  const freeCount = computers.filter((c) => c.is_active).length
  const maintenanceCount = computers.filter((c) => !c.is_active).length

  return (
    <Box>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 3 }}>
        <Link
          component={RouterLink}
          to="/clubs"
          underline="hover"
          sx={{ color: 'text.secondary', '&:hover': { color: '#a855f7' } }}
        >
          Клуби
        </Link>
        <Typography
          sx={{
            background: 'linear-gradient(135deg, #a855f7, #818cf8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: 600,
          }}
        >
          {club.name}
        </Typography>
      </Breadcrumbs>

      {/* Club header */}
      <Box
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #12121a 0%, #1a0a2e 100%)',
          border: '1px solid rgba(147,51,234,0.25)',
          boxShadow: '0 4px 24px rgba(147,51,234,0.1)',
        }}
      >
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
          {club.name}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
          <LocationOnIcon sx={{ fontSize: 16, color: '#a855f7' }} />
          <Typography color="text.secondary">{club.address}</Typography>
        </Box>

        <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 600 }}>
          {club.description}
        </Typography>

        {/* Stats row */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {[
            { label: 'Доступних',  value: freeCount,        color: '#10b981' },
            { label: 'Тех. огляд', value: maintenanceCount, color: '#f59e0b' },
            { label: 'Всього',     value: computers.length, color: '#a855f7' },
          ].map((stat) => (
            <Box
              key={stat.label}
              sx={{
                px: 3, py: 1.5,
                borderRadius: 2,
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${stat.color}33`,
                textAlign: 'center',
                minWidth: 90,
              }}
            >
              <Typography variant="h5" fontWeight={700} sx={{ color: stat.color }}>
                {stat.value}
              </Typography>
              <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Divider sx={{ mb: 4 }} />

      <Typography
        variant="h5"
        fontWeight={700}
        gutterBottom
        sx={{ mb: 3, color: 'text.primary' }}
      >
        Комп'ютери клубу
      </Typography>

      {computers.length === 0 && (
        <Typography color="text.secondary">У цьому клубі ще немає комп'ютерів</Typography>
      )}

      <Grid container spacing={2}>
        {computers.map((computer) => {
          const status = computer.is_active ? 'free' : 'maintenance'
          const statusCfg = STATUS_CONFIG[status]
          const canBook = computer.is_active

          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={computer.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  opacity: canBook ? 1 : 0.6,
                  ...(canBook && {
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 6px 24px rgba(147,51,234,0.2)',
                      borderColor: 'rgba(147,51,234,0.5)',
                    },
                  }),
                }}
              >
                {/* PC header strip */}
                <Box
                  sx={{
                    px: 2, py: 1.5,
                    background: `linear-gradient(135deg, ${statusCfg.bg.replace('0.1', '0.15')}, transparent)`,
                    borderBottom: `1px solid ${statusCfg.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ComputerIcon sx={{ fontSize: 18, color: statusCfg.color }} />
                    <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                      {computer.name}
                    </Typography>
                  </Box>
                  <Chip
                    icon={statusCfg.icon}
                    label={statusCfg.label}
                    size="small"
                    sx={{
                      bgcolor: statusCfg.bg,
                      color: statusCfg.color,
                      border: `1px solid ${statusCfg.border}`,
                      fontSize: '0.7rem',
                      height: 22,
                      '& .MuiChip-icon': { color: statusCfg.color },
                    }}
                  />
                </Box>

                <CardContent sx={{ flexGrow: 1, py: 1.5 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                    {computer.description}
                  </Typography>
                </CardContent>

                <CardActions sx={{ px: 2, pb: 2 }}>
                  <Button
                    variant={canBook ? 'contained' : 'outlined'}
                    fullWidth
                    size="small"
                    onClick={() => navigate(`/computers/${computer.id}`)}
                    disabled={!canBook}
                    sx={!canBook ? { borderColor: 'rgba(255,255,255,0.1)', color: 'text.disabled' } : {}}
                  >
                    {canBook ? 'Забронювати' : statusCfg.label}
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

export default ClubDetailPage

import { Box, Button, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import ComputerIcon from '@mui/icons-material/Computer'
import HomeIcon from '@mui/icons-material/Home'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

const NotFoundPage = () => {
  const navigate = useNavigate()

  return (
    <Box sx={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '70vh', textAlign: 'center', px: 3,
    }}>
      {/* Glowing 404 */}
      <Box sx={{ position: 'relative', mb: 4 }}>
        <Typography sx={{
          fontSize: { xs: '7rem', md: '12rem' }, fontWeight: 900, lineHeight: 1,
          background: 'linear-gradient(135deg,#1a0a2e,#2d1b69)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          userSelect: 'none',
          filter: 'drop-shadow(0 0 40px rgba(147,51,234,0.3))',
        }}>
          404
        </Typography>
        <Box className="float" sx={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%,-50%)',
          opacity: 0.15,
        }}>
          <ComputerIcon sx={{ fontSize: { xs: 80, md: 130 }, color: '#a855f7' }} />
        </Box>
      </Box>

      <Typography variant="h4" fontWeight={800} gutterBottom sx={{
        background: 'linear-gradient(135deg,#e2e8f0,#a855f7)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
      }}>
        Сторінку не знайдено
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 5, maxWidth: 380, lineHeight: 1.8 }}>
        Здається, цей комп'ютер уже хтось забронював... або сторінка просто не існує.
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button
          variant="contained"
          startIcon={<HomeIcon />}
          onClick={() => navigate('/')}
          sx={{ px: 4, py: 1.25, borderRadius: 2 }}
        >
          На головну
        </Button>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ px: 4, py: 1.25, borderRadius: 2, borderColor: 'rgba(168,85,247,0.4)', color: '#a855f7', '&:hover': { borderColor: '#a855f7', bgcolor: 'rgba(168,85,247,0.06)' } }}
        >
          Назад
        </Button>
      </Box>

      {/* Decorative dots */}
      <Box sx={{ display: 'flex', gap: 1, mt: 6 }}>
        {['#a855f7','#818cf8','#06b6d4'].map((c, i) => (
          <Box key={i} className="pulse-glow" sx={{
            width: 8, height: 8, borderRadius: '50%', bgcolor: c,
            animationDelay: `${i * 0.4}s`,
          }} />
        ))}
      </Box>
    </Box>
  )
}

export default NotFoundPage

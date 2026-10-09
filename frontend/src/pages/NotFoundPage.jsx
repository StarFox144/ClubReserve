import { Box, Button, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import HomeIcon from '@mui/icons-material/Home'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { usePageTitle } from '../hooks/usePageTitle'
import { cr, font, tint } from '../design/tokens'
import { SynthGrid } from '../components/ui'

const NotFoundPage = () => {
  usePageTitle('404')
  const navigate = useNavigate()

  return (
    <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', textAlign: 'center', px: 2, overflow: 'hidden', borderRadius: '28px' }}>
      <SynthGrid full />

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Typography sx={{ fontFamily: font.mono, fontSize: '0.75rem', letterSpacing: '0.28em', color: cr.dangerText, mb: 2 }}>
          ERR_ROUTE_NOT_FOUND
        </Typography>

        <Typography
          component="h1"
          className="cr-glitch"
          data-text="404"
          aria-label="Помилка 404"
          sx={{
            fontFamily: font.display, fontWeight: 800, lineHeight: 1,
            fontSize: { xs: '6.5rem', sm: '9rem', md: '12rem' },
            color: cr.text,
            textShadow: `0 0 30px ${tint(cr.primary2, 60)}, 0 0 80px ${tint(cr.cyan, 25)}`,
          }}
        >
          404
        </Typography>

        <Typography sx={{ fontFamily: font.mono, fontWeight: 700, fontSize: { xs: '1rem', md: '1.4rem' }, letterSpacing: '0.35em', color: cr.cyanText, mt: 1, mb: 3, textShadow: cr.glowCyan }}>
          — SIGNAL LOST —
        </Typography>

        <Typography sx={{ color: cr.muted, mb: 5, maxWidth: 400, mx: 'auto', lineHeight: 1.8 }}>
          Здається, цей комп'ютер уже хтось забронював… або сторінка просто не існує.
        </Typography>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button variant="contained" size="large" startIcon={<HomeIcon />} onClick={() => navigate('/')}>
            На головну
          </Button>
          <Button variant="outlined" size="large" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
            Назад
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

export default NotFoundPage

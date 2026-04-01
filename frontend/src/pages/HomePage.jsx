import { Box, Typography, Button, Container, Grid, Paper } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import ComputerIcon from '@mui/icons-material/Computer'
import EventAvailableIcon from '@mui/icons-material/EventAvailable'
import SpeedIcon from '@mui/icons-material/Speed'

const HomePage = () => {
  const navigate = useNavigate()

  const features = [
    {
      icon: <ComputerIcon sx={{ fontSize: 48, color: '#a855f7' }} />,
      title: "Вибір комп'ютера",
      description: "Переглядайте доступні комп'ютери в різних клубах та обирайте найкращий для вас.",
    },
    {
      icon: <EventAvailableIcon sx={{ fontSize: 48, color: '#818cf8' }} />,
      title: 'Онлайн бронювання',
      description: 'Бронюйте час у кілька кліків, без черг та очікування.',
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 48, color: '#06b6d4' }} />,
      title: 'Швидко та зручно',
      description: 'Керуйте своїми бронюваннями в особистому кабінеті в будь-який час.',
    },
  ]

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #0d0d1a 0%, #1a0a2e 50%, #0d0d1a 100%)',
          color: 'white',
          py: { xs: 10, md: 16 },
          px: 2,
          textAlign: 'center',
          borderRadius: 3,
          mb: 6,
          border: '1px solid rgba(147,51,234,0.3)',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            padding: '1px',
            background: 'linear-gradient(135deg, #9333ea, #6366f1, #06b6d4, #9333ea)',
            backgroundSize: '300% 300%',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            animation: 'rgbLine 4s linear infinite',
          },
        }}
      >
        {/* Background glow blobs */}
        <Box sx={{
          position: 'absolute', top: '20%', left: '10%',
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(147,51,234,0.15) 0%, transparent 70%)',
          filter: 'blur(40px)', pointerEvents: 'none',
        }} />
        <Box sx={{
          position: 'absolute', bottom: '10%', right: '10%',
          width: 250, height: 250, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
          filter: 'blur(40px)', pointerEvents: 'none',
        }} />

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 800,
              fontSize: { xs: '2rem', md: '3.2rem' },
              background: 'linear-gradient(135deg, #e2e8f0 0%, #a855f7 50%, #818cf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              mb: 2,
            }}
          >
            Забронюй комп'ютер у клубі онлайн
          </Typography>
          <Typography
            variant="h5"
            sx={{ mb: 5, color: 'text.secondary', fontSize: { xs: '1rem', md: '1.2rem' } }}
          >
            ClubReserve — зручна система бронювання місць у комп'ютерних клубах.
            <br />Вибирай клуб, обирай комп'ютер, бронюй час.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/clubs')}
              sx={{ px: 5, py: 1.5, fontSize: '1rem' }}
            >
              Переглянути клуби
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/register')}
              sx={{ px: 5, py: 1.5, fontSize: '1rem' }}
            >
              Зареєструватися
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Features Section */}
      <Box sx={{ mb: 6 }}>
        <Typography
          variant="h4"
          textAlign="center"
          gutterBottom
          sx={{
            fontWeight: 700,
            mb: 4,
            background: 'linear-gradient(135deg, #a855f7, #818cf8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Чому ClubReserve?
        </Typography>
        <Grid container spacing={3}>
          {features.map((feature, idx) => (
            <Grid item xs={12} md={4} key={idx}>
              <Paper
                className="rgb-border"
                sx={{
                  p: 4,
                  textAlign: 'center',
                  height: '100%',
                  background: 'linear-gradient(135deg, #12121a 0%, #1a1a2e 100%)',
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                  },
                }}
              >
                <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                <Typography variant="h6" gutterBottom fontWeight={700} color="text.primary">
                  {feature.title}
                </Typography>
                <Typography color="text.secondary">{feature.description}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* CTA Section */}
      <Paper
        className="rgb-glow"
        sx={{
          p: 6,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #1a0a2e 0%, #12121a 50%, #0a1628 100%)',
          borderRadius: 3,
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          fontWeight={700}
          sx={{
            background: 'linear-gradient(135deg, #a855f7, #6366f1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Готовий почати?
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
          Приєднуйся до ClubReserve вже сьогодні та бронюй місця в улюблених клубах.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/register')}
          sx={{ px: 5 }}
        >
          Створити акаунт
        </Button>
      </Paper>
    </Box>
  )
}

export default HomePage

import { Box, Container, Typography } from '@mui/material'
import Navbar from './Navbar'

const Layout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1, py: 4 }}>
        <Container maxWidth="lg">
          {children}
        </Container>
      </Box>
      <Box
        component="footer"
        sx={{
          py: 3,
          textAlign: 'center',
          background: '#0d0d15',
          borderTop: '1px solid rgba(147,51,234,0.2)',
          boxShadow: '0 -1px 20px rgba(147,51,234,0.08)',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © 2025{' '}
          <Box component="span" sx={{
            background: 'linear-gradient(135deg, #a855f7, #6366f1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: 700,
          }}>
            ClubReserve
          </Box>
          . Всі права захищені.
        </Typography>
      </Box>
    </Box>
  )
}

export default Layout

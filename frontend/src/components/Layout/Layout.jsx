import { Box, Container } from '@mui/material'
import Navbar from './Navbar'
import Footer from './Footer'
import NavProgress from '../NavProgress'

const Layout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
      {/* Global atmosphere: aurora blobs + grain */}
      <div className="cr-atmosphere" aria-hidden><span /></div>
      <div className="cr-noise" aria-hidden />

      <Box
        component="a"
        href="#main"
        className="cr-sr-only"
        sx={{ '&:focus': { position: 'fixed !important', top: 12, left: 12, width: 'auto !important', height: 'auto !important', clip: 'auto !important', zIndex: 2000, p: 1.5, borderRadius: 2, bgcolor: 'background.paper' } }}
      >
        Перейти до вмісту
      </Box>

      <NavProgress />
      <Navbar />
      <Box component="main" id="main" sx={{ flexGrow: 1, position: 'relative', zIndex: 2, pt: { xs: 11, md: 13 }, pb: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          {children}
        </Container>
      </Box>
      <Footer />
    </Box>
  )
}

export default Layout

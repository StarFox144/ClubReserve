import { Box, Typography } from '@mui/material'
import { cr, font } from '../../design/tokens'

/** Neon dual-ring loader with a HUD caption. */
const PageLoader = ({ label = 'Завантаження', minHeight = '50vh' }) => (
  <Box role="status" aria-live="polite" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, minHeight }}>
    <Box sx={{ position: 'relative', width: 52, height: 52 }}>
      <Box sx={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid transparent', borderTopColor: cr.primary2, borderRightColor: cr.primary2, boxShadow: cr.glowSm, animation: 'cr-spin 0.9s linear infinite' }} />
      <Box sx={{ position: 'absolute', inset: 9, borderRadius: '50%', border: '2px solid transparent', borderBottomColor: cr.cyan, borderLeftColor: cr.cyan, animation: 'cr-spin 1.3s linear infinite reverse' }} />
    </Box>
    <Typography sx={{ fontFamily: font.mono, fontSize: '0.72rem', letterSpacing: '0.24em', textTransform: 'uppercase', color: cr.muted }}>
      {label}
      <Box component="span" aria-hidden sx={{ animation: 'cr-blink 1s steps(1) infinite', ml: 0.5, color: cr.cyan }}>_</Box>
    </Typography>
  </Box>
)

export default PageLoader

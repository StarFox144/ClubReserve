import { Box, Typography } from '@mui/material'
import { cr, font, tint } from '../../design/tokens'
import { GlassCard, StatusBadge, SynthGrid } from '../ui'

/** Centered glass "system login" panel over an animated grid. */
const AuthShell = ({ code, title, subtitle, icon, children, accent = cr.primary2 }) => (
  <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: { xs: '72vh', md: '78vh' }, py: { xs: 2, md: 4 } }}>
    {/* animated grid backdrop, bleeding past the container */}
    <Box aria-hidden sx={{ position: 'absolute', inset: { xs: '-40px -16px', md: '-60px -120px' }, overflow: 'hidden', borderRadius: '32px', maskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 75%)', WebkitMaskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 75%)' }}>
      <SynthGrid full />
    </Box>

    <GlassCard strong hud accent={accent} sx={{ position: 'relative', width: '100%', maxWidth: 440, p: { xs: 3, sm: 4.5 }, boxShadow: cr.glowLg, animation: 'cr-scale-in 420ms var(--cr-ease) both' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3.5 }}>
        <Typography sx={{ fontFamily: font.mono, fontSize: '0.7rem', letterSpacing: '0.2em', color: cr.cyanText }}>{code}</Typography>
        <StatusBadge status="online" label="SECURE" />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
        <Box sx={{ width: 46, height: 46, borderRadius: '14px', display: 'grid', placeItems: 'center', flexShrink: 0, color: cr.onPrimary, background: cr.gradPrimary, boxShadow: `0 0 22px ${tint(accent, 55)}` }}>
          {icon}
        </Box>
        <Typography component="h1" sx={{ fontFamily: font.display, fontWeight: 800, fontSize: { xs: '1.55rem', sm: '1.8rem' }, lineHeight: 1.15 }}>
          {title}
        </Typography>
      </Box>
      {subtitle && <Typography sx={{ color: cr.muted, mb: 3.5, fontSize: '0.94rem' }}>{subtitle}</Typography>}

      {children}
    </GlassCard>
  </Box>
)

export default AuthShell

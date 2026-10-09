import { Box, Typography } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import { cr, font, tint } from '../../design/tokens'
import { GlassCard, StatusBadge, SynthGrid } from '../ui'

const LOG = [
  ['OK', 'handshake', 'clubreserve.sys'],
  ['OK', 'sync', 'hall maps · 3 clubs'],
  ['OK', 'encryption', 'TLS 1.3'],
  ['..', 'awaiting', 'player credentials'],
]

/** Info column shown next to the form on desktop. */
const AuthAside = ({ headline, perks, accent }) => (
  <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', justifyContent: 'center', gap: 4, pr: { md: 2, lg: 6 } }}>
    <Box>
      <Typography sx={{ fontFamily: font.mono, fontSize: '0.72rem', letterSpacing: '0.22em', color: cr.cyanText, mb: 2 }}>// ACCESS TERMINAL</Typography>
      <Typography component="p" className="cr-gradient-text" sx={{ fontFamily: font.display, fontWeight: 800, fontSize: { md: '2.2rem', lg: '2.8rem' }, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
        {headline}
      </Typography>
    </Box>

    <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {perks.map((p) => (
        <Box component="li" key={p} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 24, height: 24, flexShrink: 0, borderRadius: '8px', display: 'grid', placeItems: 'center', bgcolor: tint(accent, 14), border: `1px solid ${tint(accent, 45)}`, boxShadow: `0 0 12px ${tint(accent, 30)}` }}>
            <CheckIcon sx={{ fontSize: 14, color: accent }} />
          </Box>
          <Typography sx={{ color: cr.muted }}>{p}</Typography>
        </Box>
      ))}
    </Box>

    <Box aria-hidden sx={{ p: 2, borderRadius: '14px', bgcolor: tint(cr.bg, 60), border: `1px solid ${cr.borderSoft}`, fontFamily: font.mono, fontSize: '0.76rem', lineHeight: 1.9, maxWidth: 420 }}>
      {LOG.map(([st, a, b], i) => (
        <Box key={i} sx={{ display: 'flex', gap: 1.5, animation: `cr-fade-up 400ms var(--cr-ease) ${200 + i * 180}ms both` }}>
          <Box component="span" sx={{ color: st === 'OK' ? cr.successText : cr.warningText, width: 26 }}>[{st}]</Box>
          <Box component="span" sx={{ color: cr.text }}>{a}</Box>
          <Box component="span" sx={{ color: cr.faint }}>{b}</Box>
        </Box>
      ))}
      <Box component="span" sx={{ color: cr.cyan, animation: 'cr-blink 1s steps(1) infinite' }}>▋</Box>
    </Box>
  </Box>
)

/** "System login" screen: info column + glass form over an animated grid. */
const AuthShell = ({ code, title, subtitle, icon, children, accent = cr.primary2, headline, perks = [] }) => (
  <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: { xs: '72vh', md: '78vh' }, py: { xs: 2, md: 4 } }}>
    {/* animated grid backdrop, bleeding past the container */}
    <Box aria-hidden sx={{ position: 'absolute', inset: { xs: '-40px -16px', md: '-60px -24px' }, overflow: 'hidden', borderRadius: '32px', maskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 75%)', WebkitMaskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 75%)' }}>
      <SynthGrid full />
    </Box>

    <Box sx={{ position: 'relative', width: '100%', maxWidth: headline ? 1080 : 440, display: 'grid', gridTemplateColumns: { xs: '1fr', md: headline ? 'minmax(0, 1fr) 440px' : '1fr' }, gap: { md: 4, lg: 6 }, alignItems: 'center' }}>
      {headline && <AuthAside headline={headline} perks={perks} accent={accent} />}

      <GlassCard strong hud accent={accent} sx={{ width: '100%', maxWidth: 440, mx: 'auto', p: { xs: 3, sm: 4.5 }, boxShadow: cr.glowLg, animation: 'cr-scale-in 420ms var(--cr-ease) both' }}>
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
  </Box>
)

export default AuthShell

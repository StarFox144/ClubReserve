import { Box, Typography } from '@mui/material'
import { cr, font, tint } from '../../design/tokens'
import GlassCard from './GlassCard'

/** HUD metric: caps label + big mono value + optional bar/hint. */
const HudStat = ({ label, value, accent = cr.primary2, icon, hint, progress, hud = true, compact = false, sx }) => (
  <GlassCard hud={hud} accent={accent} sx={{ p: compact ? 2 : 2.5, height: '100%', overflow: 'hidden', ...sx }}>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: compact ? 0.75 : 1.25 }}>
      <Typography
        component="span"
        sx={{ fontFamily: font.mono, fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: cr.muted }}
      >
        {label}
      </Typography>
      {icon && <Box sx={{ color: accent, display: 'flex', '& svg': { fontSize: 18, filter: `drop-shadow(0 0 6px ${tint(accent, 60)})` } }}>{icon}</Box>}
    </Box>
    <Typography
      component="div"
      sx={{
        fontFamily: font.mono,
        fontWeight: 700,
        fontSize: compact ? '1.4rem' : { xs: '1.6rem', md: '2rem' },
        lineHeight: 1.1,
        color: cr.text,
        textShadow: `0 0 18px ${tint(accent, 45)}`,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      {value}
    </Typography>
    {progress != null && (
      <Box sx={{ mt: 1.5, height: 4, borderRadius: 4, bgcolor: tint(accent, 15), overflow: 'hidden' }}>
        <Box sx={{ height: '100%', width: `${Math.max(0, Math.min(100, progress))}%`, background: accent, boxShadow: `0 0 10px ${accent}`, borderRadius: 4 }} />
      </Box>
    )}
    {hint && <Typography variant="caption" sx={{ display: 'block', mt: 1, color: cr.faint }}>{hint}</Typography>}
  </GlassCard>
)

export default HudStat

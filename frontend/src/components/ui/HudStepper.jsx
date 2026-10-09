import { Box, Typography } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import { cr, font, tint, ease } from '../../design/tokens'

/** Step progress bar: numbered nodes on a neon track. */
const HudStepper = ({ steps, active, sx }) => {
  const pct = steps.length > 1 ? (Math.min(active, steps.length - 1) / (steps.length - 1)) * 100 : 0

  return (
    <Box sx={{ position: 'relative', px: { xs: 1, sm: 2 }, ...sx }} role="list" aria-label="Кроки бронювання">
      {/* track */}
      <Box sx={{ position: 'absolute', top: 15, left: { xs: 24, sm: 34 }, right: { xs: 24, sm: 34 }, height: 2, bgcolor: tint(cr.primary, 18), borderRadius: 2 }}>
        <Box sx={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${cr.primary2}, ${cr.cyan})`, boxShadow: `0 0 10px ${cr.cyan}`, borderRadius: 2, transition: `width 400ms ${ease}` }} />
      </Box>
      <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'space-between' }}>
        {steps.map((label, i) => {
          const done = i < active
          const current = i === active
          const color = done ? cr.cyan : current ? cr.primary2 : cr.faint
          return (
            <Box key={label} role="listitem" aria-current={current ? 'step' : undefined} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
              <Box
                sx={{
                  width: 32, height: 32, borderRadius: '10px',
                  display: 'grid', placeItems: 'center',
                  fontFamily: font.mono, fontWeight: 700, fontSize: '0.8rem',
                  color: done || current ? cr.text : cr.faint,
                  bgcolor: cr.surface,
                  border: `1px solid ${color}`,
                  boxShadow: done || current ? `0 0 14px ${tint(color, 55)}` : 'none',
                  transition: `all 300ms ${ease}`,
                }}
              >
                {done ? <CheckIcon sx={{ fontSize: 16, color: cr.cyan }} /> : String(i + 1).padStart(2, '0')}
              </Box>
              <Typography sx={{ fontFamily: font.mono, fontSize: '0.66rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: current ? cr.primaryText : done ? cr.cyanText : cr.faint, whiteSpace: 'nowrap' }}>
                {label}
              </Typography>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}

export default HudStepper

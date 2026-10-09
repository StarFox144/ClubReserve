import { Box } from '@mui/material'
import { cr, tint } from '../../design/tokens'

/** Animated synthwave perspective grid + horizon glow (CSS only). */
const SynthGrid = ({ full = false, horizon = true }) => (
  <Box aria-hidden sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
    {horizon && (
      <Box
        sx={{
          position: 'absolute', left: '-10%', right: '-10%', bottom: full ? '45%' : '62%', height: 160,
          background: `radial-gradient(ellipse at 50% 100%, ${tint(cr.magenta, 30)}, ${tint(cr.primary, 15)} 40%, transparent 70%)`,
          filter: 'blur(10px)',
        }}
      />
    )}
    <div className={`cr-synth-grid${full ? ' cr-synth-grid--full' : ''}`} />
  </Box>
)

export default SynthGrid

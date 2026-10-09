import { Box } from '@mui/material'
import { cr, font, tint } from '../../design/tokens'

/** Infinite neon ticker. Items are rendered twice for a seamless loop. */
const Marquee = ({ items, label, sx }) => (
  <Box
    className="cr-marquee"
    role="region"
    aria-label={label}
    sx={{
      position: 'relative',
      overflow: 'hidden',
      py: 1.75,
      borderTop: `1px solid ${cr.borderSoft}`,
      borderBottom: `1px solid ${cr.borderSoft}`,
      background: `linear-gradient(90deg, ${tint(cr.primary, 6)}, ${tint(cr.cyan, 4)}, ${tint(cr.magenta, 5)})`,
      maskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)',
      WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)',
      ...sx,
    }}
  >
    <Box className="cr-marquee-track">
      {[0, 1].map((copy) => (
        <Box key={copy} aria-hidden={copy === 1} sx={{ display: 'flex', flexShrink: 0 }}>
          {items.map((it) => (
            <Box key={it} sx={{ display: 'flex', alignItems: 'center', gap: 2.5, px: 2.5, fontFamily: font.display, fontWeight: 700, fontSize: { xs: '0.95rem', md: '1.1rem' }, color: cr.muted, whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {it}
              <Box component="span" aria-hidden sx={{ width: 6, height: 6, transform: 'rotate(45deg)', bgcolor: cr.primary2, boxShadow: `0 0 8px ${cr.primary2}` }} />
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  </Box>
)

export default Marquee

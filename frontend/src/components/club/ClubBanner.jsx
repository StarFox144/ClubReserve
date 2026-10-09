import { Box } from '@mui/material'
import { cr, font, tint, ACCENTS } from '../../design/tokens'

/**
 * Procedural neon "photo" for a club (the API has no images):
 * a deterministic composition seeded by the club id.
 */
const ClubBanner = ({ id = 0, name = '', height = 180, children, rounded = true, sx }) => {
  const a = ACCENTS[id % ACCENTS.length]
  const b = ACCENTS[(id + 2) % ACCENTS.length]
  const angle = (id * 47) % 360
  const baseH = typeof height === 'number' ? height : (height?.md || height?.xs || 200)
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()

  return (
    <Box
      sx={{
        position: 'relative',
        height,
        overflow: 'hidden',
        borderRadius: rounded ? 'inherit' : 0,
        bgcolor: cr.surface,
        background: `radial-gradient(120% 90% at ${20 + (id * 13) % 60}% 0%, ${tint(a, 45)}, transparent 60%),
          radial-gradient(90% 80% at 100% 100%, ${tint(b, 35)}, transparent 60%),
          linear-gradient(${angle}deg, ${cr.elevated}, ${cr.surface})`,
        ...sx,
      }}
    >
      {/* rack lines / seats silhouette */}
      <Box aria-hidden sx={{
        position: 'absolute', inset: 0, opacity: 0.55,
        backgroundImage: `repeating-linear-gradient(90deg, ${tint(a, 30)} 0 1px, transparent 1px 28px), repeating-linear-gradient(0deg, ${tint(b, 20)} 0 1px, transparent 1px 28px)`,
        maskImage: 'linear-gradient(to top, #000, transparent 85%)',
        WebkitMaskImage: 'linear-gradient(to top, #000, transparent 85%)',
        transform: 'perspective(300px) rotateX(40deg) scale(1.4)',
        transformOrigin: '50% 100%',
      }} />
      {/* neon strip */}
      <Box aria-hidden sx={{ position: 'absolute', left: '-10%', right: '-10%', top: '38%', height: 2, background: `linear-gradient(90deg, transparent, ${a}, ${b}, transparent)`, boxShadow: `0 0 18px ${a}`, transform: `rotate(${(id % 2 ? -1 : 1) * 6}deg)` }} />
      {/* monogram */}
      <Box aria-hidden sx={{ position: 'absolute', right: 16, top: 6, fontFamily: font.display, fontWeight: 800, fontSize: baseH * 0.5, lineHeight: 1, color: tint(cr.text, 7), letterSpacing: '-0.04em', userSelect: 'none' }}>
        {initials}
      </Box>
      {/* bottom darkening gradient for legibility */}
      <Box aria-hidden sx={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, ${tint(cr.bg, 92)} 0%, ${tint(cr.bg, 40)} 45%, transparent 75%)` }} />
      {children && <Box sx={{ position: 'relative', zIndex: 1, height: '100%' }}>{children}</Box>}
    </Box>
  )
}

export default ClubBanner

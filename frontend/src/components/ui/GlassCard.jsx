import { forwardRef, useCallback } from 'react'
import { Box } from '@mui/material'
import { cr, cut as cutPath, tint, ease } from '../../design/tokens'
import HudCorners from './HudCorners'

/**
 * Glass surface with optional hover lift + glow + cursor spotlight,
 * HUD corner markers and chamfered (clip-path) corners.
 */
const GlassCard = forwardRef(function GlassCard(
  { children, hover = false, hud = false, cut = false, accent = cr.primary2, strong = false, sx, onMouseMove, ...rest },
  ref,
) {
  const handleMove = useCallback((e) => {
    if (hover) {
      const r = e.currentTarget.getBoundingClientRect()
      e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
      e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
    }
    onMouseMove?.(e)
  }, [hover, onMouseMove])

  return (
    <Box
      ref={ref}
      onMouseMove={handleMove}
      sx={[
        {
          position: 'relative',
          borderRadius: cut ? 0 : '16px',
          background: strong ? cr.glassStrong : cr.glass,
          backdropFilter: 'blur(16px) saturate(140%)',
          WebkitBackdropFilter: 'blur(16px) saturate(140%)',
          border: `1px solid ${cr.border}`,
          clipPath: cut ? cutPath(typeof cut === 'number' ? cut : 16) : undefined,
          transition: `transform 300ms ${ease}, box-shadow 300ms ${ease}, border-color 300ms ${ease}`,
          isolation: 'isolate',
        },
        hover && {
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            background: `radial-gradient(420px circle at var(--mx, 50%) var(--my, 0%), ${tint(accent, 16)}, transparent 45%)`,
            opacity: 0,
            transition: `opacity 300ms ${ease}`,
            pointerEvents: 'none',
            zIndex: -1,
          },
          '@media (hover: hover)': {
            '&:hover': {
              transform: 'translateY(-4px)',
              borderColor: tint(accent, 60),
              boxShadow: `0 0 28px ${tint(accent, 22)}, 0 0 1px ${accent}`,
            },
            '&:hover::before': { opacity: 1 },
          },
          '&:focus-within': { borderColor: tint(accent, 60) },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...rest}
    >
      {hud && <HudCorners color={accent} />}
      {children}
    </Box>
  )
})

export default GlassCard

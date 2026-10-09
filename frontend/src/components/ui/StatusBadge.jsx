import { Box } from '@mui/material'
import { STATUS, font, tint } from '../../design/tokens'

const PULSING = new Set(['online', 'free', 'active', 'busy'])

/**
 * Status chip with a (pulsing) dot: ONLINE, Вільно, Зайнято, VIP…
 * Pass `status` from the STATUS map, or `color` + `label` for custom ones.
 */
const StatusBadge = ({ status, label, color, textColor, pulse, size = 'sm', icon, sx }) => {
  const cfg = STATUS[status] || {}
  const c = color || cfg.color
  const t = textColor || cfg.text || c
  const doPulse = pulse ?? PULSING.has(status)
  const small = size === 'sm'

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        px: small ? 1 : 1.5,
        height: small ? 24 : 30,
        borderRadius: '8px',
        fontFamily: font.mono,
        fontSize: small ? '0.68rem' : '0.75rem',
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        color: t,
        background: tint(c, 12),
        border: `1px solid ${tint(c, 40)}`,
        ...sx,
      }}
    >
      {icon || (
        <Box
          component="span"
          aria-hidden
          sx={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            flexShrink: 0,
            bgcolor: c,
            color: c,
            boxShadow: `0 0 8px ${c}`,
            animation: doPulse ? 'cr-pulse 1.8s ease-out infinite' : 'none',
          }}
        />
      )}
      {label ?? cfg.label}
    </Box>
  )
}

export default StatusBadge

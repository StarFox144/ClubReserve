import { Box, Typography } from '@mui/material'
import { cr, tint } from '../../design/tokens'

const stroke = { fill: 'none', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', strokeDasharray: 400, strokeDashoffset: 400, style: { animation: 'cr-draw 1.6s var(--cr-ease) forwards' } }

// Line-art neon illustrations (stroke only, drawn in on mount)
const ART = {
  pc: (
    <>
      <rect x="22" y="18" width="76" height="50" rx="4" {...stroke} stroke={cr.primary2} />
      <path d="M50 68 L46 84 M70 68 L74 84 M38 86 H82" {...stroke} stroke={cr.primary2} />
      <path d="M36 34 H64 M36 44 H78 M36 54 H56" {...stroke} stroke={cr.cyan} />
    </>
  ),
  calendar: (
    <>
      <rect x="24" y="24" width="72" height="62" rx="6" {...stroke} stroke={cr.primary2} />
      <path d="M24 40 H96 M42 16 V30 M78 16 V30" {...stroke} stroke={cr.primary2} />
      <path d="M44 62 L56 72 L78 52" {...stroke} stroke={cr.cyan} />
    </>
  ),
  search: (
    <>
      <circle cx="52" cy="50" r="26" {...stroke} stroke={cr.primary2} />
      <path d="M71 69 L94 92" {...stroke} stroke={cr.cyan} />
      <path d="M40 50 H64" {...stroke} stroke={cr.magenta} />
    </>
  ),
  signal: (
    <>
      <path d="M30 84 L60 30 L90 84 Z" {...stroke} stroke={cr.primary2} />
      <path d="M60 50 V66 M60 74 V76" {...stroke} stroke={cr.danger} />
    </>
  ),
}

/** Empty state: neon line illustration + text + CTA. */
const EmptyState = ({ art = 'pc', title, text, action, compact = false, sx }) => (
  <Box sx={{ textAlign: 'center', py: compact ? 5 : { xs: 7, md: 10 }, px: 2, ...sx }}>
    <Box
      component="svg"
      viewBox="0 0 120 100"
      aria-hidden
      sx={{
        width: compact ? 96 : 140,
        height: 'auto',
        mb: 2.5,
        filter: `drop-shadow(0 0 8px ${tint(cr.primary2, 60)})`,
      }}
    >
      {ART[art] || ART.pc}
    </Box>
    {title && <Typography variant="h6" component="p" sx={{ mb: 1, color: cr.text }}>{title}</Typography>}
    {text && <Typography sx={{ color: cr.muted, maxWidth: 420, mx: 'auto', lineHeight: 1.7 }}>{text}</Typography>}
    {action && <Box sx={{ mt: 3, display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>{action}</Box>}
  </Box>
)

export default EmptyState

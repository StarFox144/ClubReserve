import { Box } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { cr, font, tint } from '../../design/tokens'

/** Glowing hex logo mark + wordmark. */
const Logo = ({ compact = false, onClick }) => (
  <Box
    component={RouterLink}
    to="/"
    onClick={onClick}
    aria-label="ClubReserve — на головну"
    sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.25, textDecoration: 'none', borderRadius: '10px', flexShrink: 0 }}
  >
    <Box
      component="svg"
      viewBox="0 0 32 32"
      aria-hidden
      sx={{ width: compact ? 28 : 32, height: compact ? 28 : 32, transition: 'width 300ms var(--cr-ease), height 300ms var(--cr-ease)', filter: `drop-shadow(0 0 6px ${tint(cr.primary2, 80)})` }}
    >
      <defs>
        <linearGradient id="cr-logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--cr-primary-2)" />
          <stop offset="100%" stopColor="var(--cr-cyan)" />
        </linearGradient>
      </defs>
      <path d="M16 2 L28 9 V23 L16 30 L4 23 V9 Z" fill="none" stroke="url(#cr-logo-g)" strokeWidth="2" />
      <rect x="10" y="11" width="12" height="8" rx="1.5" fill="none" stroke="var(--cr-text)" strokeWidth="1.6" />
      <path d="M13 22 H19" stroke="var(--cr-cyan)" strokeWidth="1.8" strokeLinecap="round" />
    </Box>
    <Box
      component="span"
      sx={{
        fontFamily: font.display,
        fontWeight: 700,
        fontSize: compact ? '0.98rem' : '1.08rem',
        letterSpacing: '0.02em',
        color: cr.text,
        transition: 'font-size 300ms var(--cr-ease)',
        '& b': { color: cr.primaryText, fontWeight: 700, textShadow: `0 0 14px ${tint(cr.primary2, 70)}` },
      }}
    >
      Club<b>Reserve</b>
    </Box>
  </Box>
)

export default Logo

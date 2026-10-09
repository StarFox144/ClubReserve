import { Box, Typography } from '@mui/material'
import { cr, font, tint } from '../../design/tokens'

/** «// 01 — НАЗВА» badge + large gradient title + optional subtitle. */
const SectionHeader = ({ index, label, title, subtitle, align = 'left', component = 'h2', size = 'lg', action, sx }) => {
  const center = align === 'center'
  const num = index != null ? String(index).padStart(2, '0') : null

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: action ? 'row' : 'column' },
        alignItems: { xs: center ? 'center' : 'flex-start', sm: action ? 'flex-end' : center ? 'center' : 'flex-start' },
        justifyContent: 'space-between',
        gap: 2,
        textAlign: center ? 'center' : 'left',
        mb: { xs: 3, md: size === 'lg' ? 5 : 3 },
        ...sx,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        {label && (
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              mb: 1.5,
              px: 1.25,
              py: 0.5,
              borderRadius: '6px',
              fontFamily: font.mono,
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: cr.cyanText,
              background: tint(cr.cyan, 8),
              border: `1px solid ${tint(cr.cyan, 30)}`,
            }}
          >
            <span aria-hidden>//</span>
            {num && <span>{num}</span>}
            {num && <span aria-hidden>—</span>}
            <span>{label}</span>
          </Box>
        )}
        <Typography
          component={component}
          className="cr-gradient-text"
          sx={{
            fontFamily: font.display,
            fontWeight: 800,
            lineHeight: 1.12,
            letterSpacing: '-0.02em',
            fontSize: size === 'lg'
              ? { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' }
              : { xs: '1.5rem', md: '2rem' },
            wordBreak: 'break-word',
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography sx={{ mt: 1.25, color: cr.muted, maxWidth: center ? 620 : 680, mx: center ? 'auto' : 0, lineHeight: 1.7 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
    </Box>
  )
}

export default SectionHeader

import { Box, Divider, Typography } from '@mui/material'
import { cr, font, tint } from '../../design/tokens'
import { GlassCard } from '../ui'

const Row = ({ label, children }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 2, py: 0.75 }}>
    <Typography sx={{ fontFamily: font.mono, fontSize: '0.68rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: cr.faint, flexShrink: 0 }}>{label}</Typography>
    <Typography component="div" sx={{ fontFamily: font.mono, fontSize: '0.85rem', fontWeight: 600, color: cr.text, textAlign: 'right', minWidth: 0, wordBreak: 'break-word' }}>{children}</Typography>
  </Box>
)

/** Glass order summary with a mono price block. All values are preformatted by the caller. */
const BookingSummary = ({ pcName, clubName, start, end, durationLabel, pricePerHour, baseCost, discountPct = 0, finalCost, sx }) => (
  <GlassCard strong hud accent={cr.cyan} sx={{ p: 2.5, ...sx }}>
    <Typography sx={{ fontFamily: font.mono, fontSize: '0.68rem', letterSpacing: '0.2em', color: cr.cyanText, mb: 1.5 }}>// ПІДСУМОК</Typography>
    <Row label="Місце">{pcName || '—'}</Row>
    {clubName && <Row label="Клуб">{clubName}</Row>}
    <Row label="Дата">{start?.isValid() ? start.format('dd, D MMM') : '—'}</Row>
    <Row label="Час">{start?.isValid() && end?.isValid() ? `${start.format('HH:mm')} → ${end.format('HH:mm')}` : '—'}</Row>
    <Row label="Тривалість">{durationLabel || '—'}</Row>
    {pricePerHour != null && <Row label="Тариф">₴{Number(pricePerHour).toFixed(0)}/год</Row>}

    <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />

    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
      <Typography sx={{ fontFamily: font.mono, fontSize: '0.7rem', letterSpacing: '0.16em', color: cr.muted }}>ДО СПЛАТИ</Typography>
      <Box sx={{ textAlign: 'right' }}>
        {discountPct > 0 && baseCost != null && (
          <Typography sx={{ fontFamily: font.mono, fontSize: '0.8rem', color: cr.faint, textDecoration: 'line-through' }}>₴{Number(baseCost).toFixed(2)}</Typography>
        )}
        <Typography sx={{ fontFamily: font.mono, fontWeight: 700, fontSize: '1.7rem', lineHeight: 1.1, color: cr.successText, textShadow: `0 0 18px ${tint(cr.success, 45)}` }}>
          {finalCost != null ? `₴${Number(finalCost).toFixed(2)}` : '—'}
        </Typography>
        {discountPct > 0 && <Typography sx={{ fontFamily: font.mono, fontSize: '0.72rem', color: cr.successText }}>знижка −{discountPct}%</Typography>}
      </Box>
    </Box>
  </GlassCard>
)

export default BookingSummary

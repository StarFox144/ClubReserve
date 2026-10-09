import { Box, Button, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import CheckIcon from '@mui/icons-material/Check'
import { cr, font, tint } from '../../design/tokens'

/** Success screen after a booking: pulse rings + "ACCESS GRANTED". */
const AccessGranted = ({ pcName, when, onClose }) => (
  <Box role="status" aria-live="polite" sx={{ textAlign: 'center', py: { xs: 3, md: 4 }, px: 1 }}>
    <Box sx={{ position: 'relative', width: 96, height: 96, mx: 'auto', mb: 3 }}>
      {[0, 1].map((i) => (
        <Box key={i} aria-hidden sx={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `2px solid ${cr.success}`, animation: `cr-ring 1.8s var(--cr-ease) ${i * 0.6}s infinite` }} />
      ))}
      <Box sx={{ position: 'absolute', inset: 12, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: tint(cr.success, 14), border: `2px solid ${cr.success}`, boxShadow: `0 0 30px ${tint(cr.success, 55)}` }}>
        <CheckIcon sx={{ fontSize: 40, color: cr.success }} />
      </Box>
    </Box>

    <Typography sx={{ fontFamily: font.mono, fontSize: '0.7rem', letterSpacing: '0.24em', color: cr.faint, mb: 1 }}>BOOKING://CONFIRMED</Typography>
    <Typography
      component="p"
      sx={{
        fontFamily: font.display, fontWeight: 800, fontSize: { xs: '1.5rem', sm: '1.9rem' },
        color: cr.successText, textShadow: `0 0 24px ${tint(cr.success, 55)}`,
        animation: 'cr-granted 900ms var(--cr-ease) both',
        letterSpacing: '0.14em',
      }}
    >
      ACCESS GRANTED
    </Typography>
    <Typography sx={{ color: cr.muted, mt: 1.5, mb: 3.5 }}>
      Бронювання успішно створено{pcName ? <> · <Box component="span" sx={{ fontFamily: font.mono, color: cr.text }}>{pcName}</Box></> : null}
      {when && <><br /><Box component="span" sx={{ fontFamily: font.mono, color: cr.cyanText }}>{when}</Box></>}
    </Typography>

    <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
      <Button variant="contained" component={RouterLink} to="/bookings">Мої бронювання</Button>
      {onClose && <Button variant="outlined" onClick={onClose}>Закрити</Button>}
    </Box>
  </Box>
)

export default AccessGranted

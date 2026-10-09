import { useMemo } from 'react'
import { Box, ButtonBase, Typography } from '@mui/material'
import dayjs from 'dayjs'
import { cr, font, tint, ease } from '../../design/tokens'

const PERIODS = [
  { label: 'Ніч', from: 0, to: 6 },
  { label: 'Ранок', from: 6, to: 12 },
  { label: 'День', from: 12, to: 18 },
  { label: 'Вечір', from: 18, to: 24 },
]

export const slotKey = (dj) => dj.format('YYYY-MM-DDTHH:mm')

/**
 * Start-time slots for one day. Past slots and slots known to be busy
 * (`busyKeys`, filled after a failed availability check) are crossed out.
 */
const TimeSlotGrid = ({ date, value, onChange, busyKeys, step = 30 }) => {
  const slots = useMemo(() => {
    if (!date?.isValid()) return []
    const base = date.startOf('day')
    return Array.from({ length: (24 * 60) / step }, (_, i) => base.add(i * step, 'minute'))
  }, [date, step])

  if (!slots.length) return null
  const now = dayjs()

  return (
    <Box role="radiogroup" aria-label="Час початку" sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 300, overflowY: 'auto', pr: 0.5 }}>
      {PERIODS.map((p) => {
        const items = slots.filter((s) => s.hour() >= p.from && s.hour() < p.to)
        if (items.every((s) => s.isBefore(now))) return null
        return (
          <Box key={p.label}>
            <Typography sx={{ fontFamily: font.mono, fontSize: '0.64rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: cr.faint, mb: 0.75 }}>
              {p.label}
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(64px, 1fr))', gap: 0.75 }}>
              {items.map((s) => {
                const past = s.isBefore(now)
                const busy = busyKeys?.has(slotKey(s))
                const selected = value?.isValid() && value.isSame(s, 'minute')
                const disabled = past || busy
                const c = busy ? cr.danger : selected ? cr.cyan : cr.primary2
                return (
                  <ButtonBase
                    key={s.valueOf()}
                    role="radio"
                    aria-checked={selected}
                    aria-label={`${s.format('HH:mm')}${busy ? ', зайнято' : past ? ', минув' : ''}`}
                    disabled={disabled}
                    onClick={() => onChange(s)}
                    sx={{
                      height: 36,
                      borderRadius: '9px',
                      fontFamily: font.mono,
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: selected ? cr.text : disabled ? cr.faint : cr.muted,
                      border: `1px solid ${selected ? cr.cyan : busy ? tint(cr.danger, 40) : cr.border}`,
                      bgcolor: selected ? tint(cr.cyan, 18) : busy ? tint(cr.danger, 8) : cr.glass,
                      boxShadow: selected ? `0 0 14px ${tint(cr.cyan, 55)}` : 'none',
                      textDecoration: disabled ? 'line-through' : 'none',
                      textDecorationColor: busy ? cr.danger : undefined,
                      opacity: past ? 0.45 : 1,
                      transition: `all 200ms ${ease}`,
                      '&:hover:not(:disabled)': { borderColor: c, color: cr.text, bgcolor: tint(c, 12) },
                      '&.Mui-focusVisible': { boxShadow: cr.focusRing },
                    }}
                  >
                    {s.format('HH:mm')}
                  </ButtonBase>
                )
              })}
            </Box>
          </Box>
        )
      })}
    </Box>
  )
}

export default TimeSlotGrid

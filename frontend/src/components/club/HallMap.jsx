import { Box, ButtonBase, Tooltip, Typography } from '@mui/material'
import { cr, font, tint, ease, STATUS } from '../../design/tokens'
import { parseSpecs, isVip } from './clubUtils'

export const seatStatus = (pc, busyIds) => (!pc.is_active ? 'maintenance' : busyIds.has(pc.id) ? 'busy' : 'free')

const chunk = (arr, n) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n))

const SeatTooltip = ({ pc, status }) => {
  const st = STATUS[status]
  return (
    <Box sx={{ minWidth: 190 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 0.75 }}>
        <Box component="span" sx={{ fontWeight: 700, color: cr.text, fontSize: '0.8rem' }}>{pc.name}</Box>
        <Box component="span" sx={{ color: st.text, fontWeight: 700 }}>● {st.label}</Box>
      </Box>
      {parseSpecs(pc.description).map((s, i) => (
        <Box key={i} sx={{ display: 'flex', gap: 1, lineHeight: 1.7 }}>
          <Box component="span" sx={{ color: s.text, width: 34, flexShrink: 0 }}>{s.kind}</Box>
          <Box component="span" sx={{ color: cr.muted }}>{s.label}</Box>
        </Box>
      ))}
      {pc.price_per_hour && (
        <Box sx={{ mt: 0.75, pt: 0.75, borderTop: `1px solid ${cr.borderSoft}`, color: cr.text, fontWeight: 700 }}>
          ₴{Number(pc.price_per_hour).toFixed(0)}/год
        </Box>
      )}
    </Box>
  )
}

const Seat = ({ pc, status, vip, selected, onSelect }) => {
  const st = STATUS[status]
  const c = st.color
  const price = pc.price_per_hour ? `, ₴${Number(pc.price_per_hour).toFixed(0)} за годину` : ''

  return (
    <Tooltip title={<SeatTooltip pc={pc} status={status} />} placement="top" enterDelay={120} disableInteractive>
      <ButtonBase
        onClick={() => onSelect(pc)}
        aria-pressed={selected}
        aria-label={`${pc.name}${vip ? ', VIP' : ''}, ${st.label}${price}`}
        sx={{
          position: 'relative',
          width: 72,
          height: 64,
          flexShrink: 0,
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.5,
          color: cr.text,
          border: `1px solid ${selected ? cr.cyan : tint(c, 65)}`,
          bgcolor: selected ? tint(cr.cyan, 16) : tint(c, status === 'free' ? 10 : 16),
          backgroundImage: status === 'busy'
            ? `linear-gradient(135deg, transparent 47%, ${tint(c, 55)} 49%, ${tint(c, 55)} 51%, transparent 53%)`
            : status === 'maintenance'
              ? `repeating-linear-gradient(-45deg, transparent 0 6px, ${tint(c, 18)} 6px 9px)`
              : 'none',
          boxShadow: selected ? `0 0 0 2px ${tint(cr.cyan, 40)}, 0 0 24px ${tint(cr.cyan, 60)}` : `inset 0 0 12px ${tint(c, 12)}`,
          transform: selected ? 'translateY(-3px)' : 'none',
          transition: `all 250ms ${ease}`,
          '&:hover': { borderColor: selected ? cr.cyan : c, boxShadow: selected ? undefined : `0 0 16px ${tint(c, 45)}`, transform: 'translateY(-3px)' },
          '&.Mui-focusVisible': { boxShadow: cr.focusRing },
        }}
      >
        {/* monitor glyph */}
        <Box aria-hidden sx={{ width: 26, height: 15, borderRadius: '3px', border: `1.5px solid ${selected ? cr.cyan : c}`, boxShadow: `0 0 8px ${tint(selected ? cr.cyan : c, 60)}`, position: 'relative', '&::after': { content: '""', position: 'absolute', left: '50%', bottom: -5, width: 10, height: 2, transform: 'translateX(-50%)', bgcolor: selected ? cr.cyan : c } }} />
        <Typography component="span" sx={{ fontFamily: font.mono, fontSize: '0.66rem', fontWeight: 700, maxWidth: 64, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', mt: 0.5 }}>
          {pc.name.replace(/\s*\(.*\)\s*/, '')}
        </Typography>
        {vip && (
          <Box aria-hidden sx={{ position: 'absolute', top: -7, right: -7, px: 0.5, borderRadius: '5px', fontFamily: font.mono, fontSize: '0.55rem', fontWeight: 700, color: cr.bg, bgcolor: cr.vip, boxShadow: `0 0 8px ${cr.vip}` }}>
            VIP
          </Box>
        )}
      </ButtonBase>
    </Tooltip>
  )
}

const Zone = ({ title, color, items, busyIds, selectedId, onSelect, vip }) => (
  <Box
    role="group"
    aria-label={title}
    sx={{
      position: 'relative',
      p: { xs: 2, sm: 2.5 },
      pt: 3.5,
      borderRadius: '16px',
      border: `1px ${vip ? 'solid' : 'dashed'} ${tint(color, vip ? 55 : 35)}`,
      bgcolor: tint(color, vip ? 6 : 3),
      boxShadow: vip ? `inset 0 0 40px ${tint(color, 10)}, 0 0 20px ${tint(color, 12)}` : 'none',
    }}
  >
    <Typography sx={{ position: 'absolute', top: -10, left: 16, px: 1, bgcolor: cr.surface, fontFamily: font.mono, fontSize: '0.66rem', fontWeight: 700, letterSpacing: '0.2em', color: vip ? cr.vipText : cr.muted, borderRadius: '4px' }}>
      {title}
    </Typography>
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {chunk(items, 6).map((row, r) => (
        <Box key={r} sx={{ display: 'flex', gap: 1.25 }}>
          {row.map((pc, i) => (
            <Box key={pc.id} sx={{ display: 'flex', ml: i === 3 ? 3 : 0 }}>
              <Seat pc={pc} status={seatStatus(pc, busyIds)} vip={vip} selected={pc.id === selectedId} onSelect={onSelect} />
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  </Box>
)

/** Interactive hall map: seats colored by status, VIP zone framed in amber. */
const HallMap = ({ computers, busyIds, selectedId, onSelect }) => {
  const vip = computers.filter(isVip)
  const regular = computers.filter((c) => !isVip(c))

  return (
    <Box>
      {/* Legend */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 1.5, sm: 2.5 }, mb: 2.5 }}>
        {['free', 'busy', 'maintenance', 'vip'].map((k) => (
          <Box key={k} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontFamily: font.mono, fontSize: '0.7rem', letterSpacing: '0.06em', color: cr.muted }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '3px', bgcolor: STATUS[k].color, boxShadow: `0 0 8px ${STATUS[k].color}` }} />
            {STATUS[k].label}
          </Box>
        ))}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontFamily: font.mono, fontSize: '0.7rem', color: cr.muted }}>
          <Box sx={{ width: 10, height: 10, borderRadius: '3px', border: `2px solid ${cr.cyan}`, boxShadow: `0 0 8px ${cr.cyan}` }} />
          Обране
        </Box>
      </Box>

      {/* Scrollable on small screens */}
      <Box sx={{ overflowX: 'auto', pb: 1, mx: { xs: -2, sm: 0 }, px: { xs: 2, sm: 0 }, pt: 1.5 }}>
        <Box sx={{ minWidth: 'max-content', display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* stage / entrance marker */}
          <Box aria-hidden sx={{ mx: 'auto', width: '70%', minWidth: 260, textAlign: 'center' }}>
            <Box sx={{ height: 3, borderRadius: 3, background: cr.gradLine, boxShadow: `0 0 14px ${tint(cr.primary2, 60)}` }} />
            <Typography sx={{ mt: 0.75, fontFamily: font.mono, fontSize: '0.62rem', letterSpacing: '0.3em', color: cr.faint }}>ЕКРАН · ВХІД</Typography>
          </Box>
          {regular.length > 0 && <Zone title="ЗАГАЛЬНИЙ ЗАЛ" color={cr.primary2} items={regular} busyIds={busyIds} selectedId={selectedId} onSelect={onSelect} />}
          {vip.length > 0 && <Zone title="★ VIP ZONE" color={cr.vip} items={vip} busyIds={busyIds} selectedId={selectedId} onSelect={onSelect} vip />}
        </Box>
      </Box>
    </Box>
  )
}

export default HallMap

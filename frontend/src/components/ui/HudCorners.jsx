import { Box } from '@mui/material'
import { cr } from '../../design/tokens'

const CORNERS = [
  { top: 0, left: 0, borderTop: 1, borderLeft: 1 },
  { top: 0, right: 0, borderTop: 1, borderRight: 1 },
  { bottom: 0, left: 0, borderBottom: 1, borderLeft: 1 },
  { bottom: 0, right: 0, borderBottom: 1, borderRight: 1 },
]

/** HUD corner brackets for key blocks. Purely decorative. */
const HudCorners = ({ color = cr.cyan, size = 14, inset = 6, thickness = 2 }) => (
  <Box aria-hidden sx={{ position: 'absolute', inset, pointerEvents: 'none', zIndex: 1 }}>
    {CORNERS.map((c, i) => {
      const { borderTop, borderLeft, borderRight, borderBottom, ...pos } = c
      return (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            ...pos,
            width: size,
            height: size,
            borderColor: color,
            borderStyle: 'solid',
            borderWidth: 0,
            ...(borderTop && { borderTopWidth: thickness }),
            ...(borderBottom && { borderBottomWidth: thickness }),
            ...(borderLeft && { borderLeftWidth: thickness }),
            ...(borderRight && { borderRightWidth: thickness }),
            filter: `drop-shadow(0 0 4px ${color})`,
            opacity: 0.85,
          }}
        />
      )
    })}
  </Box>
)

export default HudCorners

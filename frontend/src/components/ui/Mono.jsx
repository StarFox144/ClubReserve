import { Box } from '@mui/material'
import { font } from '../../design/tokens'

/** Inline monospace for numbers, prices, times and PC ids. */
const Mono = ({ children, component = 'span', sx, ...rest }) => (
  <Box component={component} sx={{ fontFamily: font.mono, fontVariantNumeric: 'tabular-nums', ...sx }} {...rest}>
    {children}
  </Box>
)

export default Mono

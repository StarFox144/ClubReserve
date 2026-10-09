import { useEffect, useState } from 'react'
import { Box } from '@mui/material'
import { prefersReducedMotion } from '../../design/tokens'

const GLYPHS = '!<>-_\\/[]{}—=+*^?#01ABCDEFЖШЩЮЯ'

/**
 * Decode effect (random glyphs resolve into the text), followed by an
 * optional subtle RGB-split glitch. Screen readers get the plain text.
 */
const GlitchText = ({ text, component = 'span', decode = true, glitch = true, duration = 1100, className = '', sx, ...rest }) => {
  const reduced = prefersReducedMotion()
  const [out, setOut] = useState(decode && !reduced ? '' : text)
  const [done, setDone] = useState(!decode || reduced)

  useEffect(() => {
    if (!decode || reduced) { setOut(text); setDone(true); return }
    let raf
    const start = performance.now()
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1)
      const revealed = Math.floor(p * text.length)
      let s = ''
      for (let i = 0; i < text.length; i++) {
        const ch = text[i]
        s += i < revealed || ch === ' ' || ch === '\n' ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0]
      }
      setOut(s)
      if (p < 1) raf = requestAnimationFrame(tick)
      else setDone(true)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [text, decode, duration, reduced])

  return (
    <Box component={component} aria-label={text} sx={{ whiteSpace: 'pre-line', ...sx }} {...rest}>
      <Box
        component="span"
        aria-hidden
        data-text={text}
        className={`${className}${glitch && done ? ' cr-glitch' : ''}`}
        sx={{ whiteSpace: 'pre-line' }}
      >
        {out}
      </Box>
    </Box>
  )
}

export default GlitchText

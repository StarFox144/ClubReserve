import { useEffect, useRef, useState } from 'react'
import { Box } from '@mui/material'

/** Fade + translateY on scroll into view. `delay` (ms) enables stagger. */
const Reveal = ({ children, delay = 0, component = 'div', sx, ...rest }) => {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') { setVisible(true); return }
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <Box
      ref={ref}
      component={component}
      className={`cr-reveal${visible ? ' is-visible' : ''}`}
      style={{ '--cr-delay': `${delay}ms` }}
      sx={sx}
      {...rest}
    >
      {children}
    </Box>
  )
}

export default Reveal

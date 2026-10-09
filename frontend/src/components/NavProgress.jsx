import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Box } from '@mui/material'
import { cr, tint } from '../design/tokens'

const NavProgress = () => {
  const location = useLocation()
  const [width, setWidth] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setWidth(0)
    setVisible(true)

    const t1 = setTimeout(() => setWidth(30),  20)
    const t2 = setTimeout(() => setWidth(65),  150)
    const t3 = setTimeout(() => setWidth(85),  400)
    const t4 = setTimeout(() => setWidth(100), 700)
    const t5 = setTimeout(() => setVisible(false), 1050)

    return () => [t1, t2, t3, t4, t5].forEach(clearTimeout)
  }, [location.pathname])

  if (!visible) return null

  return (
    <Box sx={{
      position: 'fixed',
      top: 0, left: 0,
      zIndex: 9999,
      height: 3,
      width: `${width}%`,
      background: `linear-gradient(90deg, ${cr.primary} 0%, ${cr.primary2} 40%, ${cr.cyan} 100%)`,
      boxShadow: `0 0 8px ${tint(cr.primary2, 90)}, 0 0 20px ${tint(cr.cyan, 40)}`,
      borderRadius: '0 3px 3px 0',
      transition: width === 0 ? 'none' : 'width 0.35s var(--cr-ease)',
      '&::after': {
        content: '""',
        position: 'absolute',
        right: 0, top: '50%',
        transform: 'translateY(-50%)',
        width: 6, height: 6,
        borderRadius: '50%',
        bgcolor: cr.cyan,
        boxShadow: `0 0 10px ${cr.cyan}, 0 0 20px ${cr.cyan}`,
      },
    }} />
  )
}

export default NavProgress

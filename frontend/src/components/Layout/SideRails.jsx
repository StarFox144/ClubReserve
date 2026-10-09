import { useEffect, useRef, useState } from 'react'
import { Box } from '@mui/material'
import { useLocation } from 'react-router-dom'
import { cr, font, tint } from '../../design/tokens'

const ROUTE_CODES = {
  '/': 'HOME', '/clubs': 'CATALOG', '/bookings': 'TICKETS', '/profile': 'PLAYER',
  '/admin': 'CONTROL', '/login': 'AUTH', '/register': 'AUTH',
}

const vertical = {
  writingMode: 'vertical-rl',
  fontFamily: font.mono,
  fontSize: '0.62rem',
  letterSpacing: '0.32em',
  textTransform: 'uppercase',
  color: cr.faint,
  whiteSpace: 'nowrap',
}

const Ticks = () => (
  <Box aria-hidden sx={{
    width: 10, flexGrow: 1, minHeight: 80,
    backgroundImage: `repeating-linear-gradient(to bottom, ${cr.border} 0 1px, transparent 1px 12px), repeating-linear-gradient(to bottom, ${cr.borderStrong} 0 1px, transparent 1px 60px)`,
    backgroundSize: '6px 100%, 10px 100%',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
  }} />
)

/**
 * Decorative HUD rails in the empty side gutters of wide screens:
 * left — system label + route code, right — live scroll progress.
 */
const SideRails = () => {
  const { pathname } = useLocation()
  const [progress, setProgress] = useState(0)
  const raf = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      cancelAnimationFrame(raf.current)
      raf.current = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight
        setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0)
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(raf.current) }
  }, [pathname])

  const code = ROUTE_CODES[pathname] || (pathname.startsWith('/clubs/') ? 'CLUB' : pathname.startsWith('/computers/') ? 'STATION' : 'NULL')
  const railSx = {
    position: 'fixed', top: 120, bottom: 40, zIndex: 3,
    display: 'none',
    '@media (min-width: 1680px)': { display: 'flex' },
    flexDirection: 'column', alignItems: 'center', gap: 2,
    pointerEvents: 'none',
  }

  return (
    <>
      <Box aria-hidden sx={{ ...railSx, left: 28 }}>
        <Box sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: cr.success, boxShadow: `0 0 10px ${cr.success}`, animation: 'cr-pulse 2s ease-out infinite', color: cr.success }} />
        <Box sx={vertical}>ClubReserve // sys.online</Box>
        <Ticks />
        <Box sx={{ ...vertical, color: cr.cyanText }}>{`> ${code}`}</Box>
        <Box sx={{ ...vertical }}>50.45°N · 30.52°E</Box>
      </Box>

      <Box aria-hidden sx={{ ...railSx, right: 28 }}>
        <Box sx={{ fontFamily: font.mono, fontSize: '0.62rem', color: cr.muted, letterSpacing: '0.1em' }}>
          {String(Math.round(progress * 100)).padStart(3, '0')}
        </Box>
        <Box sx={{ position: 'relative', width: 2, flexGrow: 1, borderRadius: 2, bgcolor: tint(cr.primary, 15) }}>
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: `${progress * 100}%`, borderRadius: 2, background: `linear-gradient(180deg, ${cr.primary2}, ${cr.cyan})`, boxShadow: `0 0 10px ${cr.cyan}` }} />
          <Box sx={{ position: 'absolute', left: '50%', top: `${progress * 100}%`, width: 10, height: 10, transform: 'translate(-50%, -50%) rotate(45deg)', border: `1px solid ${cr.cyan}`, bgcolor: cr.bg, boxShadow: `0 0 10px ${cr.cyan}` }} />
        </Box>
        <Box sx={vertical}>scroll</Box>
      </Box>
    </>
  )
}

export default SideRails

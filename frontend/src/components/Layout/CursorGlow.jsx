import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../../design/tokens'

/** Soft light following the mouse. Desktop pointers only; transform-only updates. */
const CursorGlow = () => {
  const ref = useRef(null)

  useEffect(() => {
    if (prefersReducedMotion() || !window.matchMedia?.('(pointer: fine)').matches) return
    const el = ref.current
    let raf = 0
    let x = 0
    let y = 0
    const onMove = (e) => {
      x = e.clientX; y = e.clientY
      if (!raf) raf = requestAnimationFrame(() => {
        raf = 0
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`
        el.classList.add('is-on')
      })
    }
    const onLeave = () => el.classList.remove('is-on')
    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('mouseleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      cancelAnimationFrame(raf)
    }
  }, [])

  return <div ref={ref} className="cr-cursor-glow" aria-hidden />
}

export default CursorGlow

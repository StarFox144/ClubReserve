import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../../design/tokens'

/** Animated counter that starts when visible; static under reduced motion. */
const CountUp = ({ target, suffix = '', prefix = '', duration = 1400, decimals = 0 }) => {
  const reduced = prefersReducedMotion()
  const [value, setValue] = useState(reduced ? target : 0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    if (reduced) { setValue(target); return }
    const el = ref.current
    if (!el) return
    let raf
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || started.current) return
      started.current = true
      const start = performance.now()
      const tick = (now) => {
        const t = Math.min((now - start) / duration, 1)
        setValue(target * (1 - Math.pow(1 - t, 3)))
        if (t < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }, { threshold: 0.1 })
    obs.observe(el)
    return () => { obs.disconnect(); cancelAnimationFrame(raf) }
  }, [target, duration, reduced])

  return <span ref={ref}>{prefix}{value.toFixed(decimals)}{suffix}</span>
}

export default CountUp
